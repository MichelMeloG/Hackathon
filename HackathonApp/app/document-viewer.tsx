import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { WebView } from 'react-native-webview';
import { hex_sha256 } from '@/utils/sha256';
import { useAuth } from '@/hooks/useAuth';

const API_ENDPOINT = 'https://n8n.bernardolobo.com.br/webhook/3262a7a4-87ca-4732-83c7-67d480a02540';

export default function DocumentViewerScreen() {
  const { username } = useAuth();
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Olá! Como posso ajudar você a entender melhor este documento?', isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');  const formatExplanation = (text: string) => {
    if (!text) return '';
    
    // Remove tags HTML que possam vir na resposta
    text = text.replace(/<[^>]*>/g, '');
    
    // Remove marcadores especiais como ---CLAU. FIM---
    text = text.replace(/---[^-]*---/g, '');
    
    // Remove caracteres especiais extras
    text = text.replace(/\[|\]|\{|\}/g, '');
    
    // Identifica possíveis quebras de parágrafo baseado em pontuação seguida de maiúscula
    text = text.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');
    
    // Identifica seções numeradas e adiciona quebras
    text = text.replace(/(\d+\s*[).:-])\s*/g, '\n\n$1 ');
    
    // Identifica cláusulas e adiciona quebras
    text = text.replace(/\b(CLÁUSULA|Cláusula|Art\.|Artigo)\s+/g, '\n\n$1 ');
    
    // Remove múltiplas quebras de linha
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Limpa espaços extras antes de pontuação
    text = text.replace(/\s+([.,!?])/g, '$1');
    
    // Limpa linhas que contém apenas números ou caracteres especiais
    const lines = text.split('\n').filter(line => {
      const cleanLine = line.trim();
      return cleanLine && !/^\d+$/.test(cleanLine) && !/^[^a-zA-Z0-9]+$/.test(cleanLine);
    });
    
    // Agrupa linhas em parágrafos
    const paragraphs = lines.reduce((acc: string[], line: string) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return acc;
      
      // Verifica se é um novo parágrafo ou continuação
      const isNewParagraph = 
        /^(CLÁUSULA|Cláusula|Art\.|Artigo|\d+\s*[).:-])/.test(trimmedLine) ||
        (acc.length > 0 && /[.!?]$/.test(acc[acc.length - 1]));
      
      if (isNewParagraph) {
        acc.push(trimmedLine);
      } else if (acc.length > 0) {
        acc[acc.length - 1] += ' ' + trimmedLine;
      } else {
        acc.push(trimmedLine);
      }
      
      return acc;
    }, []);
    
    // Formata cada parágrafo
    const formattedParagraphs = paragraphs
      .map(p => {
        let cleaned = p.trim();
        // Capitaliza a primeira letra se não começar com número ou palavra especial
        if (!/^(\d|CLÁUSULA|Cláusula|Art\.|Artigo)/.test(cleaned)) {
          cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
        return cleaned;
      })
      .filter(p => p && p.length > 3);
    
    return formattedParagraphs.join('\n\n');
  };

  const processUploadResponse = async (response: Response) => {
    try {
      const responseText = await response.text();
      console.log('Resposta completa:', responseText);

      if (responseText.trim()) {
        try {
          const data = JSON.parse(responseText);
          console.log('Resposta em formato JSON:', data);
          const rawExplanation = data?.explanation || data?.result || data?.text || data?.content;
          
          if (rawExplanation) {
            const formattedExplanation = formatExplanation(rawExplanation);
            setExplanation(formattedExplanation);
            setMessages(prev => [...prev, {
              text: 'Documento processado com sucesso! Você pode fazer perguntas sobre ele.',
              isBot: true
            }]);
            return true;
          }
        } catch (e) {
          console.log('Resposta não é JSON, usando texto como explicação');
          const formattedExplanation = formatExplanation(responseText);
          setExplanation(formattedExplanation);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      return false;
    }
  };

  const handleUploadDocument = async (fileUri: string) => {
    if (!username) {
      Alert.alert('Erro', 'Você precisa estar logado para enviar documentos.');
      return;
    }

    setIsLoading(true);
    setExplanation('');
    
    try {
      const formData = new FormData();
      const hashedUsername = hex_sha256(username);
      
      formData.append('username', hashedUsername);
      
      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('file', blob, documentName + '.pdf');
      } else {
        formData.append('file', {
          uri: fileUri,
          type: 'application/pdf',
          name: documentName + '.pdf',
        } as any);
      }
      
      formData.append('is_file', 'true');
      formData.append('nome_documento', documentName);
      
      console.log('Enviando documento...');
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Tenta processar a resposta imediatamente
      let success = await processUploadResponse(response);
      
      // Se não teve sucesso, espera um pouco e tenta novamente
      if (!success) {
        console.log('Primeira tentativa não retornou explicação, aguardando e tentando novamente...');
        setExplanation('Processando documento, por favor aguarde...');
        
        // Espera 2 segundos e tenta novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const secondResponse = await fetch(API_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!secondResponse.ok) {
          throw new Error(`HTTP error on retry! status: ${secondResponse.status}`);
        }

        success = await processUploadResponse(secondResponse);
        
        if (!success) {
          setExplanation('Não foi possível processar o documento. Por favor, tente novamente.');
        }
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      Alert.alert(
        'Erro no Upload',
        'Não foi possível processar o documento. ' + (error.message || 'Erro desconhecido')
      );
      setExplanation('Ocorreu um erro ao processar o documento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };  const pickDocument = async () => {
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
        
        // Remove a extensão .pdf do nome do arquivo, se existir
        const fileName = selectedFile.name || 'document';
        const cleanFileName = fileName.toLowerCase().endsWith('.pdf') 
          ? fileName.slice(0, -4) 
          : fileName;
        
        setPdfUri(selectedFile.uri);
        setDocumentName(cleanFileName);
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

  const DocumentExplanationView = ({ explanation }: { explanation: string }) => {
    if (!explanation) {
      return (
        <ThemedView style={styles.emptyExplanation}>
          <ThemedText style={styles.emptyExplanationText}>
            A explicação simplificada do documento aparecerá aqui após o processamento.
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <ScrollView style={styles.explanationScrollView}>
        <ThemedView style={styles.explanationContainer}>
          <ThemedText style={styles.explanationTitle}>Explicação Simplificada</ThemedText>
          <ThemedText style={styles.explanationText}>{explanation}</ThemedText>
        </ThemedView>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Coluna Esquerda - Documento Original */}      <ScrollView style={styles.column}>
        <ThemedView style={styles.documentContainer}>
          <ThemedText style={styles.columnTitle}>Documento Original</ThemedText>
            <TextInput
            style={styles.documentNameInput}
            placeholder="Nome do documento (preenchido automaticamente)"
            value={documentName}
            onChangeText={setDocumentName}
            placeholderTextColor="#666"
            maxLength={100}
            editable={true} // Permite edição manual se necessário
          />
          
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

      {/* Coluna do meio - Explicação */}
      <ThemedView style={[styles.column, styles.middleColumn]}>
        <DocumentExplanationView explanation={explanation} />
      </ThemedView>

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
  documentNameInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#2A2A2A',
  },
  column: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  middleColumn: {
    flex: 2,
    padding: 0,
    overflow: 'hidden',
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
  explanationScrollView: {
    flex: 1,
    width: '100%',
  },
  explanationContainer: {
    padding: 20,
    flex: 1,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },  explanationText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#444',
    textAlign: 'justify',
    paddingHorizontal: 5,
    marginBottom: 24,
  },
  emptyExplanation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyExplanationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
