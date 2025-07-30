<?php

namespace App\Service;

use App\Entity\Simulation;

class SimulationNormalizer
{
    public function normalize(Simulation $simulation): array
    {
        return [
            'id' => $simulation->getId(),
            'totalGCo2e' => (int) round($simulation->getTotalKg() * 1000),
            'totalKg' => round($simulation->getTotalKg(), 2),
            'treeEquivalent' => $simulation->getTreeEquivalent(),
            'carKmEquivalent' => $simulation->getCarKmEquivalent(),
            'details' => $simulation->getDetails(),
        ];
    }
}
