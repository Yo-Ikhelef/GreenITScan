<?php

namespace FunctionalTest\Simulation;

use App\Entity\Simulation;
use App\Repository\SimulationRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class SimulationTest extends WebTestCase
{
    private \Symfony\Bundle\FrameworkBundle\KernelBrowser $client;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->userRepository = static::getContainer()->get(UserRepository::class);
    }

    public function testSimulationSuccessfullyPersists(): void
    {
        $user = $this->userRepository->findOneByEmail('user@example.com');
        $this->client->loginUser($user);

        $payload = [
            'emailSimple' => 2,
            'emailPJ' => 1,
            'webHours' => 2,
            'streamingVideo' => 5,
            'streamingAudio' => 60,
            'videoConf' => 3,
            'pcCount' => 1,
            'smartphoneCount' => 1,
            'consoleCount' => 0,
            'cloudAccounts' => 5
        ];

        $this->client->request('POST', '/api/simulation/new', [], [], [
            'CONTENT_TYPE' => 'application/json'
        ], json_encode($payload));

        self::assertResponseIsSuccessful();
        self::assertResponseStatusCodeSame(Response::HTTP_OK);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('id', $data);

        $simulation = static::getContainer()->get(SimulationRepository::class)->find($data['id']);
        self::assertNotNull($simulation);
        self::assertSame(10, count($simulation->getDetails())); // exemple
    }

    public function testSimulationRejectsInvalidPayload(): void
    {
        $user = $this->userRepository->findOneByEmail('user@example.com');
        $this->client->loginUser($user);

        $this->client->request('POST', '/api/simulation/new', [], [], [
            'CONTENT_TYPE' => 'application/json'
        ], 'not_a_valid_json');

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testSimulationUnauthorized(): void
    {
        $this->client->request('POST', '/api/simulation/new');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}
