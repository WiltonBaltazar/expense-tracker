# 🏗️ Especificação Técnica: App de Gestão Financeira Inteligente

## 0. Role & Persona do Modelo
> **Você é um Senior Full-Stack Architect e Financial Logic Expert.** Seu objetivo é projetar a lógica e o fluxo funcional para um aplicativo abrangente de gerenciamento de economias e despesas. O aplicativo deve lidar com múltiplas fontes de renda, implementar a regra 50/30/20 (customizável) e fornecer modelagem preditiva de metas.

---

## 1. Stack Tecnológica Definida
- **Backend:** Laravel 11 (PHP 8.3+)
- **Frontend:** React (via Inertia.js - Monolito moderno)
- **Database:** PostgreSQL ou MySQL
- **Estilização:** Tailwind CSS + Headless UI

---

## 2. Arquitetura de Dados e Lógica Core

### A. Mecanismo de Agregação de Renda
- Suporte para múltiplas fontes: Salário, Freelance, Renda Passiva.
- **Normalização:** Conversão de todas as entradas para uma Renda Mensal Total (RMT) base para o cálculo dos buckets.

### B. O Triple-Split (Regra 50/30/20)
Implementação de lógica de buckets virtuais:
- **Necessidades (50%):** Gastos essenciais.
- **Desejos (30%):** Gastos de estilo de vida.
- **Economia (20%):** Fundo para metas e investimentos.
- *Requisito:* Os percentuais devem ser editáveis pelo usuário nas configurações.

### C. Engenharia de Metas e Predição
- **Cálculo de ETA:** Determinar o tempo para atingir uma meta baseando-se exclusivamente no saldo disponível no bucket de "Economia".
- **Pattern Recognition:** Analisar o bucket de "Desejos" para identificar gastos supérfluos e sugerir redirecionamento para a "Meta" (Modo Fast-Track).

---

## 3. Requisitos Funcionais por Fase

### Fase 1: Fundação (Laravel/Inertia Setup)
- Configuração de Migrations: `users`, `incomes`, `expenses`, `goals`, `settings`.
- Implementação da Service Class `FinancialSplitterService` para gerenciar a lógica dos buckets.

### Fase 2: Interface de Alocação (React)
- Dashboard centralizado mostrando o progresso visual de cada bucket.
- Formulários dinâmicos para inserção de renda e despesa com categorização automática nos buckets.

### Fase 3: Inteligência de Metas
- CRUD de Metas com simulador de tempo real.
- Algoritmo que calcula: *"Se você reduzir R$ 100 do bucket de Desejos, sua meta será atingida X dias antes"*.

### Fase 4: Tracker de Despesas e Auditoria
- Registro histórico de gastos.
- Relatórios de "Onde gastei mais?" com comparação entre o planejado (bucket) vs. realizado.

---

## 4. Instruções de Implementação para o Opus 4.6
"Ao iniciar a construção, priorize a robustez do Backend Laravel. Utilize **Inertia.js** para manter a reatividade do React dentro do ecossistema Laravel. 
1. Comece pelas **Migrations** e **Models**.
2. Desenvolva a **Logic Service** que faz os cálculos financeiros.
3. Projete os **Controllers** e **Páginas React** (Inertia) para o Dashboard.
4. Garanta que a interface seja limpa, intuitiva e em Português (PT-BR)."