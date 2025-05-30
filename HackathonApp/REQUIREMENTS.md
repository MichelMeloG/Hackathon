# Requisitos de Instalação - HackathonApp

Este documento lista todos os requisitos necessários para executar o HackathonApp em um novo ambiente de desenvolvimento.

## Requisitos do Sistema

1. **Node.js**
   - Versão recomendada: 18.x ou superior
   - Download: [https://nodejs.org/](https://nodejs.org/)

2. **npm (Node Package Manager)**
   - Incluído com a instalação do Node.js

3. **Expo CLI**
   - Instalar globalmente usando:
   ```bash
   npm install -g expo-cli
   ```

## Configuração do Ambiente

1. Clone o repositório do projeto
2. Na pasta do projeto (HackathonApp), execute:
   ```bash
   npm install
   ```

## Dependências Principais

O projeto utiliza as seguintes dependências principais:

### Dependências de Produção
- Expo (v53.0.9)
- React (v19.0.0)
- React Native (v0.79.2)
- Expo Router (v5.0.6)
- React Navigation
- Expo Document Picker
- React Native PDF
- React Native WebView
- AsyncStorage
- Várias extensões Expo (blur, constants, font, haptics, etc.)

### Dependências de Desenvolvimento
- TypeScript (v5.8.3)
- ESLint
- Babel
- Types para React e React Native

## Como Executar

Após instalar todas as dependências, você pode iniciar o aplicativo com:

```bash
npm start
```

## Requisitos para Desenvolvimento Mobile

### Para Android
- Android Studio com um emulador configurado
- OU um dispositivo Android físico com o aplicativo Expo Go instalado

### Para iOS (apenas em macOS)
- Xcode instalado
- OU um dispositivo iOS com o aplicativo Expo Go instalado

## Observações Importantes

1. Certifique-se de que todas as variáveis de ambiente necessárias estejam configuradas
2. Para desenvolvimento mobile, é recomendado ter o aplicativo Expo Go instalado no dispositivo de teste
3. Em caso de problemas com as dependências, tente executar:
   ```bash
   npm install --force
   ```

## Troubleshooting

Se encontrar problemas durante a instalação:

1. Limpe o cache do npm:
   ```bash
   npm cache clean --force
   ```

2. Delete a pasta node_modules e o arquivo package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. Reinstale as dependências:
   ```bash
   npm install
   ```
