import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { WebView } from 'react-native-webview';

const API_ENDPOINT = 'https://n8n.bernardolobo.com.br/webhook/3262a7a4-87ca-4732-83c7-67d480a02540';

export default function DocumentViewerScreen() {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Olá! Como posso ajudar você a entender melhor este documento?', isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const handleUploadDocument = async (fileUri: string) => {
    setIsLoading(true);
    setExplanation(''); // Limpa a explicação anterior
    console.log('Iniciando upload do documento:', fileUri);
    
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('files', blob, 'document.pdf');
      } else {
        formData.append('files', {
          uri: fileUri,
          type: 'application/pdf',
          name: 'document.pdf',
        } as any);
      }

      formData.append('text', 'Por favor, explique este documento jurídico em linguagem simples.');

      console.log('Enviando requisição para:', API_ENDPOINT);
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Resposta completa:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      if (!responseText.trim()) {
        const message = 'O documento foi recebido e está sendo processado. Por favor, aguarde um momento e tente novamente.';
        console.log('Resposta vazia, definindo mensagem padrão:', message);
        setExplanation(message);
        return;
      }

      try {
        let explanation: string | null = null;

        // Primeiro, tenta fazer o parse do JSON
        try {
          const data = JSON.parse(responseText);
          console.log('Resposta em formato JSON:', data);
          explanation = data?.explanation || data?.result || data?.text || data?.content;
        } catch (e) {
          // Se não for JSON, usa o texto como explicação
          explanation = responseText;
        }

        console.log('Explicação extraída:', explanation);
        
        if (explanation) {
          console.log('Definindo explicação no estado');
          setExplanation(explanation);
          setMessages(prev => [...prev, {
            text: 'Documento processado com sucesso! Você pode fazer perguntas sobre ele.',
            isBot: true
          }]);
        } else {
          console.log('Não foi possível extrair a explicação da resposta');
          setExplanation('Não foi possível processar a resposta do servidor. Por favor, tente novamente.');
        }
      } catch (e: unknown) {
        console.error('Erro ao processar resposta:', e);
        if (typeof responseText === 'string' && responseText.includes('<!DOCTYPE html>')) {
          throw new Error('O servidor retornou uma página HTML em vez de JSON');
        } else if (e instanceof Error) {
          throw new Error(`Erro ao processar resposta: ${e.message}`);
        } else {
          throw new Error('Erro desconhecido ao processar resposta');
        }
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      Alert.alert(
        'Erro no Upload',
        'Não foi possível processar o documento. ' + (error.message || 'Erro desconhecido')
      );
      setExplanation('Ocorreu um erro ao processar o documento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      console.log('Iniciando seleção de documento');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      console.log('Resultado da seleção:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        console.log('Documento selecionado:', selectedFile.uri);
        setPdfUri(selectedFile.uri);
        await handleUploadDocument(selectedFile.uri);
      }
    } catch (err: any) {
      console.error('Erro ao selecionar documento:', err);
      Alert.alert(
        'Erro na Seleção',
        'Não foi possível selecionar o documento. ' + (err.message || 'Erro desconhecido')
      );
    }
  };

  const renderPdfViewer = () => {
    if (!pdfUri) {
      return (
        <TouchableOpacity 
          style={[styles.uploadButton, isLoading && styles.uploadButtonDisabled]} 
          onPress={pickDocument}
          disabled={isLoading}
        >
          <ThemedText style={styles.uploadButtonText}>
            {isLoading ? 'Processando...' : 'Selecionar PDF'}
          </ThemedText>
        </TouchableOpacity>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <iframe
          src={pdfUri}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 500,
            border: 'none'
          }}
        />
      );
    }

    // Para mobile, use WebView para visualizar o PDF
    return (
      <WebView
        source={{ uri: pdfUri }}
        style={styles.pdf}
        onError={(error) => {
          console.error('Erro ao carregar PDF:', error);
          Alert.alert('Erro', 'Não foi possível exibir o PDF');
        }}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Coluna Esquerda - Documento Original */}
      <ScrollView style={styles.column}>
        <ThemedView style={styles.documentContainer}>
          <ThemedText style={styles.columnTitle}>Documento Original</ThemedText>
          {renderPdfViewer()}
          {pdfUri && (
            <TouchableOpacity 
              style={[styles.newFileButton, isLoading && styles.uploadButtonDisabled]} 
              onPress={pickDocument}
              disabled={isLoading}
            >
              <ThemedText style={styles.uploadButtonText}>
                {isLoading ? 'Processando...' : 'Carregar novo arquivo'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ScrollView>

      {/* Coluna Central - Explicação */}
      <ScrollView style={styles.column}>
        <ThemedView style={styles.documentContainer}>
          <ThemedText style={styles.columnTitle}>Explicação Simplificada</ThemedText>
          {isLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>
                Simplificando documento
              </ThemedText>
              <ThemedText style={styles.loadingSubtext}>
                Aguarde...
              </ThemedText>
            </ThemedView>
          ) : (
            <ThemedText style={styles.documentText}>
              {explanation || 'Carregue um documento para ver a explicação'}
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>

      {/* Coluna Direita - Chat */}
      <ThemedView style={styles.column}>
        <ThemedText style={styles.columnTitle}>Chat</ThemedText>
        <ThemedView style={styles.chatContainer}>
          <ScrollView style={styles.chatMessages}>
            {messages.map((message, index) => (
              <ThemedView 
                key={index} 
                style={[
                  styles.messageContainer,
                  message.isBot ? styles.botMessage : styles.userMessage
                ]}
              >
                <ThemedText style={styles.message}>
                  {message.text}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua pergunta..."
              placeholderTextColor="#666"
              multiline
              value={inputMessage}
              onChangeText={setInputMessage}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1A1A1A', // Adicionando cor mais escura para o título
  },
  documentContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  documentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2A2A2A', // Cor mais escura para melhor legibilidade
  },
  uploadButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newFileButton: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 500,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 16,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#0a7ea4',
    alignSelf: 'flex-end',
  },
  message: {
    fontSize: 14,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    paddingTop: 16,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 100,
    color: '#2A2A2A', // Atualizando a cor do input também
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0a7ea4',  // Fundo azul
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',  // Texto em branco
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#ffffff',  // Texto em branco
    textAlign: 'center',
    opacity: 0.9,  // Sutilmente mais suave que o texto principal
  },
});
