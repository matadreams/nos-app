# Nós — entregas

## MVP web entregue

- [x] Tela inicial com resumo do casal, visão rápida do progresso e uma recomendação em destaque.
  - Exibir saudação, contexto do casal, atividade recomendada e progresso de objetivos.
- [x] Navegação principal entre Início, Descobrir, Objetivos, Comunidade e Minha conta.
  - Alternar as áreas sem recarregar a aplicação e manter o estado local.
- [x] Área Descobrir com catálogo de experiências e atividades recomendadas para o casal.
  - Cada sugestão possui um recurso externo acionável, como receita, livro para comprar, restaurante, playlist ou pesquisa de destino.
  - Exibir cards com título, tipo, duração, custo, descrição e ação principal.
- [x] Filtros de recomendações por tempo disponível, orçamento e tipo de programa.
- [x] Cards de sugestões com ações funcionais para salvar e marcar como concluídas.
- [x] Objetivos compartilhados com descrição, etapas, indicador de progresso e edição.
- [x] Conta individual, vínculo com casal, bloqueio/desbloqueio das áreas compartilhadas e comunidade competitiva demonstrativa.
- [x] Documentação do produto e do desenvolvimento em `resumo-completo-mvp-nos.txt`.
- [x] README, `.gitignore`, CI com GitHub Actions e sincronização do repositório privado.

## Base mobile criada

- [x] Criar o projeto Expo TypeScript em `mobile/` sem alterar a SPA web.
  - O projeto usa React Native, Expo e orientação portrait.
  - O nome, slug, scheme e identificadores são próprios do Nós.
- [x] Recriar a navegação principal no celular com abas inferiores para Início, Descobrir, Objetivos, Comunidade e Conta.
  - A navegação funciona com toque e mantém o estado enquanto o app permanece aberto.
- [x] Levar para o mobile as experiências, objetivos, ranking demonstrativo, conta individual e vínculo com código de convite.
- [x] Adicionar fallback local para a demonstração e abrir links externos das recomendações pelo celular.
- [x] Adicionar cliente Supabase preparado para sessão, cadastro e login por e-mail.
- [x] Criar migração Supabase com usuários, casais, membros, convites, experiências, objetivos, atividades, amizades e políticas RLS iniciais.
- [x] Criar ícones nativos da marca Nós sem depender do ícone genérico do Expo.
- [x] Documentar a arquitetura e o caminho para EAS em `plan.md` e `mobile/README.md`.

## Próximas entregas para produto real

- [ ] Criar/selecionar o projeto Supabase e aplicar `supabase/migrations/001_initial.sql`.
  - Configurar `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` somente por ambiente seguro.
- [ ] Substituir o fallback local por repositórios Supabase para perfil, casal, experiências, objetivos e atividades.
  - Validar sincronização usando duas contas individuais em dois aparelhos.
- [ ] Implementar convite real entre contas e limite de dois membros por casal no servidor.
- [ ] Configurar notificações push, deep link para convite e preferências de privacidade.
- [ ] Criar conta Expo/EAS, configurar credenciais Android/iOS e gerar APK/AAB e build para TestFlight.
- [ ] Fazer testes em aparelho Android e iPhone, corrigindo teclado, acessibilidade, links e estados offline.
- [ ] Publicar primeiro em teste fechado na Google Play e TestFlight antes da distribuição pública.

## Limites conhecidos desta etapa

- Sem as credenciais de um projeto Supabase, o app abre em modo demonstrativo local e não sincroniza usuários entre aparelhos.
- A geração de builds de loja exige contas de desenvolvedor Google/Apple e configuração de credenciais fora do repositório.
