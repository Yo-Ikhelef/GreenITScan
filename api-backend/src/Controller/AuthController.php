<?php
namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\Security\Core\User\UserInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

#[Route('/api/users', name: 'users_')]
#[OA\Tag(name: "User")]
class AuthController extends AbstractController
{
    #[OA\Post(
        description: "Register a new user",
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'email', type: 'string'),
                    new OA\Property(property: 'password', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Utilisateur créé avec succès",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string')
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Requête invalide",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'error', type: 'string')
                    ]
                )
            )
        ]
    )]
    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return new JsonResponse(['error' => 'Email et mot de passe requis'], 400);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Email invalide'], 400);
        }

        $existingUser = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Cet email est déjà utilisé'], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $hashedPassword = $hasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $em->persist($user);
        $em->flush();

        return new JsonResponse(['message' => 'Inscription réussie'], 201);
    }

    #[OA\Post(
        description: "Authentifie un utilisateur et retourne un token JWT",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "email", type: "string"),
                    new OA\Property(property: "password", type: "string")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Authentification réussie",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "token", type: "string")
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Requête invalide",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "error", type: "string")
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "Identifiants invalides",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "error", type: "string")
                    ]
                )
            )
        ]
    )]
    #[Route('/login', name: 'user_login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return new JsonResponse(['error' => 'Email et mot de passe requis'], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if (!$user || !$hasher->isPasswordValid($user, $data['password'])) {
            return new JsonResponse(['error' => 'Identifiants invalides'], 401);
        }

        $token = $jwtManager->create($user);

        return new JsonResponse(['token' => $token]);
    }
}
