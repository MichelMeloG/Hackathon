import { StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { hex_sha256 } from '../utils/sha256';
import { makeApiRequest } from '../utils/api';

interface Message {
  text: string;
  isUser: boolean;
}

export default function DocumentViewerScreen() {
  const { username } = useAuth();
  const params = useLocalSearchParams<{ documentName: string }>();
  const [documentContent, setDocumentContent] = useState({ original: '', translated: '' });
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');

  interface ApiResponse {
    ok: boolean;
    status: number;
    text: string;
  }

  useEffect(() => {
    if (username && params.documentName) {
      fetchDocumentContent();
    }
  }, [username, params.documentName]);

  if (!username) {
    Alert.alert('Erro', 'Você precisa estar logado para acessar esta página.');
    return null;
  }

  if (!params.documentName) {
    Alert.alert('Erro', 'Nome do documento não especificado.');
    return null;
  }  const fetchDocumentContent = async () => {
    try {
      const hashedUsername = hex_sha256(username);
      console.log('Buscando documento:', {
        username: hashedUsername,
        documentName: params.documentName
      });
      const response = await makeApiRequest(
        'https://n8n.bernardolobo.com.br/webhook/nome-documento',
        {
          nome_documento: params.documentName
        }
      );
      console.log('Resposta recebida:', response);
      let data;
      try {
        data = JSON.parse(response.text);
        console.log('Dados do documento:', data);
        console.log('documento_extraido:', data.documento_extraido);
        console.log('documento_traduzido:', data.documento_traduzido);
        if (!data.documento_extraido && !data.documento_traduzido) {
          throw new Error('Documento sem conteúdo');
        }
        setDocumentContent({
          original: data.documento_extraido || data.texto || 'Não foi possível carregar o texto original.',
          translated: data.documento_traduzido || data.traducao || 'Não foi possível carregar o texto traduzido.',
        });
      } catch (e) {
        // Se não for JSON, trata como texto puro e separa tradução
        console.warn('Resposta não é JSON. Usando texto puro e separando tradução.');
        const text = response.text || '';
        const traducaoTag = '<INICIO_TRADUCAO_COLQUIAL>';
        let original = text;
        let translated = '';
        if (text.includes(traducaoTag)) {
          const [orig, trans] = text.split(traducaoTag);
          original = orig.trim();
          translated = trans.replace(/<FIM_TRADUCAO_COLQUIAL>.*/s, '').trim();
        }
        setDocumentContent({
          original: original || 'Não foi possível carregar o texto original.',
          translated: translated || '',
        });
        return;
      }
    } catch (err) {
      console.error('Erro ao buscar conteúdo do documento:', err);
      setError('Não foi possível carregar o documento.');
    }
  };
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const message = chatInput.trim();
    setChatInput('');
    Keyboard.dismiss();

    // Adiciona a mensagem do usuário ao chat
    setChatMessages(prev => [...prev, { text: message, isUser: true }]);

    try {
      const hashedUsername = hex_sha256(username);
      
      console.log('Enviando mensagem:', {
        username: hashedUsername,
        documentName: params.documentName,
        message
      });      const response = await makeApiRequest(
        'https://n8n.bernardolobo.com.br/webhook-test/3262a7a4-87ca-4732-83c7-67d480a02540',
        {
          username: hashedUsername,
          nome_documento: params.documentName,
          is_file: 'false',
          chatInput: message,
        }
      );      if (!response.ok) {
        console.error('Erro na resposta do chat:', response.status, response.text);
        throw new Error('Falha ao enviar mensagem');
      }

      console.log('Resposta do chat:', response.text);
      
      let data;
      try {
        data = JSON.parse(response.text);
      } catch (e) {
        console.error('Erro ao fazer parse da resposta do chat:', e);
        throw new Error('Resposta inválida do servidor');
      }
      
      setChatMessages(prev => [...prev, { 
        text: data.resposta || 'Não foi possível obter resposta do assistente', 
        isUser: false 
      }]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem. Por favor, tente novamente.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Coluna Esquerda - Documento Original */}
      <ScrollView style={styles.column}>
        <ThemedView style={styles.documentContainer}>
          <ThemedText style={styles.columnTitle}>Documento Original</ThemedText>
          <ThemedText style={styles.documentText}>
            {documentContent.original}
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Coluna do meio - Documento Traduzido */}
      <ScrollView style={[styles.column, styles.middleColumn]}>
        <ThemedText style={styles.columnTitle}>Documento Traduzido</ThemedText>
        <ThemedText style={styles.documentText}>
          {documentContent.translated}
        </ThemedText>
      </ScrollView>

      {/* Coluna Direita - Chat */}
      <ThemedView style={styles.column}>
        <ThemedText style={styles.columnTitle}>Chat</ThemedText>
        <ThemedView style={styles.chatContainer}>
          <ScrollView style={styles.chatMessages}>
            {error ? (
              <ThemedText style={styles.error}>{error}</ThemedText>
            ) : (
              chatMessages.map((msg, index) => (
                <ThemedView
                  key={index}
                  style={[
                    styles.messageContainer,
                    msg.isUser ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  <ThemedText style={styles.message}>{msg.text}</ThemedText>
                </ThemedView>
              ))
            )}
          </ScrollView>
          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <ThemedText style={styles.sendButtonText}>Enviar</ThemedText>
            </TouchableOpacity>
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
    backgroundColor: '#151718',
  },
  column: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    margin: 5,
    borderRadius: 8,
  },
  middleColumn: {
    flex: 2,
    padding: 10,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#ffffff',
  },
  documentContainer: {
    borderRadius: 8,
    padding: 16,
    flex: 1,
  },
  documentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffff',
  },
  chatContainer: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
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
  userMessage: {
    backgroundColor: '#0a7ea4',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
  },
  message: {
    fontSize: 14,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
});
