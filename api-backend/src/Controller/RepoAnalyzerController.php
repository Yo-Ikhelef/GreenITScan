<?php

namespace App\Controller;

use GuzzleHttp\Exception\GuzzleException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;


#[Route('/api/github', name: 'github_')]
#[OA\Tag(name: "Github Repo Analyzer")]
class RepoAnalyzerController extends AbstractController
{
    #[OA\Post(
        description: "Analyse approfondie d'un dépôt GitHub pour Green IT",
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'repo_url', type: 'string', description: 'URL du dépôt GitHub à analyser')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Analyse réussie",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'repository', type: 'string'),
                        new OA\Property(property: 'report', type: 'object')
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Requête invalide",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'error', type: 'string')
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Erreur interne",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'error', type: 'string')
                    ]
                )
            )
        ]
    )]
    #[Route('/api/analyze', name: 'api_analyze', methods: ['POST'])]
    public function analyze(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $githubToken = $_ENV['TOKEN_GITHUB'] ?? '';

        if (!isset($data['repo_url'])) {
            return new JsonResponse(['error' => 'repo_url est requis'], 400);
        }

        $repoUrl = $data['repo_url'];
        $matches = [];
        if (!preg_match('#github\.com/([^/]+)/([^/]+)#', $repoUrl, $matches)) {
            return new JsonResponse(['error' => 'URL de dépôt GitHub invalide'], 400);
        }
        $owner = $matches[1];
        $repo = $matches[2];

        $client = new \GuzzleHttp\Client();

        try {
            $repoResponse = $client->request('GET', "https://api.github.com/repos/$owner/$repo", [
                'headers' => [
                    'Accept' => 'application/vnd.github.v3+json',
                    'User-Agent' => 'GreenITAnalyzer',
                    'Authorization' => 'token ' . $githubToken,
                ],
            ]);
            $repoData = json_decode($repoResponse->getBody(), true);

            $treeResponse = $client->request('GET', "https://api.github.com/repos/$owner/$repo/git/trees/HEAD?recursive=1", [
                'headers' => [
                    'Accept' => 'application/vnd.github.v3+json',
                    'User-Agent' => 'GreenITAnalyzer',
                    'Authorization' => 'token ' . $githubToken,
                ],
            ]);
            $treeData = json_decode($treeResponse->getBody(), true);
            $files = $treeData['tree'] ?? [];
        } catch (GuzzleException $e) {
            return new JsonResponse(['error' => 'Erreur lors de la récupération du dépôt ou des fichiers : ' . $e->getMessage()], 500);
        }

        $fileCount = count($files);
        $jsFiles = count(array_filter($files, fn($f) => str_ends_with($f['path'], '.js')));
        $tsFiles = count(array_filter($files, fn($f) => str_ends_with($f['path'], '.ts')));
        $phpFiles = count(array_filter($files, fn($f) => str_ends_with($f['path'], '.php')));
        $vueFiles = count(array_filter($files, fn($f) => str_ends_with($f['path'], '.vue')));
        $ecoConfig = count(array_filter($files, fn($f) => preg_match('/\.ecoindex\.yml|\.editorconfig/', $f['path'])));
        $totalSize = array_sum(array_map(fn($f) => $f['size'] ?? 0, $files));

        $jsonFiles = array_filter($files, fn($f) => str_ends_with($f['path'], '.json'));
        $jsonContents = [];
        foreach ($jsonFiles as $file) {
            $contentResponse = $client->request('GET', "https://api.github.com/repos/$owner/$repo/contents/{$file['path']}", [
                'headers' => [
                    'Accept' => 'application/vnd.github.v3+json',
                    'User-Agent' => 'GreenITAnalyzer',
                    'Authorization' => 'token ' . $githubToken,
                ],
            ]);
            $contentData = json_decode($contentResponse->getBody(), true);
            $decoded = base64_decode($contentData['content']);
            $jsonContents[$file['path']] = json_decode($decoded, true);
        }

        $dependencyAdvices = $this->analyzeDependenciesGreenIT($jsonContents);
        $heavyFiles = $this->findHeavyFiles($files);
        $buildScriptAdvices = $this->analyzeBuildScripts($jsonContents);

        $assets = $this->analyzeAssets($files);
        $readme = $this->checkReadme($files);
        $workflows = $this->checkWorkflows($files);
        $co2 = $this->estimateCO2($totalSize);
        $deepCodeAdvices = $this->deepCodeAnalysis($files, $owner, $repo, $githubToken);

        $report = [
            'name' => $repoData['name'],
            'owner' => $repoData['owner']['login'],
            'description' => $repoData['description'] ?? 'Aucune description',
            'stars' => $repoData['stargazers_count'] ?? 0,
            'forks' => $repoData['forks_count'] ?? 0,
            'open_issues' => $repoData['open_issues_count'] ?? 0,
            'language' => $repoData['language'] ?? 'Inconnu',
            'created_at' => date('Y-m-d H:i:s', strtotime($repoData['created_at'])),
            'updated_at' => date('Y-m-d H:i:s', strtotime($repoData['updated_at'])),
            'file_count' => $fileCount,
            'js_file_count' => $jsFiles,
            'ts_file_count' => $tsFiles,
            'php_file_count' => $phpFiles,
            'vue_file_count' => $vueFiles,
            'eco_config_present' => $ecoConfig > 0,
            'total_size_bytes' => $totalSize,
            'heavy_files' => $heavyFiles,
            'dependency_advice' => $dependencyAdvices,
            'build_script_advice' => $buildScriptAdvices,
            'deep_code_advice' => $deepCodeAdvices,
            'assets' => $assets,
            'readme' => $readme,
            'workflows' => $workflows,
        ];

        // Génère le conseil principal sans concaténer la liste des fichiers
        $greenItAdvices = array_merge(
            $dependencyAdvices,
            $buildScriptAdvices,
            [$this->generateGreenITAdvice($report, $fileCount, $totalSize, $ecoConfig)]
        );


        // Puis ajoutez le conseil au rapport
        $report['green_it_advice'] = $greenItAdvices;

        $report = array_merge($report, $assets, $readme, $workflows, [
            'co2_estimate_g' => $co2,
        ]);



        $ecoScore = $this->computeEcoScore($report);
        $report['eco_score'] = $ecoScore['eco_score'];
        $report['debt_ratio'] = $ecoScore['debt_ratio'];
        $report['recommendations'] = $ecoScore['recommendations'];

        return new JsonResponse([
            'repository' => $repoUrl,
            'greenit_report' => $report,
        ]);
    }


    // Analyse Green IT des dépendances
    private function analyzeDependenciesGreenIT(array $jsonContents): array
    {
        $advice = [];

        if (isset($jsonContents['package.json']['dependencies'])) {
            foreach ($jsonContents['package.json']['dependencies'] as $dep => $version) {
                // Exemple : conseils Green IT sur les dépendances
                if (in_array($dep, ['lodash', 'moment', 'jquery'])) {
                    $advice[] = "La dépendance `$dep` est connue pour être lourde : envisagez une alternative plus légère ou native.";
                }
                if (preg_match('/^@babel|webpack|gulp|grunt/', $dep)) {
                    $advice[] = "Optimisez l’utilisation de `$dep` pour réduire la taille des bundles générés.";
                }
                // Suggestion si la version est ancienne
                if (preg_match('/^\d+\.\d+\.\d+$/', $version) && version_compare($version, '2.0.0', '<')) {
                    $advice[] = "La dépendance `$dep` utilise une version ancienne : mettez à jour pour profiter d’optimisations récentes.";
                }
            }
        }
        // Idem pour composer.json si besoin
        if (isset($jsonContents['composer.json']['require'])) {
            foreach ($jsonContents['composer.json']['require'] as $dep => $version) {
                if (preg_match('/symfony\/|laravel\/|cakephp\//', $dep)) {
                    $advice[] = "Vérifiez que `$dep` est utilisé de façon optimale pour limiter la consommation de ressources.";
                }
            }
        }
        return $advice;
    }

    // Détection des fichiers volumineux
    private function findHeavyFiles(array $files, int $threshold = 500 * 1024): array
    {
        return array_map(fn($f) => $f['path'], array_filter($files, fn($f) => ($f['size'] ?? 0) > $threshold));
    }

    // Analyse des scripts de build/dev
    private function analyzeBuildScripts(array $jsonContents): array
    {
        $advice = [];
        if (isset($jsonContents['package.json']['scripts'])) {
            $scripts = $jsonContents['package.json']['scripts'];
            if (!isset($scripts['build']) || !preg_match('/(webpack|vite|rollup|minify)/i', $scripts['build'])) {
                $advice[] = "Ajoutez ou optimisez le script de build pour réduire la taille des bundles.";
            }
            if (!isset($scripts['dev']) || !preg_match('/(hot|watch)/i', $scripts['dev'])) {
                $advice[] = "Optimisez le script de développement pour limiter la consommation de ressources.";
            }
        }
        return $advice;
    }

    // Ajout dans RepoAnalyzerController
    private function analyzeAssets(array $files): array
    {
        $images = array_filter($files, fn($f) => preg_match('/\.(jpg|jpeg|png|gif|webp|avif)$/i', $f['path']));
        $totalImageSize = array_sum(array_map(fn($f) => $f['size'] ?? 0, $images));
        $avgImageSize = count($images) ? $totalImageSize / count($images) : 0;
        $optimizedFormats = array_filter($images, fn($f) => preg_match('/\.(webp|avif)$/i', $f['path']));
        return [
            'image_count' => count($images),
            'avg_image_size' => $avgImageSize,
            'optimized_format_count' => count($optimizedFormats),
        ];
    }

    private function checkReadme(array $files): array
    {
        $readme = array_filter($files, fn($f) => strtolower($f['path']) === 'readme.md');
        return [
            'readme_present' => !empty($readme),
        ];
    }

    private function checkWorkflows(array $files): array
    {
        $workflows = array_filter($files, fn($f) => preg_match('#^\.github/workflows/.*\.yml$#i', $f['path']));
        return [
            'workflow_count' => count($workflows),
        ];
    }


    private function deepCodeAnalysis(array $files, string $owner, string $repo, string $githubToken): array
    {
        $advice = [];
        $client = new \GuzzleHttp\Client();

        foreach ($files as $file) {
            if (preg_match('/\.(js|ts|php|vue)$/', $file['path'])) {
                try {
                    $contentResponse = $client->request('GET', "https://api.github.com/repos/$owner/$repo/contents/{$file['path']}", [
                        'headers' => [
                            'Accept' => 'application/vnd.github.v3+json',
                            'User-Agent' => 'GreenITAnalyzer',
                            'Authorization' => 'token ' . $githubToken,
                        ],
                    ]);
                    $contentData = json_decode($contentResponse->getBody(), true);
                    $code = base64_decode($contentData['content']);

                    // Boucles imbriquées
                    if (preg_match('/for\s*\(.*\)\s*{[^}]*for\s*\(.*\)/s', $code)) {
                        $advice[] = "Boucles imbriquées détectées dans `{$file['path']}` : optimisez pour réduire la consommation.";
                    }
                    // Requêtes réseau répétées
                    if (preg_match('/fetch|axios|curl|file_get_contents/', $code) && preg_match_all('/fetch|axios|curl|file_get_contents/', $code) > 3) {
                        $advice[] = "Plusieurs requêtes réseau dans `{$file['path']}` : pensez au cache ou à la mutualisation.";
                    }
                    // Absence de cache (PHP)
                    if (str_ends_with($file['path'], '.php') && !preg_match('/cache|opcache|memcached|redis/', $code)) {
                        $advice[] = "Aucun mécanisme de cache détecté dans `{$file['path']}` : ajoutez un cache pour améliorer l’efficacité.";
                    }
                } catch (\Exception $e) {
                    // Ignore les erreurs de récupération de contenu
                }
            }
        }
        return $advice;
    }

    private function estimateCO2(int $totalSize, int $buildCount = 1): float
    {
        // Estimation simple : 0.2g CO₂ par Mo stocké + 0.5g par build
        return ($totalSize / 1024 / 1024) * 0.2 + $buildCount * 0.5;
    }

    private function computeEcoScore(array $report): array
    {
        $score = 80;
        $reco = [];
        if ($report['avg_image_size'] > 1024 * 1024) {
            $score -= 10;
            $reco[] = "Réduisez les images lourdes > 1 Mo";
        }
        if (!$report['eco_config_present']) {
            $score -= 10;
            $reco[] = "Ajoutez un fichier d'éco-conception";
        }
        $debt = $score < 60 ? "C" : ($score < 80 ? "B" : "A");
        return [
            'eco_score' => $score,
            'debt_ratio' => $debt,
            'recommendations' => $reco,
        ];
    }

    // Conseils Green IT génériques
    private function generateGreenITAdvice(array $repo, int $fileCount, int $totalSize, int $ecoConfig): array
    {
        $advice = [];
        if ($repo['language'] === 'JavaScript' && $repo['js_file_count'] > 50) {
            $advice[] = "Considérez l'utilisation de TypeScript pour une meilleure maintenabilité.";
        }

        if ($repo['language'] === 'PHP' && $repo['php_file_count'] > 50) {
            $advice[] = "Utilisez des outils de cache comme OPcache pour améliorer les performances.";
        }

        if ($repo['language'] === 'Vue.js' && $repo['vue_file_count'] > 20) {
            $advice[] = "Optimisez les composants Vue pour réduire la taille des bundles.";
        }

        if ($repo['stars'] > 1000) {
            $advice[] = "Considérez l'impact de la popularité du dépôt sur les ressources utilisées.";
        }

        if ($repo['forks'] > 100) {
            $advice[] = "Un grand nombre de forks peut indiquer une forte utilisation, optimisez le code pour réduire l'empreinte carbone.";
        }

        if ($repo['open_issues'] > 50) {
            $advice[] = "Un grand nombre de problèmes ouverts peut indiquer une dette technique à réduire.";
        }

        if ($repo['created_at'] < date('Y-m-d', strtotime('-2 years'))) {
            $advice[] = "Considérez la mise à jour des dépendances obsolètes pour améliorer la sécurité et les performances.";
        }

        if ($repo['updated_at'] < date('Y-m-d', strtotime('-6 months'))) {
            $advice[] = "Le dépôt n'a pas été mis à jour récemment, envisagez de le maintenir actif.";
        }

        if ($repo['language'] === 'JavaScript' && $repo['js_file_count'] > 100) {
            $advice[] = "Réduisez le nombre de fichiers JavaScript pour améliorer la performance.";
        }

        if ($repo['language'] === 'TypeScript' && $repo['ts_file_count'] > 50) {
            $advice[] = "Utilisez des types pour améliorer la maintenabilité du code TypeScript.";
        }

        if ($repo['language'] === 'PHP' && $repo['php_file_count'] > 50) {
            $advice[] = "Utilisez des namespaces pour organiser le code PHP.";
        }

        if ($repo['language'] === 'Vue.js' && $repo['vue_file_count'] > 20) {
            $advice[] = "Utilisez des lazy loading pour les composants Vue pour améliorer les performances.";
        }

        if ($repo['language'] === 'Python' && $repo['file_count'] > 100) {
            $advice[] = "Considérez l'utilisation de virtualenv pour isoler les dépendances Python.";
        }

        if ($fileCount > 200) {
            $advice[] = "Réduisez le nombre de fichiers pour limiter la complexité.";
        }
        if ($totalSize > 5 * 1024 * 1024) {
            $advice[] = "Réduisez la taille totale du code source.";
        }
        if (!$ecoConfig) {
            $advice[] = "Ajoutez un fichier de configuration d'éco-conception (ex: .ecoindex.yml).";
        }
        if ($advice) {
            return $advice;
        }
        else {
            return ["Aucun conseil spécifique à fournir pour ce dépôt. Bonne pratique de développement !"];
        }
    }
}
