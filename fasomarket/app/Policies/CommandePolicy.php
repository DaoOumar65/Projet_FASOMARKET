<?php

namespace App\Policies;

use App\Models\Commande;
use App\Models\User;

class CommandePolicy
{
    public function view(User $user, Commande $commande)
    {
        return $user->type_utilisateur === 'vendeur' && 
               $commande->produits()->whereHas('boutique', function($q) use ($user) {
                   $q->where('vendeur_id', $user->vendeur->id);
               })->exists();
    }

    public function update(User $user, Commande $commande)
    {
        return $this->view($user, $commande);
    }
}