import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { TextInput } from 'react-native';
import { hex_sha256 } from '../utils/sha256';

interface DocumentUploadProps {
  onSuccess: (documentName: string) => void;
  username: string;
}

interface UploadResponse {
  ok: boolean;
  status: number;
  text: string;
}

export default function DocumentUpload({ onSuccess, username }: DocumentUploadProps) {
  const [documentName, setDocumentName] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentPick = async () => {
    try {
      if (!documentName.trim()) {
        setError('Por favor, insira um nome para o documento');
        return;
      }

      setIsUploading(true);
      setError('');

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        setIsUploading(false);
        return;
      }

      const file = result.assets[0];
      console.log('Arquivo selecionado:', {
        name: file.name,
        type: file.mimeType,
        size: file.size,
        uri: file.uri
      });

      // Criar o FormData
      const formData = new FormData();
      
      // Hash do username antes de enviar
      const hashedUsername = hex_sha256(username);
      
      // Adicionar campos de texto com o username hasheado
      formData.append('username', hashedUsername);
      formData.append('nome_documento', documentName);
      formData.append('is_file', 'true');

      if (Platform.OS === 'web') {
        // No ambiente web, precisamos buscar o arquivo como blob
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('file', blob, file.name);
      } else {
        // Em dispositivos móveis, preparar o objeto de arquivo corretamente
        const fileUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
        
        // Se for Android ou iOS, vamos tentar ler o arquivo como base64
        if (fileUri.startsWith('file:') || fileUri.startsWith('/')) {
          try {
            const base64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64
            });
            
            // Criar um Blob a partir do base64
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            formData.append('file', blob, file.name);
          } catch (e) {
            // Se falhar a leitura como base64, tenta o método padrão
            formData.append('file', {
              uri: fileUri,
              type: file.mimeType || 'application/pdf',
              name: file.name || 'document.pdf',
            } as any);
          }
        } else {
          // Fallback para o método padrão
          formData.append('file', {
            uri: fileUri,
            type: file.mimeType || 'application/pdf',
            name: file.name || 'document.pdf',
          } as any);
        }
      }      console.log('Enviando arquivo...');
      
      // Usar XMLHttpRequest em vez de fetch
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://n8n.bernardolobo.com.br/webhook/3262a7a4-87ca-4732-83c7-67d480a02540', true);
      xhr.setRequestHeader('Authorization', 'Basic YWRtaW46YWRtaW4=');
      
      // Configurar handlers de resposta
      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              ok: true,
              status: xhr.status,
              text: xhr.responseText
            });
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Network Error'));
        };
      });

      // Enviar o arquivo
      xhr.send(formData);
      
      // Aguardar resposta
      const response = await uploadPromise;
      console.log('Status:', response.status);
      console.log('Resposta:', response.text);
      
      if (response.ok) {
        const currentDocumentName = documentName;
        setDocumentName('');
        Alert.alert('Sucesso', 'Documento enviado com sucesso!');
        onSuccess(currentDocumentName);
      } else {
        throw new Error(`Erro ${response.status}: ${response.text}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro no upload:', errorMessage);
      setError(`Falha ao enviar documento: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do documento"
        value={documentName}
        onChangeText={setDocumentName}
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        editable={!isUploading}
      />
      
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      
      <TouchableOpacity 
        style={[styles.button, isUploading && styles.buttonDisabled]} 
        onPress={handleDocumentPick}
        disabled={isUploading}
      >
        <ThemedText style={styles.buttonText}>
          {isUploading ? 'Enviando...' : 'Selecionar e Enviar Documento'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#0a7ea477',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
});
