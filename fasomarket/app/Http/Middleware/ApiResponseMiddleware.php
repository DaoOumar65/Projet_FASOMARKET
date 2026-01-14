<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiResponseMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Ajouter les en-têtes CORS pour le frontend
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        // Si c'est une requête OPTIONS (preflight), retourner 200
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
            ]);
        }

        // Standardiser les réponses d'erreur en français
        if ($response->getStatusCode() >= 400) {
            $content = json_decode($response->getContent(), true);
            
            if (is_array($content)) {
                // Traduire les messages d'erreur Laravel en français
                if (isset($content['message'])) {
                    $content['message'] = $this->traduireMessage($content['message']);
                }
                
                if (!isset($content['succes'])) {
                    $content['succes'] = false;
                }
                
                $response->setContent(json_encode($content, JSON_UNESCAPED_UNICODE));
            }
        }

        return $response;
    }

    private function traduireMessage(string $message): string
    {
        $traductions = [
            'Unauthenticated.' => 'Non authentifié. Veuillez vous connecter.',
            'This action is unauthorized.' => 'Action non autorisée.',
            'The given data was invalid.' => 'Les données fournies sont invalides.',
            'Not Found' => 'Ressource non trouvée.',
            'Server Error' => 'Erreur serveur.',
            'Validation failed' => 'Échec de la validation',
            'Resource not found' => 'Ressource non trouvée',
        ];

        return $traductions[$message] ?? $message;
    }
}