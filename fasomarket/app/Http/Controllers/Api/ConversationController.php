<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $conversations = Conversation::where(function($query) use ($user) {
            $query->where('client_id', $user->id)
                  ->orWhere('vendeur_id', $user->id);
        })
        ->with(['client', 'vendeur', 'produit', 'dernierMessage'])
        ->where('archivee', false)
        ->orderBy('derniere_activite', 'desc')
        ->paginate(15);

        return response()->json([
            'success' => true,
            'succes' => true,
            'conversations' => $conversations
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendeur_id' => 'required|exists:users,id',
            'produit_id' => 'nullable|exists:produits,id',
            'sujet' => 'nullable|string|max:255',
            'message' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation = Conversation::create([
            'client_id' => $request->user()->id,
            'vendeur_id' => $request->vendeur_id,
            'produit_id' => $request->produit_id,
            'sujet' => $request->sujet,
            'derniere_activite' => now()
        ]);

        $conversation->messages()->create([
            'expediteur_id' => $request->user()->id,
            'contenu' => $request->message
        ]);

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Conversation créée',
            'conversation' => $conversation->load(['client', 'vendeur', 'produit'])
        ], 201);
    }

    public function show(Conversation $conversation)
    {
        $messages = $conversation->messages()
            ->with('expediteur')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'succes' => true,
            'conversation' => $conversation->load(['client', 'vendeur', 'produit']),
            'messages' => $messages
        ]);
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $validator = Validator::make($request->all(), [
            'contenu' => 'required|string',
            'pieces_jointes' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'succes' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $message = $conversation->messages()->create([
            'expediteur_id' => $request->user()->id,
            'contenu' => $request->contenu,
            'pieces_jointes' => $request->pieces_jointes
        ]);

        $conversation->update(['derniere_activite' => now()]);

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Message envoyé',
            'data' => $message->load('expediteur')
        ], 201);
    }

    public function markAsRead(Request $request, Message $message)
    {
        $message->marquerLu();

        return response()->json([
            'success' => true,
            'succes' => true,
            'message' => 'Message marqué comme lu'
        ]);
    }
}