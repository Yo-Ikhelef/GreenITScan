<?php

// namespace App\Service;

// use App\Model\SimulatorRequest;
// use App\Model\SimulatorResult;
// use App\Service\Provider\CarbonFactorProvider;

// class CarbonFootprintCalculator
// {
//     public function __construct(
//         private CarbonFactorProvider $factorProvider
//     ) {}

//     public function calculate(SimulatorRequest $request): SimulatorResult
//     {
//         $total = 0;
//         $details = [];

//         // Liste des usages avec mapping vers le champ du DTO
//         $usages = [
//             ['key' => 'email', 'type' => 'usage', 'value' => $request->emailSimple],
//             ['key' => 'email_pj', 'type' => 'usage', 'value' => $request->emailPJ],
//             ['key' => 'navigation_web', 'type' => 'usage', 'value' => $request->webQueries],
//             ['key' => 'streaming_video', 'type' => 'usage', 'value' => $request->streamingVideo],
//             ['key' => 'streaming_audio', 'type' => 'usage', 'value' => $request->streamingAudio],
//             ['key' => 'visioconference', 'type' => 'usage', 'value' => $request->videoConf],
//             ['key' => 'pc', 'type' => 'fabrication', 'value' => $request->pcCount],
//             ['key' => 'smartphone', 'type' => 'fabrication', 'value' => $request->smartphoneCount],
//             ['key' => 'console', 'type' => 'fabrication', 'value' => $request->consoleCount],
//             ['key' => 'cloud_service', 'type' => 'usage', 'value' => $request->cloudCount],
//         ];

//         foreach ($usages as $usage) {
//             $factor = $this->factorProvider->getFactor($usage['key'], $usage['type']);
//             $normalizedValue = $this->normalizeUsage($usage['value'], $factor['frequency']);
//             $emission = $normalizedValue * $factor['emission_gco2e'];
//             $total += $emission;

//             $details[] = $this->buildDetail($factor, $usage['value'], $emission, $usage['type'], $usage['key']);
//         }

//         return new SimulatorResult($total, $details);
//     }

//     private function normalizeUsage(float|int $rawValue, string $frequency): float
//     {
//         return match ($frequency) {
//             'daily' => $rawValue * 365,
//             'weekly' => $rawValue * 52,
//             'yearly' => $rawValue,
//             default => throw new \InvalidArgumentException("Unknown frequency '$frequency'")
//         };
//     }
    
//     private function buildDetail(array $factor, float|int $userValue, float $emission, string $type, string $key): array
//     {
//         return [
//             'key' => $key,
//             'label' => $factor['label'],
//             'value' => $userValue,
//             'total' => round($emission, 2), // gCO₂e
//             'factor' => [
//                 'type' => $type,
//                 'unit' => $factor['unit'],
//                 'emission_gco2e' => $factor['emission_gco2e'],
//                 'frequency' => $factor['frequency'],
//                 'source' => $factor['source'],
//             ]
//         ];
//     }

// }

namespace App\Service;

use App\Model\SimulatorRequest;
use App\Model\SimulatorResult;
use App\Service\Provider\CarbonFactorProvider;

class CarbonFootprintCalculator
{
    public function __construct(
        private CarbonFactorProvider $factorProvider
    ) {}

    public function calculate(SimulatorRequest $request): SimulatorResult
    {
        $total = 0;
        $details = [];

        $usages = [
            ['key' => 'email', 'type' => 'usage', 'value' => $request->emailSimple],
            ['key' => 'email_pj', 'type' => 'usage', 'value' => $request->emailPJ],
            ['key' => 'navigation_web', 'type' => 'usage', 'value' => $request->webQueries],
            ['key' => 'streaming_video', 'type' => 'usage', 'value' => $request->streamingVideo],
            ['key' => 'streaming_audio', 'type' => 'usage', 'value' => $request->streamingAudio],
            ['key' => 'visioconference', 'type' => 'usage', 'value' => $request->videoConf],
            ['key' => 'pc', 'type' => 'fabrication', 'value' => $request->pcCount],
            ['key' => 'smartphone', 'type' => 'fabrication', 'value' => $request->smartphoneCount],
            ['key' => 'console', 'type' => 'fabrication', 'value' => $request->consoleCount],
            ['key' => 'cloud_service', 'type' => 'usage', 'value' => $request->cloudCount],
        ];

        foreach ($usages as $usage) {
            $key = $usage['key'];
            $type = $usage['type'];
            $rawValue = $usage['value'];

            $factor = $this->factorProvider->getFactor($key, $type);

            // 🔁 Adaptation du cloud : nombre de comptes → Go estimés
            if ($key === 'cloud_service') {
                $estimatedGoPerAccount = 10;
                $rawValue *= $estimatedGoPerAccount;
            }

            // 🔁 Requêtes web : heures de navigation → nombre de requêtes
            if ($key === 'navigation_web') {
                $estimatedRequestsPerHour = 100;
                $rawValue *= $estimatedRequestsPerHour;
            }

            // 🔁 Fabrication : amortissement sur la durée de vie moyenne
            if ($type === 'fabrication') {
                $lifespan = match ($key) {
                    'pc' => 4,
                    'smartphone' => 3,
                    'console' => 5,
                    default => 1 // fallback de sécurité
                };
                $factor['emission_gco2e'] /= $lifespan;
            }

            $normalizedValue = $this->normalizeUsage($rawValue, $factor['frequency']);
            $emission = $normalizedValue * $factor['emission_gco2e'];
            $total += $emission;

            $details[] = $this->buildDetail($factor, $usage['value'], $emission, $type, $key);
        }

        return new SimulatorResult($total, $details);
    }

    private function normalizeUsage(float|int $rawValue, string $frequency): float
    {
        return match ($frequency) {
            'daily' => $rawValue * 365,
            'weekly' => $rawValue * 52,
            'yearly' => $rawValue,
            default => throw new \InvalidArgumentException("Unknown frequency '$frequency'")
        };
    }

    private function buildDetail(array $factor, float|int $userValue, float $emission, string $type, string $key): array
    {
        return [
            'key' => $key,
            'label' => $factor['label'],
            'value' => $userValue,
            'total' => round($emission, 2), // gCO₂e
            'factor' => [
                'type' => $type,
                'unit' => $factor['unit'],
                'emission_gco2e' => $factor['emission_gco2e'],
                'frequency' => $factor['frequency'],
                'source' => $factor['source'],
            ]
        ];
    }
}

