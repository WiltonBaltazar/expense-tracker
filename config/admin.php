<?php

return [
    'domain' => env('ADMIN_DOMAIN', 'wiltonvm.click'),
    'local_domains' => array_values(array_filter(array_map(
        static fn (string $domain) => trim($domain),
        explode(',', env('ADMIN_LOCAL_DOMAINS', 'localhost,127.0.0.1,::1'))
    ))),
];
