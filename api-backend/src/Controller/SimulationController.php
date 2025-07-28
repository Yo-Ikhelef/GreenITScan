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
                    properties: [
                        new OA\Property(property: 'emailSimple', type: 'integer'),
                        new OA\Property(property: 'emailPJ', type: 'integer'),
                        new OA\Property(property: 'webQueries', type: 'integer'),
                        new OA\Property(property: 'streamingVideo', type: 'integer'),
                        new OA\Property(property: 'streamingAudio', type: 'integer'),
                        new OA\Property(property: 'videoConf', type: 'integer'),
                        new OA\Property(property: 'pcCount', type: 'integer'),
                        new OA\Property(property: 'smartphoneCount', type: 'integer'),
                        new OA\Property(property: 'consoleCount', type: 'integer'),
                        new OA\Property(property: 'cloudCount', type: 'integer'),
                    ]
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Simulation result',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'totalKg', type: 'number'),
                        new OA\Property(property: 'treeEquivalent', type: 'number'),
                        new OA\Property(property: 'carKmEquivalent', type: 'number'),
                        new OA\Property(property: 'details', type: 'array', items: new OA\Items(type: 'object'))
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Invalid input')
        ]
    )]
    #[Route('/simulation', name: 'simulation', methods: ['POST'])]
    // public function simulate(Request $request, CarbonFootprintCalculator $calculator): JsonResponse
    // {
    //     $data = json_decode($request->getContent(), true);

    //     if (!is_array($data)) {
    //         return $this->json(['error' => 'Invalid JSON payload'], 400);
    //     }

    //     $simRequest = new SimulatorRequest(
    //         emailSimple: (int) ($data['emailSimple'] ?? 0),
    //         emailPJ: (int) ($data['emailPJ'] ?? 0),
    //         webQueries: (int) ($data['webQueries'] ?? 0),
    //         streamingVideo: (int) ($data['streamingVideo'] ?? 0),
    //         streamingAudio: (int) ($data['streamingAudio'] ?? 0),
    //         videoConf: (int) ($data['videoConf'] ?? 0),
    //         pcCount: (int) ($data['pcCount'] ?? 0),
    //         smartphoneCount: (int) ($data['smartphoneCount'] ?? 0),
    //         consoleCount: (int) ($data['consoleCount'] ?? 0),
    //         cloudCount: (int) ($data['cloudCount'] ?? 0),
    //     );

    //     $result = $calculator->calculate($simRequest);

    //     return $this->json([
    //         'totalKg' => round($result->getTotalKg(), 2),
    //         'treeEquivalent' => $result->getTreeEquivalence(),
    //         'carKmEquivalent' => $result->getCarKmEquivalence(),
    //         'details' => $result->details,
    //     ]);
    // }
    public function simulate(Request $request, CarbonFootprintCalculator $calculator, EntityManagerInterface $em, SimulationNormalizer $normalizer, UserInterface $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['error' => 'Invalid JSON payload'], 400);
        }

        $simRequest = new SimulatorRequest(
            emailSimple: (int) ($data['emailSimple'] ?? 0),
            emailPJ: (int) ($data['emailPJ'] ?? 0),
            webQueries: (int) ($data['webQueries'] ?? 0),
            streamingVideo: (int) ($data['streamingVideo'] ?? 0),
            streamingAudio: (int) ($data['streamingAudio'] ?? 0),
            videoConf: (int) ($data['videoConf'] ?? 0),
            pcCount: (int) ($data['pcCount'] ?? 0),
            smartphoneCount: (int) ($data['smartphoneCount'] ?? 0),
            consoleCount: (int) ($data['consoleCount'] ?? 0),
            cloudCount: (int) ($data['cloudCount'] ?? 0),
        );

        $result = $calculator->calculate($simRequest);

        // Persist simulation
        $simulation = new Simulation();
        $simulation->setUser($user);
        $simulation->setTotalKg($result->getTotalKg());
        $simulation->setDetails($result->details);

        $em->persist($simulation);
        $em->flush();

        return $this->json($normalizer->normalize($simulation));
    }
}
