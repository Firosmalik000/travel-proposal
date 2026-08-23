<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'booking' => [
        'notification_email' => env('BOOKING_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS')),
        'whatsapp' => [
            'endpoint' => env('BOOKING_NOTIFICATION_WHATSAPP_ENDPOINT', 'https://api.fonnte.com/send'),
            'admin_number' => env('BOOKING_NOTIFICATION_WHATSAPP'),
            'token' => env('BOOKING_NOTIFICATION_WHATSAPP_TOKEN'),
        ],
    ],

    'notifications' => [
        'admin_email' => env('ADMIN_NOTIFICATION_EMAIL', env('BOOKING_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS'))),
    ],

    'currency' => [
        'supported' => [
            'IDR' => 'Indonesian Rupiah',
            'SAR' => 'Saudi Riyal',
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'MYR' => 'Malaysian Ringgit',
            'SGD' => 'Singapore Dollar',
        ],
        'live' => [
            'enabled' => env('CURRENCY_LIVE_ENABLED', true),
            'endpoint' => env('CURRENCY_LIVE_ENDPOINT', 'https://open.er-api.com/v6/latest/IDR'),
            'cache_minutes' => env('CURRENCY_LIVE_CACHE_MINUTES', 15),
            'connect_timeout' => env('CURRENCY_LIVE_CONNECT_TIMEOUT', 2),
            'timeout' => env('CURRENCY_LIVE_TIMEOUT', 4),
        ],
    ],

    'hotel_pdf' => [
        'pdftotext_binary' => env('PDFTOTEXT_BINARY', 'pdftotext'),
        'timeout' => env('HOTEL_PDF_PARSE_TIMEOUT', 30),
    ],

];
