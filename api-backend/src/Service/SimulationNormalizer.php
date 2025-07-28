<?php

namespace App\Service;

use App\Entity\Simulation;

class SimulationNormalizer
{
    public function normalize(Simulation $simulation): array
    {
        return [
            'id' => $simulation->getId(),
            'totalKg' => round($simulation->getTotalKg(), 2),
            'treeEquivalent' => $simulation->getTreeEquivalent(),
            'carKmEquivalent' => $simulation->getCarKmEquivalent(),
            'details' => $simulation->getDetails(),
        ];
    }
}
