<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use Illuminate\Mail\MailServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    MailServiceProvider::class,
];
