<?php

namespace App\Service\Provider;

class CarbonFactorProvider
{
    private array $factors;

    public function __construct(string $jsonPath)
    {
        $this->factors = json_decode(file_get_contents($jsonPath), true);
    }

    public function getFactor(string $category, string $type): array
    {
        return $this->factors[$category][$type] ?? throw new \Exception("Unknown factor: $category/$type");
    }
}
