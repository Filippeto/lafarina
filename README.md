# La Farina Studio · V0.1

Protótipo mobile-first em português para a rotina da La Farina Artesanal. A base foi construída a partir da identidade visual fornecida e utiliza dados simulados (inclusive preços e custos).

## Validação sem instalação

Abra `LaFarina-Studio-Preview.html` diretamente no Chrome ou Edge. Este HTML portátil contém os mesmos módulos de regras, dados, telas e estilos do projeto, com um renderizador sem dependências para permitir testes offline. O projeto principal utiliza React, Vite e Tailwind CSS; o HTML de validação não executa o React. Se o navegador bloquear a persistência de arquivos locais, utilize a aplicação servida via Vite.

## Projeto para publicação

É necessário Node.js 20+ e acesso ao registro npm.

```sh
npm install
npm run dev
npm run build
npm run preview
```

No Netlify, importe um repositório GitHub com o conteúdo desta pasta; `netlify.toml` configura a compilação e a pasta `dist`. Também é possível arrastar o conteúdo de `dist` para o Netlify Drop após o build. Para GitHub Pages, use a configuração do GitHub Actions incluída (`Settings > Pages > Source: GitHub Actions`). A navegação por hash evita depender de redirecionamentos no servidor.

## O que é possível validar

- Dashboard com indicadores calculados e atalhos, período de hoje/7 dias/mês.
- Produção: criar, editar, remover e avançar status de fornadas.
- Vendas: registrar quantidade, preço, cliente, data e pagamento; consultar histórico.
- Encomendas: acompanhar status até a entrega; a entrega registra a venda automaticamente, uma única vez.
- Financeiro: receita, custos diretos estimados dos produtos vendidos, despesas adicionais e resultado estimado. Não equivale a fluxo de caixa ou lucro contábil. Evite duplicar despesas já incluídas no custo unitário.
- Catálogo: editar preço/custo, descrição e disponibilidade de produtos; valores históricos são preservados nos registros.
- Estúdio: selecionar referências, visualizar foto local, preparar, copiar e salvar prompts. Não gera imagens nem envia arquivos externamente.
- Configurações: perfil, link de pasta Drive, exportação/importação de backup e restauração dos dados de exemplo.

## Arquitetura e integração futura

`src/data.js`: tipos de registros, dados de exemplo, adapter local e funções de cálculo. `src/store.js`: estado e operações de negócio. `src/view.js`: templates de telas e formulários compartilhados entre React e a prévia autônoma. `src/main.jsx`: aplicação React com estado externo via `useSyncExternalStore`. `src/styles.css` e `src/tailwind.css`: design responsivo e pipeline Tailwind. `public/assets`: logo e referências fornecidos.

O adapter `localRepository` concentra persistência, hoje em `localStorage`. O modelo usa identificadores estáveis, referências de produto e snapshots de preço/custo. A evolução para Supabase deve implementar persistência assíncrona, autenticação da usuária, RLS por proprietária, transações para entrega de encomendas e migração/validação dos dados. A integração Drive está separada em `driveRepository`, atualmente somente link para pasta; autenticação OAuth e upload ainda não estão implementados. `.env.example` reserva os nomes das configurações públicas; nunca coloque segredos administrativos no frontend.

Os registros ficam apenas no navegador usado, não são sincronizados ou enviados ao Google Drive. Faça backup antes de limpar os dados, trocar de dispositivo ou restaurar a demonstração.

Para regenerar a prévia independente após alterar o projeto: `node scripts/preview.mjs`.
