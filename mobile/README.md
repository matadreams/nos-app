# Nós Mobile

Aplicativo nativo do Nós para Android e iOS, construído com React Native + Expo + TypeScript. A SPA web original continua no diretório raiz.

## Requisitos

- Node.js 20 ou superior;
- npm;
- Expo Go no celular para desenvolvimento;
- um projeto Supabase para autenticação e sincronização real.

## Instalação e execução

```bash
cd mobile
npm install
npm start
```

Depois, leia o QR Code com o Expo Go. Também é possível usar `npm run android`, `npm run ios` em um Mac com Xcode ou `npm run web` para uma verificação rápida no navegador.

## Supabase

Copie `.env.example` para `.env` e preencha a URL pública e a chave anon pública do projeto Supabase. Nunca coloque a service role key neste app.

```bash
cp .env.example .env
```

A migração inicial está em `../supabase/migrations/001_initial.sql`. Aplique-a pelo SQL Editor do Supabase antes de habilitar login e sincronização. Sem as variáveis, o app permanece em modo demonstrativo local para facilitar a revisão visual.

## Build de distribuição

A geração de APK/AAB e iOS/TestFlight deve ser feita com uma conta Expo/EAS e credenciais de desenvolvedor das lojas. O fluxo recomendado depois da configuração é:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

Os builds de produção não devem guardar certificados, tokens ou chaves no Git.
