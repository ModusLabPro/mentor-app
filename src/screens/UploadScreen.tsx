import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import FilePicker from '../components/FilePicker';
import { colors, spacing, typography } from '../styles';
import { sessionService } from '../services/api';
import { MediaFile, UploadOptions } from '../types/sessions';
import { AudioExtractor, AudioExtractionResult } from '../utils/audioExtractor';

export const UploadScreen = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [recentFiles, setRecentFiles] = useState<MediaFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [extractedAudio, setExtractedAudio] = useState<AudioExtractionResult | null>(null);
  const [uploadMode, setUploadMode] = useState<'original' | 'audio-extract' | 'audio-only'>('original');

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const files = await sessionService.getUserFiles();
      setRecentFiles(files.slice(0, 5)); // Показываем только последние 5 файлов
    } catch (error) {
      console.error('Error loading recent files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFilePicker = async () => {
    try {
      console.log('Starting file picker...');
      
      // Используем альтернативный FilePicker
      const filePicker = new FilePicker({
        onFileSelected: async (file) => {
          console.log('File selected:', file);
          setSelectedFile(file);
          
          // Определяем тип файла
          if (file.type?.startsWith('video/')) {
            setUploadMode('audio-extract');
          } else if (file.type?.startsWith('audio/')) {
            setUploadMode('audio-only');
          } else {
            setUploadMode('original');
          }
        },
        onError: (error) => {
          console.error('File picker error:', error);
          Alert.alert('Ошибка', `Не удалось выбрать файл: ${error}`);
        },
      });

      filePicker.pick();
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Ошибка', `Не удалось выбрать файл: ${error.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleExtractAudio = async () => {
    if (!selectedFile || !selectedFile.type?.startsWith('video/')) {
      Alert.alert('Ошибка', 'Можно извлечь аудио только из видео файлов');
      return;
    }

    setIsExtractingAudio(true);
    setUploadProgress(0);

    try {
      // Симулируем прогресс извлечения
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 5;
        });
      }, 100);

      // Извлекаем аудио в MP3 формате
      const result = await AudioExtractor.extractAudioFromVideo(selectedFile, {
        format: 'mp3',
        quality: 'low',  // 128 kbps для речи
        bitrate: 128
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setExtractedAudio(result);
      setUploadMode('audio-extract');
      Alert.alert(
        'Успех', 
        `Аудио извлечено! Длительность: ${result.duration.toFixed(1)}с`
      );
      
      setTimeout(() => {
        setIsExtractingAudio(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Ошибка извлечения аудио:', error);
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Ошибка извлечения аудио');
      setIsExtractingAudio(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = async (file?: any) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) {
      Alert.alert('Ошибка', 'Файл не выбран');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage('Подготовка файла...');

    try {
      // Проверяем, является ли файл мок-файлом (для демонстрации)
      // Теперь мы работаем с реальными файлами, поэтому убираем проверку на мок-файлы
      if (false) { // Отключаем демо режим для реальных файлов
        // Для демонстрации симулируем загрузку
        setUploadStage('Симуляция загрузки...');
        setUploadProgress(25);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadStage('Симуляция обработки...');
        setUploadProgress(50);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadStage('Симуляция анализа...');
        setUploadProgress(75);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadProgress(100);
        setUploadStage('Завершено');
        
        Alert.alert(
          'Демо режим', 
          'Файл загружен в демо режиме. Для реальной загрузки запустите backend сервер.',
          [{ text: 'OK', onPress: loadRecentFiles }]
        );
        
        setIsUploading(false);
        return;
      }

      let fileToProcess = fileToUpload;
      let uploadOptions: UploadOptions;

      // Определяем режим загрузки
      if (uploadMode === 'audio-extract' && extractedAudio) {
        // Загружаем извлеченное аудио
        // Проверяем, есть ли реальный файл
        if (extractedAudio.audioFilePath && extractedAudio.audioFilePath.startsWith('file://')) {
          fileToProcess = {
            name: `audio_from_${fileToUpload.name}`,
            type: extractedAudio.audioBlob.type,
            size: extractedAudio.audioBlob.size,
            uri: extractedAudio.audioFilePath
          };
          console.log('Используем извлеченное аудио файл:', extractedAudio.audioFilePath);
        } else {
          // Если нет реального файла, используем оригинальный файл
          console.log('Нет реального аудио файла, используем оригинальный файл');
          fileToProcess = fileToUpload;
        }
        uploadOptions = {
          transcriptionEnabled: true,
          autoAnalysis: true,
          language: 'ru',
          quality: 'standard',
          originalFileName: fileToUpload.name,
          isAudioExtract: true,
          extractAudio: true,
          audioFormat: 'mp3'
        };
      } else if (uploadMode === 'audio-only' && fileToUpload.type?.startsWith('audio/')) {
        // Загружаем аудио файл как есть
        uploadOptions = {
          transcriptionEnabled: true,
          autoAnalysis: true,
          language: 'ru',
          quality: 'standard',
          originalFileName: fileToUpload.name
        };
      } else {
        // Загружаем оригинальный файл (видео или другой)
        uploadOptions = {
          transcriptionEnabled: true,
          autoAnalysis: true,
          language: 'ru',
          quality: 'standard',
          originalFileName: fileToUpload.name
        };
      }

      setUploadStage('Загрузка файла на сервер...');
      
      const uploadedFile = await sessionService.uploadFile(fileToProcess, uploadOptions);
      
      console.log('Файл успешно загружен на сервер:', uploadedFile);
      
      setUploadProgress(50);
      setUploadStage('Обработка файла...');

      // Мониторим прогресс обработки
      const monitorProgress = async () => {
        try {
          const progress = await sessionService.monitorUploadProgress(uploadedFile.id);
          setUploadProgress(progress.progress);
          setUploadStage(progress.stage);

          if (progress.status === 'completed') {
            setUploadProgress(100);
            setUploadStage('Завершено');
            Alert.alert(
              'Успех', 
              'Файл загружен и обработан успешно! Анализ будет доступен в разделе "Анализ".',
              [{ text: 'OK', onPress: loadRecentFiles }]
            );
          } else if (progress.status === 'failed') {
            throw new Error(progress.error || 'Ошибка обработки файла');
          } else {
            // Продолжаем мониторинг
            setTimeout(monitorProgress, 2000);
          }
        } catch (error) {
          console.error('Error monitoring progress:', error);
          throw error;
        }
      };

      // Запускаем мониторинг через 2 секунды
      setTimeout(monitorProgress, 2000);

    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить файл. Попробуйте еще раз.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'processing': return colors.warning;
      case 'pending': return colors.gray[400];
      case 'failed': return colors.error;
      default: return colors.gray[400];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'processing': return 'Обработка';
      case 'pending': return 'Ожидает';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Загрузка сессий</Text>
          <Text style={styles.subtitle}>Загружайте записи ваших менторских сессий</Text>
        </View>

        <View style={styles.uploadSection}>
          <View style={styles.uploadArea}>
            <Text style={styles.uploadIcon}>📁</Text>
            <Text style={styles.uploadTitle}>
              {isUploading ? 'Загрузка файла...' : 'Выберите файл для загрузки'}
            </Text>
            <Text style={styles.uploadSubtitle}>
              {isUploading ? uploadStage : 'Нажмите для выбора аудио или видео файла'}
            </Text>
            
            {isUploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${uploadProgress}%` }]} 
                  />
                </View>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
              onPress={handleFilePicker}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.uploadButtonText}>Выбрать файл</Text>
              )}
            </TouchableOpacity>

            {/* Информация о выбранном файле */}
            {selectedFile && (
              <View style={styles.selectedFileContainer}>
                <Text style={styles.selectedFileTitle}>Выбранный файл:</Text>
                <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                <Text style={styles.selectedFileInfo}>
                  {selectedFile.type} • {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </Text>
                
                {selectedFile.type?.startsWith('video/') && !extractedAudio && (
                  <TouchableOpacity 
                    style={[styles.extractButton, isExtractingAudio && styles.extractButtonDisabled]}
                    onPress={handleExtractAudio}
                    disabled={isExtractingAudio}
                  >
                    {isExtractingAudio ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.extractButtonText}>Извлечь аудио</Text>
                    )}
                  </TouchableOpacity>
                )}

                {extractedAudio && (
                  <View style={styles.extractedAudioInfo}>
                    <Text style={styles.extractedAudioTitle}>Аудио извлечено:</Text>
                    <Text style={styles.extractedAudioInfo}>
                      Длительность: {extractedAudio.duration.toFixed(1)}с • 
                      Размер: {(extractedAudio.audioBlob.size / (1024 * 1024)).toFixed(1)} MB
                    </Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.uploadSelectedButton, isUploading && styles.uploadSelectedButtonDisabled]}
                  onPress={() => handleUpload()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.uploadSelectedButtonText}>
                      {uploadMode === 'audio-extract' ? 'Загрузить аудио' : 'Загрузить файл'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поддерживаемые форматы</Text>
          <View style={styles.formatList}>
            <View style={styles.formatItem}>
              <Text style={styles.formatIcon}>🎵</Text>
              <Text style={styles.formatText}>Аудио: MP3, WAV, M4A</Text>
            </View>
            <View style={styles.formatItem}>
              <Text style={styles.formatIcon}>🎥</Text>
              <Text style={styles.formatText}>Видео: MP4, MOV, AVI</Text>
            </View>
            <View style={styles.formatItem}>
              <Text style={styles.formatIcon}>📄</Text>
              <Text style={styles.formatText}>Документы: PDF, DOC, TXT</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Рекомендации</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>Используйте качественную запись для лучшего анализа</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>⏱️</Text>
              <Text style={styles.tipText}>Оптимальная длительность сессии: 30-60 минут</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipIcon}>🔇</Text>
              <Text style={styles.tipText}>Минимизируйте фоновые шумы</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Недавние загрузки</Text>
          {isLoadingFiles ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Загрузка файлов...</Text>
            </View>
          ) : recentFiles.length > 0 ? (
            <View style={styles.filesList}>
              {recentFiles.map((file) => (
                <TouchableOpacity key={file.id} style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.originalName}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {new Date(file.createdAt).toLocaleDateString('ru-RU')} • {file.fileSize} байт
                    </Text>
                  </View>
                  <View style={styles.fileStatus}>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: getStatusColor(file.analysisStatus) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(file.analysisStatus)}
                      </Text>
                    </View>
                    {file.score && (
                      <Text style={styles.scoreText}>{file.score}/10</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Пока нет загруженных файлов</Text>
              <Text style={styles.emptyStateSubtext}>Загрузите первую сессию для начала анализа</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  uploadSection: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  uploadSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  formatList: {
    gap: spacing.md,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  formatIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  formatText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  tipsList: {
    gap: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    marginTop: 2,
  },
  tipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
  },
  progressContainer: {
    width: '100%',
    marginVertical: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
  },
  filesList: {
    gap: spacing.sm,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  fileInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  fileName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  fileMeta: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  fileStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
  },
  scoreText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginLeft: spacing.sm,
  },
  selectedFileContainer: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedFileTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  selectedFileName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selectedFileInfo: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  extractButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  extractButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  extractButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  extractedAudioInfo: {
    backgroundColor: colors.green[50],
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  extractedAudioTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.green[800],
    marginBottom: spacing.xs,
  },
  extractedAudioInfo: {
    fontSize: typography.fontSizes.sm,
    color: colors.green[700],
  },
  uploadSelectedButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadSelectedButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  uploadSelectedButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
});
