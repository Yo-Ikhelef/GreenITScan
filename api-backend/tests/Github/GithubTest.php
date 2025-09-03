<?php

declare(strict_types=1);

namespace App\Tests\Github;

use App\Controller\RepoAnalyzerController;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request as GuzzleRequest;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use ReflectionClass;

final class GithubTest extends TestCase
{
    private function makeClientFromMock(MockHandler $mock): ClientInterface
    {
        $handler = HandlerStack::create($mock);
        return new Client(['handler' => $handler]);
    }

    private function makeController(MockHandler $mock, string $token = 'fake_token'): RepoAnalyzerController
    {
        $client = $this->makeClientFromMock($mock);
        return new RepoAnalyzerController($client, $token);
    }

    public function testAnalyzeReturns400WhenRepoUrlMissing(): void
    {
        $controller = $this->makeController(new MockHandler([]));
        $symfonyRequest = new Request(content: json_encode([]));

        $resp = $controller->analyze($symfonyRequest);
        $this->assertInstanceOf(JsonResponse::class, $resp);
        $this->assertSame(400, $resp->getStatusCode());

        $payload = json_decode($resp->getContent(), true);
        $this->assertSame('repo_url est requis', $payload['error']);
    }

    public function testAnalyzeReturns400WhenRepoUrlInvalid(): void
    {
        $controller = $this->makeController(new MockHandler([]));
        $symfonyRequest = new Request(content: json_encode(['repo_url' => 'https://example.com/not-github']));

        $resp = $controller->analyze($symfonyRequest);
        $this->assertSame(400, $resp->getStatusCode());
        $payload = json_decode($resp->getContent(), true);
        $this->assertSame('URL de dépôt GitHub invalide', $payload['error']);
    }

    public function testAnalyzeReturns500WhenGithubErrors(): void
    {
        $mock = new MockHandler([
            new RequestException('Boom', new GuzzleRequest('GET', 'test')), // first call: repo API fails
        ]);
        $controller = $this->makeController($mock);
        $symfonyRequest = new Request(content: json_encode([
            'repo_url' => 'https://github.com/acme/demo'
        ]));

        $resp = $controller->analyze($symfonyRequest);
        $this->assertSame(500, $resp->getStatusCode());
        $payload = json_decode($resp->getContent(), true);
        $this->assertStringContainsString('Erreur lors de la récupération du dépôt ou des fichiers', $payload['error']);
        $this->assertStringContainsString('Boom', $payload['error']);
    }

