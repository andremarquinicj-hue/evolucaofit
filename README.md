# Evolução Fit

Aplicativo PWA para acompanhamento de treinos, cargas, repetições, recordes, tempo de descanso, medidas corporais e fotos de evolução.

## Stack
- Next.js 16
- React 19
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Vercel

## 1. Rodar localmente
```bash
npm install
cp .env.example .env.local
npm run dev
```

Sem as variáveis do Firebase, o aplicativo funciona em **modo local de teste** e salva os dados no `localStorage` do navegador. Não existem mais dados fictícios de treino no primeiro acesso.

## 2. Criar o projeto no Firebase
No Console do Firebase:
1. Crie um projeto.
2. Em **Authentication > Sign-in method**, ative **E-mail/Senha**.
3. Crie o **Cloud Firestore**.
4. Ative o **Firebase Storage** para fotos de evolução.
5. Em **Configurações do projeto > Seus apps**, adicione um app Web.
6. Copie as chaves para `.env.local` usando `.env.example` como modelo.

## 3. Regras do Firebase
Este repositório já inclui:
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `firebase.json`

Com o Firebase CLI instalado e autenticado:
```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 4. Subir para GitHub
Crie um repositório vazio e execute:
```bash
git init
git add .
git commit -m "Evolução Fit - treino do dia e cronômetro"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

## 5. Publicar na Vercel
1. Importe o repositório do GitHub na Vercel.
2. Abra **Project Settings > Environment Variables**.
3. Cadastre todas as variáveis `NEXT_PUBLIC_FIREBASE_*` do `.env.example`.
4. Faça um novo deploy.

## Estrutura de dados
Cada usuário possui seu próprio documento em:
`users/{uid}/app/main`

As regras impedem que um usuário leia ou altere os dados de outro.

## Funcionalidades
- Login e criação de conta
- Primeiro acesso totalmente zerado
- Tela de configuração do primeiro treino
- Rotina semanal editável por dia
- Dia de descanso configurável
- Cadastro, alteração e exclusão de exercícios
- Aparelho, grupo muscular, séries, repetições e carga atual
- Dashboard mostrando automaticamente o treino correspondente ao dia da semana
- Lista do treino de hoje com carga atual de cada exercício
- Execução do treino série por série
- Alteração da carga durante o treino
- A nova maior carga vira a referência automática do próximo treino
- Comparação com o melhor resultado anterior
- Detecção automática de novo recorde
- Cronômetro de descanso integrado
- Descanso automático ao concluir uma série
- Tempos rápidos: 30s, 45s, 1min, 1min30 e 2min
- Pausar, continuar e adicionar +15s ao descanso
- Histórico de treinos
- Gráfico de evolução por exercício
- Medidas corporais
- Fotos privadas de progresso
- Meta semanal
- PWA instalável no celular

## Migração dos dados de exemplo da versão anterior
A versão anterior do projeto criava automaticamente dados fictícios, como Leg Press de 85 kg e sessões `s1` a `s9`. Esta versão identifica especificamente aquele conjunto de demonstração e o substitui por uma conta limpa, preservando o nome do usuário.

Isso evita que os dados de teste entrem nos gráficos reais de evolução.

## Login e criação de conta
- Entrar com e-mail e senha
- Criar conta com nome, e-mail, senha e confirmação
- Mostrar/ocultar senha
- Recuperação de senha por e-mail com Firebase
- Sessão persistente no aparelho
- Botão **Sair da conta** no Perfil
- Cada usuário autenticado usa seu próprio caminho em `users/{uid}/...` no Firestore e Storage
