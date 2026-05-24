# Gerenciador de Trocas — Copa do Mundo 2026

Um aplicativo web moderno de página única (SPA) projetado para colecionadores gerenciarem e trocarem figurinhas do álbum oficial da Copa do Mundo FIFA 2026. A aplicação é executada inteiramente no lado do cliente e armazena os dados localmente no navegador.

## Recursos Principais

- **Banco de Dados Completo**: Checklist com as 48 seleções em ordem de grupos do álbum, figurinhas especiais (incluindo o Logo Panini `00`) e promocionais da Coca-Cola.
- **Armazenamento Seguro**: Controle de progresso da coleção e figurinhas repetidas salvas no `localStorage`.
- **Compartilhamento de Trocas**: Geração de links curtos parametrizados (`?trade=...`) com suporte a nomes personalizados para divulgar suas figurinhas repetidas.
- **Painel de Comparação Ativo**: Ao abrir o link de um amigo, o sistema compara automaticamente a lista oferecida com as figurinhas que você já possui ou precisa, indicando visualmente as oportunidades de troca.
- **Backup JSON**: Funcionalidade de exportar e importar o progresso da coleção via arquivos JSON, com opção de mesclar (preservando o progresso atual) ou substituir.
- **Estética Premium**: Interface responsiva com design escuro e elementos em efeito vidro (glassmorphism), integrada com bandeiras e identificadores oficiais das seleções.

## Tecnologias Utilizadas

- **React** (Biblioteca de interface)
- **Vite** (Ambiente de desenvolvimento e build rápido)
- **Tailwind CSS** (Estilização responsiva e customizada)
- **Lucide React** (Pacote de ícones modernos)
