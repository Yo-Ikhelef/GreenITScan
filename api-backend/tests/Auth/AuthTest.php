<?php

namespace FunctionalTest\Auth;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class AuthTest extends WebTestCase
{
    private \Symfony\Bundle\FrameworkBundle\KernelBrowser $client;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->userRepository = static::getContainer()->get(UserRepository::class);
    }

    // -------------------------
    // REGISTER
    // -------------------------

    public function testUserCanRegisterSuccessfully(): void
    {
        $payload = [
            'email' => 'newuser@example.com',
            'password' => 'strongpass123'
        ];

        $this->client->request(
            'POST',
            '/api/users/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        self::assertStringContainsString('Inscription réussie', $data['message']);
    }

    public function testRegisterFailsWithExistingEmail(): void
    {
        $payload = [
            'email' => 'user@example.com', // déjà présent via les fixtures
            'password' => 'anotherpass'
        ];

        $this->client->request(
            'POST',
            '/api/users/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        self::assertStringContainsString('déjà utilisé', $data['error']);
    }

    public function testRegisterFailsWithInvalidEmail(): void
    {
        $payload = [
            'email' => 'not-an-email',
            'password' => 'password123'
        ];

        $this->client->request(
            'POST',
            '/api/users/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        self::assertStringContainsString('Email invalide', $this->client->getResponse()->getContent());
    }

    public function testRegisterFailsWithMissingFields(): void
    {
        $payload = ['email' => 'missing@example.com']; // pas de password

        $this->client->request(
            'POST',
            '/api/users/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        self::assertStringContainsString('requis', $this->client->getResponse()->getContent());
    }

    // -------------------------
    // LOGIN
    // -------------------------

    public function testLoginReturnsTokenOnSuccess(): void
    {
        $payload = [
            'email' => 'user@example.com',
            'password' => 'azerty' // mot de passe en clair dans les fixtures
        ];

        $this->client->request(
            'POST',
            '/api/users/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseIsSuccessful();
        $data = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('token', $data);
        self::assertNotEmpty($data['token']);
    }

    public function testLoginFailsWithWrongPassword(): void
    {
        $payload = [
            'email' => 'user@example.com',
            'password' => 'wrongpassword'
        ];

        $this->client->request(
            'POST',
            '/api/users/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
        self::assertStringContainsString('Identifiants invalides', $this->client->getResponse()->getContent());
    }

    public function testLoginFailsWithUnknownEmail(): void
    {
        $payload = [
            'email' => 'unknown@example.com',
            'password' => 'irrelevant'
        ];

        $this->client->request(
            'POST',
            '/api/users/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
        self::assertStringContainsString('Identifiants invalides', $this->client->getResponse()->getContent());
    }

    public function testLoginFailsWithMissingFields(): void
    {
        $payload = ['email' => 'user@example.com']; // pas de password

        $this->client->request(
            'POST',
            '/api/users/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        self::assertStringContainsString('requis', $this->client->getResponse()->getContent());
    }
}