    public function testAnalyzeSuccessHappyPath(): void
    {
        // --- Mock GitHub responses in the order the controller calls them ---

        // 1) GET /repos/{owner}/{repo}
        $repoBody = [
            'name' => 'demo',
            'owner' => ['login' => 'acme'],
            'description' => 'Demo repo',
            'stargazers_count' => 123,
            'forks_count' => 10,
            'open_issues_count' => 2,
            'language' => 'JavaScript',
            'created_at' => '2023-01-01T00:00:00Z',
            'updated_at' => '2025-01-01T12:00:00Z',
        ];

        // 2) GET /git/trees/HEAD?recursive=1
        // include a few files with sizes to exercise logic
        $treeBody = [
            'tree' => [
                ['path' => 'src/index.js', 'size' => 3000, 'type' => 'blob'],
                ['path' => 'src/heavy.js', 'size' => 600000, 'type' => 'blob'],
                ['path' => 'src/App.vue', 'size' => 2000, 'type' => 'blob'],
                ['path' => 'src/main.ts', 'size' => 2500, 'type' => 'blob'],
                ['path' => 'README.md', 'size' => 100, 'type' => 'blob'],
                ['path' => '.github/workflows/ci.yml', 'size' => 100, 'type' => 'blob'],
                ['path' => '.editorconfig', 'size' => 80, 'type' => 'blob'],
                ['path' => 'public/logo.png', 'size' => 500000, 'type' => 'blob'],
                ['path' => 'package.json', 'size' => 350, 'type' => 'blob'],
                ['path' => 'composer.json', 'size' => 350, 'type' => 'blob'],
                ['path' => 'node_modules/leftpad/index.js', 'size' => 1000, 'type' => 'blob'],
                ['path' => 'vendor/symfony/http-foundation/Request.php', 'size' => 2000, 'type' => 'blob'],
            ],
        ];

        // 3) GET /contents/package.json
        $packageJson = base64_encode(json_encode([
            'dependencies' => [
                'lodash' => '1.0.0',
                '@babel/core' => '^7.0.0'
            ],
            'scripts' => [
                'build' => 'vite build',
                'dev' => 'vite'
            ],
        ]));

        // 4) GET /contents/composer.json
        $composerJson = base64_encode(json_encode([
            'require' => [
                'symfony/symfony' => '^6.4'
            ]
        ]));

        // 5) Deep code analysis will read each .js/.ts/.php/.vue file content.
        // Return minimal content with a nested for loop once to trigger advice, and some fetch occurrences.
        $codeFileContent = base64_encode(<<<'CODE'
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            // nested loop
          }
        }
        fetch('/a'); fetch('/b'); fetch('/c'); fetch('/d');
        CODE);

        $mock = new MockHandler([
            new Response(200, [], json_encode($repoBody)),
            new Response(200, [], json_encode($treeBody)),
            // contents for package.json
            new Response(200, [], json_encode(['content' => $packageJson])),
            // contents for composer.json
            new Response(200, [], json_encode(['content' => $composerJson])),
            // contents for src/index.js
            new Response(200, [], json_encode(['content' => $codeFileContent])),
            // contents for src/heavy.js
            new Response(200, [], json_encode(['content' => $codeFileContent])),
            // contents for src/App.vue
            new Response(200, [], json_encode(['content' => $codeFileContent])),
            // contents for src/main.ts
            new Response(200, [], json_encode(['content' => $codeFileContent])),
        ]);

        $controller = $this->makeController($mock);
        $symfonyRequest = new Request(content: json_encode([
            'repo_url' => 'https://github.com/acme/demo'
        ]));

        $resp = $controller->analyze($symfonyRequest);
        $this->assertSame(200, $resp->getStatusCode());

        $payload = json_decode($resp->getContent(), true);

        $this->assertArrayHasKey('repository', $payload);
        $this->assertSame('https://github.com/acme/demo', $payload['repository']);
        $this->assertArrayHasKey('greenit_report', $payload);

        $report = $payload['greenit_report'];

        // Basic repo info propagated
        $this->assertSame('demo', $report['name']);
        $this->assertSame('acme', $report['owner']);
        $this->assertSame('JavaScript', $report['language']);

        // Counts derived from tree
        $this->assertSame(12, $report['file_count']);
        $this->assertSame(3, $report['js_file_count']);
        $this->assertSame(1, $report['ts_file_count']);
        $this->assertSame(1, $report['vue_file_count']);
        $this->assertSame(true, $report['eco_config_present']); // .editorconfig

        // Heavy files detection
        $this->assertContains('src/heavy.js', $report['heavy_files']);

        // Assets analysis merged
        $this->assertArrayHasKey('image_count', $report);
        $this->assertSame(1, $report['image_count']);
        $this->assertArrayHasKey('avg_image_size', $report);
        

        // Eco score computed
        $this->assertArrayHasKey('eco_score', $report);
        $this->assertArrayHasKey('debt_ratio', $report);
        $this->assertArrayHasKey('recommendations', $report);

        // Green-IT advice list not empty
        $this->assertArrayHasKey('green_it_advice', $report);
        $this->assertIsArray($report['green_it_advice']);
    }

    public function testFindHeavyFilesPrivateHelper(): void
    {
        $controller = $this->makeController(new MockHandler([]));
        $ref = new ReflectionClass($controller);
        $method = $ref->getMethod('findHeavyFiles');
        $method->setAccessible(true);

        $files = [
            ['path' => 'a.txt', 'size' => 10],
            ['path' => 'big.bin', 'size' => 600 * 1024], // 600KB > 500KB threshold
        ];

        /** @var array $result */
        $result = $method->invoke($controller, $files, 500 * 1024);
        $this->assertEqualsCanonicalizing(['big.bin'], $result);
    }

    public function testComputeEcoScorePrivateHelper(): void
    {
        $controller = $this->makeController(new MockHandler([]));
        $ref = new ReflectionClass($controller);
        $method = $ref->getMethod('computeEcoScore');
        $method->setAccessible(true);

        $report = [
            'avg_image_size' => 2 * 1024 * 1024, // 2MB -> penalty
            'eco_config_present' => false,       // -> penalty
        ];

        /** @var array $eco */
        $eco = $method->invoke($controller, $report);
        $this->assertSame(60, $eco['eco_score']);      // 80 -10 -10
        $this->assertSame('B', $eco['debt_ratio']);    // 60..79 -> B
        $this->assertNotEmpty($eco['recommendations']);
    }
}
