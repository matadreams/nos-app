# Nós — cultive o que vocês têm

MVP do **Nós**, um app para casais transformarem intenção em momentos reais: experiências, objetivos compartilhados, atividades externas, comunidade e competição saudável entre casais.

O projeto está em português do Brasil e foi construído como uma SPA em React + TypeScript + Vite. A versão atual é um protótipo front-end com persistência local no navegador.

## O que já existe

- Conta individual para cada pessoa.
- Vínculo com um casal por código de convite.
- Bloqueio das áreas compartilhadas quando a conta ainda não está vinculada.
- Tela inicial com progresso, sequência e sugestão do dia.
- Catálogo de experiências com filtros por duração, orçamento e tipo.
- Salvar experiências e marcar atividades como vividas.
- Objetivos do casal com criação, edição, exclusão e avanço de etapas.
- Perfil individual e preferências do casal.
- Comunidade com outros casais, atividades compartilhadas, pontuação e ranking.
- Convite demonstrativo de amigos com o código `NOS-FRIENDS`.
- Links reais em cada sugestão para executar a ideia: receitas, livros, restaurantes, playlists e destinos.
- Interface responsiva para desktop e mobile.

## Stack

- React
- TypeScript
- Vite
- Lucide React
- CSS responsivo sem framework visual
- `localStorage` para persistência do protótipo

## Executar localmente

Requisitos: Node.js e npm.

```bash
git clone https://github.com/matadreams/nos-app.git
cd nos-app
npm install
npm run dev
```

O servidor de desenvolvimento utiliza a porta `3000`. Para gerar a versão de produção:

```bash
npm run build
```

Para servir o build localmente:

```bash
npm run preview
```

## Rotas

| Rota | Área |
| --- | --- |
| `/` | Início |
| `/descobrir` | Experiências e sugestões |
| `/objetivos` | Objetivos compartilhados |
| `/comunidade` | Amigos, atividades e ranking |
| `/perfil` | Conta individual, vínculo e preferências |

O manifesto de rotas do WebDev fica em [`public/manus-routes.json`](public/manus-routes.json).

## Dados de demonstração

A aplicação inicia com Yuri e Vitoria vinculados há quatro anos em Florianópolis/SC. O código demonstrativo do casal é `NOS-YV4K`.

Os dados são salvos apenas no navegador. As chaves de armazenamento usadas pelo MVP são `nos:account`, `nos:connection`, `nos:profile`, `nos:goals`, `nos:saved` e `nos:completed`.

Para testar o estado sem vínculo, abra **Minha conta**, selecione **gerenciar vínculo** e saia do casal. Para retornar, use o código `NOS-YV4K`.

## Estrutura principal

```text
src/
  App.tsx          # telas, estados locais, dados demonstrativos e componentes
  main.tsx         # entrada React
  styles.css       # identidade visual e responsividade
  vite-env.d.ts    # tipos do Vite
public/
  manus-routes.json
app.config.ts      # metadados do projeto WebDev
TODO.md            # entregas do MVP
resumo-completo-mvp-nos.txt
```

## Links externos das sugestões

As sugestões são acionáveis. Os cards abrem os recursos em uma nova aba e não tentam incorporar serviços externos dentro do app:

- receita de macarrão à carbonara no TudoGostoso;
- busca de cafés em Florianópolis no Google Maps;
- livro de atividades para casais na Amazon Brasil;
- restaurantes românticos em Florianópolis no Tripadvisor;
- playlist romântica no YouTube;
- pesquisa de destinos próximos de Florianópolis no Google Travel.

No código, cada experiência possui um objeto `resource` com `label` e `url`.

## Próxima evolução técnica

Para transformar o MVP em um app real para iOS e Android, a recomendação é migrar a interface para React Native + Expo, manter TypeScript, substituir o `localStorage` por autenticação e banco de dados e usar Supabase para PostgreSQL, Auth, Storage, Realtime e Edge Functions.

A versão de produção deve implementar autenticação real, convites persistidos, sincronização entre os membros do casal, amizades, permissões de privacidade, ranking calculado no servidor, notificações e analytics. O detalhamento dessa evolução está em [`resumo-completo-mvp-nos.txt`](resumo-completo-mvp-nos.txt).

## Contribuição

Antes de abrir um pull request, execute:

```bash
npm install
npm run build
```

Mantenha o idioma da interface em português do Brasil, preserve a identidade visual do Nós e atualize `TODO.md` quando uma entrega de produto for concluída.

## Status

MVP funcional para validação de experiência. O repositório ainda não representa uma versão de produção: não há backend, autenticação real ou sincronização entre dispositivos.
