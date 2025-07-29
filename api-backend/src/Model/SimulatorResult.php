<?php

namespace App\Model;

class SimulatorResult
{
    public function __construct(
        public readonly float $totalGCo2e,
        public readonly array $details // chaque item = label, valeur, unité, source, émission, fréquence
    ) {}

    public function getTotalKg(): float
    {
        return $this->totalGCo2e / 1000;
    }

    public function getTreeEquivalence(): int
    {
        return (int) round($this->getTotalKg() / 25); // ≈ 25kg/an par arbre
    }

    public function getCarKmEquivalence(): int
    {
        return (int) round($this->getTotalKg() / 0.2); // ≈ 200g/km
    }
}
