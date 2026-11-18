# MVP Nós — entregas

- [x] Tela inicial com resumo do casal, visão rápida do progresso e uma recomendação em destaque.
  - Exibir saudação, contexto do casal, atividade recomendada e progresso de objetivos.
- [x] Navegação principal entre Início, Descobrir, Objetivos, Comunidade e Minha conta.
  - Alternar as áreas sem recarregar a aplicação e manter o estado local.
- [x] Área Descobrir com catálogo de experiências e atividades recomendadas para o casal.
  - Cada sugestão possui um recurso externo acionável, como receita, livro para comprar, restaurante, playlist ou pesquisa de destino.
  - Exibir cards com título, tipo, duração, custo, descrição e ação principal.
- [x] Filtros de recomendações por tempo disponível, orçamento e tipo de programa.
  - Permitir combinar filtros e voltar para a visão completa.
- [x] Cards de sugestões com ações funcionais para salvar e marcar como concluídas.
  - Refletir visualmente os estados salvo e concluído e persistir no navegador.
- [x] Objetivos compartilhados com descrição, etapas, indicador de progresso e edição.
  - Criar, editar, excluir e avançar objetivos; preservar a tela após recarregar.
- [x] Conta individual para cada pessoa.
  - Exibir nome e e-mail próprios e permitir edição dos dados da conta.
- [x] Vínculo de uma conta individual a um casal.
  - Exibir código de convite, entrar com código, gerenciar vínculo e sair do casal.
- [x] Bloqueio das funcionalidades compartilhadas enquanto a conta não estiver vinculada.
  - Bloquear Início, Descobrir, Objetivos e Comunidade e mostrar CTA para conectar ao casal.
- [x] Desbloqueio das funcionalidades após o vínculo.
  - Liberar experiências, objetivos, progresso e comunidade competitiva após entrar em um casal.
- [x] Sistema demonstrativo de amigos e outros casais.
  - Mostrar casais, cidades, sequência de uso e atividades compartilhadas por eles.
- [x] Competitividade saudável entre casais.
  - Exibir pontos, ranking semanal, posição do casal, progresso para subir e placar de amigos.
- [x] Convite de amigos dentro da Comunidade.
  - Gerar código demonstrativo e permitir copiar o código pelo modal de convite.
- [x] Perfil do casal e preferências.
  - Mostrar nomes, tempo juntos, localização, disponibilidade, orçamento e preferências.
- [x] Notificações, menu mobile, modais e estados de feedback.
  - Tornar os controles principais interativos e responsivos.
- [x] Documentação do produto e do desenvolvimento.
  - Entregar o resumo completo em `resumo-completo-mvp-nos.txt`.

## Limites atuais do MVP

- Os dados estão persistidos apenas no `localStorage` do navegador.
- O vínculo, amigos, ranking e atividades sociais são demonstrativos; ainda não há autenticação real, banco de dados, convites enviados por servidor ou sincronização entre usuários.
- O código de convite demonstrativo do casal Yuri & Vitoria é `NOS-YV4K`.
