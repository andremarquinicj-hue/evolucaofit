# Evolução Fit

Aplicativo PWA para acompanhamento de treinos, cargas, repetições, recordes, medidas corporais e fotos de evolução.

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
Sem as variáveis do Firebase, o aplicativo abre em **modo demonstração** e salva os dados no `localStorage` do navegador.

## 2. Criar o projeto no Firebase
No Console do Firebase:
1. Crie um projeto.
2. Em **Authentication > Sign-in method**, ative **E-mail/Senha**.
3. Crie o **Cloud Firestore**.
4. Ative o **Firebase Storage**.
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
git commit -m "Evolução Fit - versão inicial"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

## 5. Publicar na Vercel
1. Importe o repositório do GitHub na Vercel.
2. Abra **Project Settings > Environment Variables**.
3. Cadastre todas as variáveis `NEXT_PUBLIC_FIREBASE_*` do `.env.example`.
4. Faça o deploy.

## Estrutura de dados
Cada usuário possui seu próprio documento em:
`users/{uid}/app/main`

As regras impedem que um usuário leia ou altere os dados de outro.

## Funcionalidades entregues
- Login e criação de conta
- Rotina semanal editável
- Cadastro, alteração e exclusão de exercícios
- Aparelho, séries, repetições e carga inicial
- Execução do treino série por série
- Comparação com o melhor resultado anterior
- Detecção automática de novo recorde
- Histórico de treinos
- Gráfico de evolução por exercício
- Medidas corporais
- Fotos privadas de progresso
- Meta semanal
- PWA instalável no celular
- Modo demonstração quando o Firebase ainda não está configurado

## Login e criação de conta

A versão atual exige autenticação antes de abrir o aplicativo.

- Entrar com e-mail e senha
- Criar conta com nome, e-mail, senha e confirmação
- Mostrar/ocultar senha
- Recuperação de senha por e-mail quando o Firebase estiver configurado
- Sessão persistente no aparelho
- Botão **Sair da conta** no Perfil
- Cada usuário autenticado usa seu próprio caminho em `users/{uid}/...` no Firestore e Storage

Enquanto as variáveis do Firebase ainda não estiverem preenchidas, existe um modo local apenas para teste. Nesse modo é possível criar uma conta local no navegador; ao configurar o Firebase, o acesso passa a usar o Firebase Authentication.

No Firebase Console, ative **Authentication > Sign-in method > Email/Password** antes de testar o login em produção.
