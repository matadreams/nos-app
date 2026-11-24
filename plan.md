# Plano de evolução mobile do Nós

## Objetivo confirmado

Transformar o MVP web do Nós em uma aplicação mobile para Android e iOS usando React Native + Expo, preservando a SPA web existente. A primeira entrega mobile deve levar para o celular as áreas Início, Descobrir, Objetivos, Comunidade e Minha conta, mantendo a conta individual, o vínculo com um casal e a competição saudável entre casais. O Supabase será a base para autenticação, persistência e sincronização entre dispositivos.

## Arquitetura e decisões

- A SPA web continua em `src/` e não será sobrescrita.
- A versão nativa vive em `mobile/`, com Expo + TypeScript e componentes React Native.
- A camada `mobile/src/lib/supabase.ts` cria o cliente Supabase somente quando as variáveis públicas estiverem configuradas; sem elas, o app permanece utilizável em modo demonstrativo local.
- O esquema inicial em `supabase/migrations/001_initial.sql` separa identidade individual, casais, membros, convites, objetivos, status de experiências, atividades e amizades.
- O app usa persistência local de fallback para acelerar o primeiro uso, mas deixa a autenticação real e os repositórios de dados preparados para a configuração do projeto Supabase.
- Não haverá segredos no bundle: apenas a URL pública e a chave anon pública podem ser usadas no cliente. A service role key fica exclusivamente no ambiente seguro do Supabase.

## Design

Estilos considerados: **Editorial acolhedor** (0,07), com tipografia serifada, coral suave e verde sálvia para transformar cuidado em uma rotina bonita; **Minimalismo utilitário** (0,06), com alto contraste e foco em velocidade; **Diário de viagem íntimo** (0,04), com cartões orgânicos e sensação de memória compartilhada.

### Estilo escolhido: Editorial acolhedor

- **Movimento:** uma mistura de editorial de revista independente com diário íntimo de casal.
- **Princípios:** baixa densidade visual, ações de uma mão, linguagem calorosa e progresso sem pressão.
- **Cores:** marfim como base, coral para convite e ação, sálvia para confiança, lilás para reflexão e amarelo para descoberta.
- **Layout:** cabeçalho curto, cartões empilhados e navegação inferior fixa; cada tela começa com uma frase de contexto antes das ações.
- **Elementos assinatura:** marca em forma de dois corações, chips de ritmo e cartões com cantos assimétricos.
- **Interação:** toda ação importante oferece feedback imediato e estados vazios explicam o próximo passo.
- **Animação:** transições curtas de opacidade e deslocamento; evitar movimento contínuo que distraia ou canse.
- **Tipografia:** Georgia para títulos e sistema nativo sem serifa para leitura e controles.
- **Essência:** um pequeno ritual digital para ajudar casais reais a cultivar o que já têm; íntimo, possível e gentil.
- **Voz:** direta, carinhosa e sem clichês; exemplos: “Um momento possível para hoje” e “O que vocês querem cultivar juntos?”.
- **Marca:** dois corações sobrepostos dentro de um quadrado coral, sem bordas arredondadas embutidas no arquivo do ícone.
- **Cor proprietária:** coral queimado `#D8785C`.

## Estrutura de projeto

```text
mobile/
  App.tsx                         # navegação, telas e estado da primeira versão nativa
  app.json                        # nome, slug, scheme e identificadores Android/iOS
  assets/                         # ícones e splash da marca Nós
  src/
    data/demo.ts                 # experiências e casais de demonstração
    lib/supabase.ts              # cliente e operações de autenticação
    types/index.ts               # tipos compartilhados da experiência mobile
supabase/
  migrations/001_initial.sql     # tabelas, índices, RLS e trigger de perfil
src/                             # SPA web preservada
```

## Backend e publicação

Após esta base, o projeto precisa receber um projeto Supabase real, aplicar a migração e configurar `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no ambiente de desenvolvimento/build. Depois disso, a próxima fase é substituir os dados de demonstração pelos repositórios Supabase, testar login e sincronização em dois aparelhos, configurar notificações e gerar builds Android/iOS pelo EAS. A publicação na Google Play e App Store depende também de contas de desenvolvedor e certificados do proprietário.
