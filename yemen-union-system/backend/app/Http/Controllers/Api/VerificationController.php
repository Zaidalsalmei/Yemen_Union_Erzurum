<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WasenderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VerificationController extends Controller
{
    protected $waSender;

    public function __construct(WasenderService $waSender)
    {
        $this->waSender = $waSender;
    }

    // Step 1: Send OTP
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string|numeric',
        ]);

        $phone = $request->phone_number;

        // Rate Limiting Check (Optional but recommended)
        // Check if a code was sent recently (e.g., last 1 minute)
        $lastCode = DB::table('verification_codes')
            ->where('phone_number', $phone)
            ->where('created_at', '>', Carbon::now()->subMinute())
            ->first();

        if ($lastCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please wait a minute before requesting a new code.'
            ], 429);
        }

        // Generate OTP
        $otp = (string) random_int(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(5);

        // Store in DB
        DB::table('verification_codes')->insert([
            'phone_number' => $phone,
            'otp' => $otp,
            'expires_at' => $expiresAt,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Send via Wasender
        $message = "Your verification code is: $otp";
        $sent = $this->waSender->sendMessage($phone, $message);

        if ($sent) {
            return response()->json([
                'status' => 'success',
                'message' => 'Verification code sent successfully.',
                // 'debug_otp' => $otp // REMOVE IN PRODUCTION
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send verification code. Please try again.'
            ], 500);
        }
    }

    // Step 2: Verify OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $phone = $request->phone_number;
        $otp = $request->otp;

        $record = DB::table('verification_codes')
            ->where('phone_number', $phone)
            ->where('otp', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($record) {
            // valid OTP
            // Mark user as verified if they exist? 
            // Or just return success so frontend allows registration.
            
            // If user exists, update verified_at
            DB::table('users')
                ->where('phone_number', $phone)
                ->update(['phone_verified_at' => Carbon::now()]);

            // Clean up used OTPs
            DB::table('verification_codes')
                ->where('phone_number', $phone)
                ->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Phone number verified successfully.'
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Incorrect or expired verification code.'
            ], 400);
        }
    }
}
