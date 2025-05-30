# Tradutor Jurídico: Sua Ferramenta de Acesso à Informação Jurídica

O **Tradutor Jurídico** é um aplicativo inovador, desenvolvido para desmistificar a linguagem jurídica e tornar documentos legais acessíveis a todos. Ele permite que usuários carreguem PDFs de documentos jurídicos, como contratos de aluguel ou outros, e recebam uma tradução para uma linguagem mais cotidiana, além de oferecer um sistema de chat para tirar dúvidas específicas sobre o conteúdo.

---
## Visão Geral

Nosso objetivo é empoderar cidadãos que não são da área jurídica, fornecendo uma ferramenta que lhes permita compreender plenamente os documentos com os quais interagem. Acreditamos que a clareza e a acessibilidade da informação jurídica são fundamentais para promover a justiça e a autonomia individual. O aplicativo é a nossa contribuição para o desafio de IA do IBMEC, demonstrando o uso aplicado de ferramentas de Inteligência Artificial Generativa para um bem social.

---
### ✨ Principais Funcionalidades

📄 **Upload de Documentos Jurídicos**:
* Permite o upload fácil e seguro de documentos em formato PDF.
* Associa um nome personalizado ao documento para fácil identificação.

📝 **Tradução Inteligente**:
* Utiliza inteligência artificial generativa para traduzir a linguagem jurídica complexa para termos do dia a dia.
* Apresenta o documento original e a versão traduzida lado a lado para comparação.

💬 **Sistema de Chat Interativo**:
* Integrado ao visualizador de documentos, possibilitando interações em tempo real.
* Permite que o usuário faça perguntas específicas sobre o conteúdo do documento, recebendo respostas claras e concisas.

🔒 **Autenticação Segura**:
* Sistema de registro e login com hash de credenciais (username e senha) para maior segurança.
* Autenticação persistente, garantindo que o usuário permaneça logado.

🎨 **Interface Intuitiva e Agradável**:
* Tema escuro consistente para uma experiência visual confortável.
* Componentes de UI reutilizáveis (`ThemedText`, `ThemedView`) para uma experiência de usuário coesa.
* Design responsivo que se adapta a diferentes tamanhos de tela.

---
### 💻 Pilha de Tecnologia

* **Frontend (Mobile)**: React Native / Expo
* **Linguagem de Programação**: TypeScript
* **Navegação**: Expo Router
* **Armazenamento Local**: AsyncStorage (para autenticação persistente)
* **Segurança de Credenciais**: SHA-256 para hashing de senhas e usernames
* **Sistema de Temas**: Personalizado (`Colors.ts`)
* **APIs**:
    * **Registro**: `https://n8n.bernardolobo.com.br/webhook/19473c7c-99bf-40b4-b2e0-d4c548970872`
    * **Login**: `https://n8n.bernardolobo.com.br/webhook/login`
    * **Upload**: `https://n8n.bernardolobo.com.br/webhook-test/3262a7a4-87ca-4732-83c7-67d480a02540`
    * **Histórico de Documentos**: `https://n8n.bernardolobo.com.br/webhook-test/historico-documentos`

---
### 🏗️ Estrutura do Projeto

Nosso repositório pode ser encontrado em: [github.com/MichelMeloG/Hackathon](https://github.com/MichelMeloG/Hackathon)

A arquitetura do projeto é organizada para facilitar o desenvolvimento e a manutenção:
```
Hackathon/
├── app/                  # Rotas e telas principais (expo-router)
│   ├── (auth)/           # Telas de autenticação (login, register)
│   ├── (tabs)/           # Telas da área logada (home, document-viewer)
│   ├── _layout.tsx       # Layout principal da aplicação
│   ├── document-viewer.tsx # Visualizador de documentos
│   ├── index.tsx         # Tela inicial (home)
│   ├── login.tsx         # Tela de login
│   └── register.tsx      # Tela de registro
├── assets/               # Imagens e outros recursos estáticos
├── components/           # Componentes UI reutilizáveis (e.g., ThemedText, ThemedView)
├── constants/            # Constantes da aplicação (e.g., Colors.ts)
├── hooks/                # Hooks personalizados (e.g., useAuth)
├── utils/                # Funções utilitárias diversas
├── App.tsx               # Componente principal do Expo
├── app.json              # Configurações do Expo
├── babel.config.js       # Configuração do Babel
├── tsconfig.json         # Configuração do TypeScript
└── package.json          # Dependências e scripts do projeto
```
---
### 🚀 Começando (Desenvolvimento)

Para configurar o ambiente de desenvolvimento e rodar o projeto localmente:

#### Pré-requisitos

* Node.js e npm (ou yarn)
* Expo CLI (instalado globalmente: `npm install -g expo-cli`)
* Um emulador de Android/iOS ou um dispositivo físico

#### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/MichelMeloG/Hackathon.git](https://github.com/MichelMeloG/Hackathon.git)
    cd Hackathon
    ```

2.  **Instale as dependências:**
    ```bash
    npm install # ou yarn install
    ```

3.  **Inicie o aplicativo:**
    ```bash
    npx expo start
    ```
    Isso abrirá o Metro Bundler no seu navegador. Você pode escanear o QR Code com o aplicativo Expo Go no seu celular ou escolher rodar em um emulador/simulador.

---
### 🗺️ Próximos Passos e Evolução

Este projeto representa um MVP funcional com um grande potencial de expansão. Planejamos as seguintes iterações:

* **Refinamento da IA Generativa**: Aprimorar a qualidade das traduções e a precisão das respostas do chat, utilizando modelos de IA mais avançados e otimizados para o domínio jurídico.
* **Integração com Modelos de Linguagem Específicos**: Explorar o uso de modelos de linguagem treinados especificamente em dados jurídicos para melhorar a compreensão e a geração de texto.
* **Funcionalidades Adicionais**: Considerar a adição de funcionalidades como destaque de termos jurídicos, glossário interativo, ou até mesmo integração com bases de dados jurídicas para referências.
* **Feedback e Avaliação**: Implementar um sistema de feedback para que os usuários possam avaliar a qualidade das traduções e interações do chat, permitindo melhorias contínuas.

## Integrantes

- Guilherme Batista
- Bryan Amorim
- Michel Mello
- Bernardo Lobo
- Bernardo Moureira
