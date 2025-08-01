<?php

namespace App\Service;

use App\Entity\Simulation;

class SimulationNormalizer
{
    public function normalize(Simulation $simulation): array
    {
        return [
            'id' => $simulation->getId(),
            'totalGCo2e' => $simulation->getTotalGCo2e(),
            'totalKg' => round($simulation->getTotalKg(), 2),
            'treeEquivalent' => $simulation->getTreeEquivalent(),
            'carKmEquivalent' => $simulation->getCarKmEquivalent(),
            'details' => $simulation->getDetails(),
            'meta' => [
                'disclaimer' => "Ces valeurs sont des estimations basées sur diverses sources publiques. Note importante : Les emissions concernant les appareils électroniques (PC, smartphones, consoles) sont calculées sur la base de leur fabrication et non de leur utilisation. Les émissions liées à l'utilisation d'Internet et des services cloud sont estimées en fonction de l'usage quotidien.",
                'sources' => $this->extractSourcesFromDetails($simulation->getDetails()),
            ],
        ];
    }

    private function extractSourcesFromDetails(array $details): array
    {
        $sourcesMap = [];

        foreach ($details as $detail) {
            if (!isset($detail['factor']['source'])) {
                continue;
            }

            // Séparation sur les caractères usuels : /, |, +, virgule
            $rawSources = preg_split('/[\/|,+]+/', $detail['factor']['source']);

            foreach ($rawSources as $rawSource) {
                $cleaned = trim($rawSource);

                if ($cleaned !== '') {
                    $sourcesMap[$cleaned] = true;
                }
            }
        }

        return array_keys($sourcesMap);
    }


}
