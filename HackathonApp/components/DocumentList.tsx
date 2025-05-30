import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { router } from 'expo-router';
import { hex_sha256 } from '../utils/sha256';

interface DocumentListProps {
  username: string;
}

export default function DocumentList({ username }: DocumentListProps) {
  const [documents, setDocuments] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const hashedUsername = hex_sha256(username);
      console.log('Fetching documents for user:', username);
      console.log('Hashed username:', hashedUsername);
        const response = await fetch(
        `https://n8n.bernardolobo.com.br/webhook/historico-documentos?username=${encodeURIComponent(hashedUsername)}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao buscar documentos');
      }
      
      const data = await response.json();
      console.log('Documents received:', data);
      setDocuments(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      setError('Não foi possível carregar os documentos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchDocuments();
    }
  }, [username]);

  const handleDocumentSelect = (documentName: string) => {
    router.push({
      pathname: '/document-viewer',
      params: { documentName }
    });
  };

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDocuments}>
          <ThemedText style={styles.retryText}>🔄 Atualizar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Seus Documentos</ThemedText>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDocuments}>
          <ThemedText>🔄</ThemedText>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <ThemedText style={styles.loadingText}>Carregando documentos...</ThemedText>
      ) : (
        <ScrollView style={styles.list}>
          {documents.map((doc, index) => (
            <TouchableOpacity
              key={index}
              style={styles.documentItem}
              onPress={() => handleDocumentSelect(doc)}
            >
              <ThemedText style={styles.documentName}>{doc}</ThemedText>
            </TouchableOpacity>
          ))}
          {documents.length === 0 && !error && (
            <ThemedText style={styles.emptyMessage}>
              Nenhum documento encontrado
            </ThemedText>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  list: {
    flex: 1,
  },
  documentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  documentName: {
    fontSize: 16,
    color: '#ffffff',
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 20,
  },
  refreshButton: {
    padding: 8,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  retryText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  }
});
