<?php

namespace App\Model;

class SimulatorRequest
{
    public function __construct(
        public readonly int $emailSimple,
        public readonly int $emailPJ,
        public readonly int $webHours,
        public readonly int $streamingVideo,
        public readonly int $streamingAudio,
        public readonly int $videoConf,
        public readonly int $pcCount,
        public readonly int $smartphoneCount,
        public readonly int $consoleCount,
        public readonly int $cloudAccounts,
    ) {}
}
