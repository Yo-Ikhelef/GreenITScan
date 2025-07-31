<?php

namespace App\Controller;

use App\Model\SimulatorRequest;
use App\Service\CarbonFootprintCalculator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;
use App\Entity\Simulation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Service\SimulationNormalizer;
use Symfony\Component\Security\Core\User\UserInterface;

#[IsGranted('ROLE_USER')]
#[Route('/api/simulation', name: 'simulation_')]
#[OA\Tag(name: "Simulation")]
class SimulationController extends AbstractController
{
    #[OA\Post(
        summary: 'Simulate carbon footprint',
        requestBody: new OA\RequestBody(
            content: [
                'application/json' => new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'emailSimple', type: 'integer', example: 2, description: "Nombre d'emails envoyés sans pièce jointe par jour"),
                        new OA\Property(property: 'emailPJ', type: 'integer', example: 1, description: "Nombre d'emails envoyés avec pièce jointe (1Mo) par jour"),
                        new OA\Property(property: 'webHours', type: 'integer', example: 2, description: "Nombre d’heures passées à naviguer sur Internet par jour"),
                        new OA\Property(property: 'streamingVideo', type: 'integer', example: 5, description: "Nombre d'heures de streaming vidéo HD par semaine"),
                        new OA\Property(property: 'streamingAudio', type: 'integer', example: 60, description: "Nombre de minutes de musique en streaming par jour"),
                        new OA\Property(property: 'videoConf', type: 'integer', example: 3, description: "Nombre d'heures de visioconférences HD par semaine"),
                        new OA\Property(property: 'pcCount', type: 'integer', example: 1, description: "Nombre d’ordinateurs portables utilisés cette année"),
                        new OA\Property(property: 'smartphoneCount', type: 'integer', example: 1, description: "Nombre de smartphones utilisés cette année"),
                        new OA\Property(property: 'consoleCount', type: 'integer', example: 0, description: "Nombre de consoles de jeu utilisées cette année"),
                        new OA\Property(property: 'cloudAccounts', type: 'integer', example: 5, description: "Nombre de comptes de services cloud professionnels ou d'hébergement utilisés (ex. : Dropbox, Drive, OVH…)"),
                    ]
                )
            ]
        ),
        responses: [
                new OA\Response(
                response: 200,
                
                description: 'Résultat de la simulation (émission totale, équivalents arbres/voiture, détails)',
                content: new OA\JsonContent(
                    type: 'object',
                    title: 'SimulationResult',
                    properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 2),
                        new OA\Property(property: 'totalGCo2e', type: 'number', example: 260829),
                        new OA\Property(property: 'totalKg', type: 'number', example: 260.83),
                        new OA\Property(property: 'treeEquivalent', type: 'integer', example: 10),
                        new OA\Property(property: 'carKmEquivalent', type: 'integer', example: 2),
                        new OA\Property(
                            property: 'details',
                            type: 'array',
                            items: new OA\Items(
                                type: 'object',
                                properties: [
                                    new OA\Property(property: 'key', type: 'string', example: 'email'),
                                    new OA\Property(property: 'label', type: 'string', example: 'Email envoyé'),
                                    new OA\Property(property: 'value', type: 'number', example: 2),
                                    new OA\Property(property: 'total', type: 'number', example: 219),
                                    new OA\Property(
                                        property: 'factor',
                                        type: 'object',
                                        properties: [
                                            new OA\Property(property: 'type', type: 'string', example: 'usage'),
                                            new OA\Property(property: 'unit', type: 'string', example: 'mail'),
                                            new OA\Property(property: 'emission_gco2e', type: 'number', example: 0.3),
                                            new OA\Property(property: 'frequency', type: 'string', example: 'daily'),
                                            new OA\Property(property: 'source', type: 'string', example: 'ImpactCO2.fr / CarbonLiteracy.com'),
                                        ]
                                    ),
                                ]
                            )
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Requête invalide",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "error", type: "string", example: "Invalid JSON payload")
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Identifiants invalides",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "error", type: "string", example: "Identifiants invalides")
                    ]
                )
            )
        ]
    )]
    #[Route('/new', name: 'simulation_new', methods: ['POST'])]
    public function simulate(Request $request, CarbonFootprintCalculator $calculator, EntityManagerInterface $em, SimulationNormalizer $normalizer, UserInterface $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON payload'], 400);
        }

        $simRequest = new SimulatorRequest(
            emailSimple: (int) ($data['emailSimple'] ?? 0),
            emailPJ: (int) ($data['emailPJ'] ?? 0),
            webHours: (int) ($data['webHours'] ?? 0),
            streamingVideo: (int) ($data['streamingVideo'] ?? 0),
            streamingAudio: (int) ($data['streamingAudio'] ?? 0),
            videoConf: (int) ($data['videoConf'] ?? 0),
            pcCount: (int) ($data['pcCount'] ?? 0),
            smartphoneCount: (int) ($data['smartphoneCount'] ?? 0),
            consoleCount: (int) ($data['consoleCount'] ?? 0),
            cloudAccounts: (int) ($data['cloudAccounts'] ?? 0),
        );

        $result = $calculator->calculate($simRequest);

        // Persist simulation
        $simulation = new Simulation();
        $simulation->setUser($user);
        $simulation->setTotalGCo2e($result->getTotalGcoe2());
        $simulation->setTotalKg($result->getTotalKg());
        $simulation->setDetails($result->details);

        $em->persist($simulation);
        $em->flush();

        return $this->json($normalizer->normalize($simulation));
    }
}
