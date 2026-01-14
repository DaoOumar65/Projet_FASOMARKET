<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SmsService
{
    public function envoyerOtp($telephone, $code)
    {
        // Pour le développement, on log le code
        Log::info("Code OTP pour {$telephone}: {$code}");
        
        // TODO: Intégrer un vrai service SMS (Twilio, AWS SNS, etc.)
        return true;
    }
}