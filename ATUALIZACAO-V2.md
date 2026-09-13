# Atualização V2 — Treino do dia + cronômetro

## O que mudou
1. Contas novas começam totalmente zeradas.
2. Os dados fictícios da versão anterior são detectados e limpos automaticamente no primeiro acesso após o deploy.
3. A tela inicial mostra o treino correspondente ao dia atual.
4. Antes de começar, a atleta vê exercício, aparelho, séries, repetições e carga atual.
5. Durante o treino, a carga pode ser alterada em cada série.
6. Ao finalizar o treino, a maior carga usada passa a ser a referência sugerida para a próxima sessão.
7. A evolução e os recordes continuam sendo alimentados automaticamente pelo histórico.
8. Ao concluir uma série, abre automaticamente o cronômetro de descanso.
9. Tempos disponíveis: 30s, 45s, 1min, 1min30 e 2min; também é possível pausar e adicionar +15s.

## Para atualizar o projeto existente
Substitua os arquivos do repositório pelos arquivos desta versão e faça o commit. A Vercel fará um novo deploy automaticamente.

As variáveis de ambiente do Firebase que já foram cadastradas na Vercel continuam as mesmas.

## Importante
A limpeza automática mira somente o conjunto específico de dados de demonstração enviado na primeira versão (`s1` a `s9` e Leg Press de 85 kg). Ela não é uma limpeza genérica de qualquer conta.
