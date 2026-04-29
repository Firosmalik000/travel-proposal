<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8" />
        <title>@yield('title')</title>
        <style>
            * {
                font-family: DejaVu Sans, Arial, sans-serif;
                font-size: 11px;
            }
            h1 {
                font-size: 16px;
                margin: 0;
                padding: 0;
            }
            h2 {
                font-size: 13px;
                margin: 0;
                padding: 0;
            }
            .muted {
                color: #666;
            }
            .box {
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 10px;
                margin-top: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th,
            td {
                border: 1px solid #ddd;
                padding: 6px;
                vertical-align: top;
            }
            th {
                background: #f5f5f5;
                text-align: left;
            }
        </style>
        @stack('styles')
    </head>
    <body>
        @yield('content')
    </body>
</html>

