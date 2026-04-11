<?php

return [
    'features' => [
        'dashboard' => [
            'label' => 'Dashboard',
            'description' => 'Acesso ao resumo financeiro principal.',
            'audience' => 'user',
            'assignable' => true,
        ],
        'incomes' => [
            'label' => 'Rendas',
            'description' => 'Registo e gestão de rendas.',
            'audience' => 'user',
            'assignable' => true,
        ],
        'expenses' => [
            'label' => 'Despesas',
            'description' => 'Registo e gestão de despesas.',
            'audience' => 'user',
            'assignable' => true,
        ],
        'goals' => [
            'label' => 'Metas',
            'description' => 'Criação e acompanhamento de metas.',
            'audience' => 'user',
            'assignable' => true,
        ],
        'savings_wallet' => [
            'label' => 'Carteira de Poupança',
            'description' => 'Depósitos e transferências para metas.',
            'audience' => 'user',
            'assignable' => true,
        ],
    ],

    'duration_options_months' => [1, 3, 6, 12, 24],
];
