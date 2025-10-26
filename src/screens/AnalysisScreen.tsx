import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../styles';
import { sessionService } from '../services/api';
import { MediaFile, AnalysisResult } from '../types/sessions';

export const AnalysisScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const sessionId = route?.params?.sessionId;
  
  const [unanalyzedFiles, setUnanalyzedFiles] = useState<MediaFile[]>([]);
  const [analyzedFiles, setAnalyzedFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{[key: number]: {
    progress: number,
    stage: string,
    estimatedTime?: string,
    timestamp?: string,
    startedAt?: number
  }}>({});
  const [activeTab, setActiveTab] = useState<string>('analyzed');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [nestedTabValue, setNestedTabValue] = useState<string>('criteria');
  const [competencyAnalysis, setCompetencyAnalysis] = useState<Array<{
    criterion: string;
    loading: boolean;
    result?: {
      competence: string;
      definition: string;
      markers: Array<{
        id: number;
        name: string;
        observed: boolean;
        explanation?: string;
      }>;
      overall_competence_observed: boolean;
    };
    error?: string;
  }>>([]);
  const [competencyAccordionOpen, setCompetencyAccordionOpen] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (sessionId) {
      // Если передан sessionId, ищем этот файл в проанализированных
      const file = analyzedFiles.find(f => f.id === sessionId);
      if (file) {
        setSelectedFile(file);
        loadAnalysisData(file);
      }
    }
  }, [sessionId, analyzedFiles]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      console.log('Loading files for analysis...');
      
      const [unanalyzedData, analyzedData] = await Promise.all([
        sessionService.getUnanalyzedFiles(),
        sessionService.getAnalyzedFiles()
      ]);
      
      console.log('📁 AnalysisScreen: Unanalyzed files:', unanalyzedData.length);
      console.log('📁 AnalysisScreen: Analyzed files:', analyzedData.length);
      console.log('📁 AnalysisScreen: Unanalyzed data:', unanalyzedData);
      console.log('📁 AnalysisScreen: Analyzed data:', analyzedData);
      
      setUnanalyzedFiles(unanalyzedData);
      setAnalyzedFiles(analyzedData);

      // Если есть проанализированные файлы и не выбран файл, выбираем первый
      if (analyzedData.length > 0 && !selectedFile) {
        setActiveTab('analyzed');
        await selectFile(analyzedData[0]);
      } else if (analyzedData.length === 0 && unanalyzedData.length > 0) {
        setActiveTab('unanalyzed');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить файлы');
    } finally {
      setLoading(false);
    }
  };

  const selectFile = async (file: MediaFile) => {
    console.log('🎯 AnalysisScreen: selectFile called with file:', file.id, file.originalName);
    setSelectedFile(file);
    
    // Сбрасываем состояние компетенций при выборе нового файла
    setCompetencyAccordionOpen(null);
    setCompetencyAnalysis([]);
    
    await loadAnalysisData(file);
  };

  const loadAnalysisData = async (file: MediaFile) => {
    console.log('🔍 AnalysisScreen: loadAnalysisData called for file:', file.id);
    console.log('🔍 AnalysisScreen: File properties:', {
      isAnalyzed: file.isAnalyzed,
      analysisStatus: file.analysisStatus,
      analysisData: file.analysisData,
      score: file.score,
      hasAnalysisData: !!file.analysisData
    });
    
    // Проверяем, проанализирован ли файл
    if (!isFileAnalyzed(file)) {
      console.log('⚠️ AnalysisScreen: File is not analyzed, skipping');
      return;
    }
    
    console.log('✅ AnalysisScreen: File is analyzed, proceeding with data loading');
    
    try {
      setIsLoadingAnalysis(true);
      console.log('📊 AnalysisScreen: Loading analysis data for file:', file.id);
      
      // В web версии данные анализа хранятся в file.analysisData как JSON строка
      if (file.analysisData) {
        try {
          const parsed = typeof file.analysisData === 'string' 
            ? JSON.parse(file.analysisData) 
            : file.analysisData;
          console.log('Analysis data loaded from file:', parsed);
          setAnalysisData(parsed);
        } catch (parseError) {
          console.error('Error parsing analysis data:', parseError);
          // Если не удалось распарсить, пытаемся загрузить через API
          try {
            const analysis = await sessionService.getAnalysisResults(file.id);
            setAnalysisData(analysis);
          } catch (apiError) {
            console.error('Error loading analysis via API:', apiError);
          }
        }
      } else {
        // Если данных нет в файле, пытаемся загрузить через API
        try {
          const analysis = await sessionService.getAnalysisResults(file.id);
          setAnalysisData(analysis);
        } catch (apiError) {
          console.error('Error loading analysis via API:', apiError);
        }
      }
      
      // Получаем транскрипцию
      try {
        console.log('🔍 AnalysisScreen: Loading transcription for file:', file.id);
        const transcriptionData = await sessionService.getTranscription(file.id);
        console.log('✅ AnalysisScreen: Transcription data received:', transcriptionData);
        console.log('✅ AnalysisScreen: Transcription length:', transcriptionData.transcription?.length || 0);
        setTranscription(transcriptionData.transcription);
      } catch (error) {
        console.error('❌ AnalysisScreen: Error loading transcription:', error);
        console.error('❌ AnalysisScreen: Transcription error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setTranscription('');
      }

      // Загружаем сохраненные результаты анализа компетенций
      try {
        console.log('🔍 AnalysisScreen: Loading competency analysis for file:', file.id);
        const competencyData = await sessionService.getCompetencyAnalysis(file.id);
        console.log('✅ AnalysisScreen: Competency data received:', competencyData);
        
        const savedAnalysis = competencyData.map(item => ({
          criterion: item.criterion,
          loading: false,
          result: item.result
        }));
        console.log('✅ AnalysisScreen: Processed competency analysis:', savedAnalysis);
        setCompetencyAnalysis(savedAnalysis);
      } catch (error) {
        console.error('❌ AnalysisScreen: Error loading competency analysis:', error);
        console.error('❌ AnalysisScreen: Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setCompetencyAnalysis([]);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const startAnalysis = async (fileId: number) => {
    try {
      console.log('Starting analysis for file:', fileId);
      await sessionService.startAnalysis(fileId);
      Alert.alert('Анализ запущен', 'Анализ будет выполнен в фоновом режиме');
      
      // Обновляем статус файла
      setUnanalyzedFiles(prev =>
        prev.map(file =>
          file.id === fileId
            ? { ...file, analysisStatus: 'transcribing' }
            : file
        )
      );
      
      // Запускаем мониторинг прогресса
      monitorAnalysisProgress(fileId);
    } catch (error) {
      console.error('Error starting analysis:', error);
      Alert.alert('Ошибка', 'Не удалось запустить анализ');
    }
  };

  const monitorAnalysisProgress = async (fileId: number) => {
    const startTime = Date.now();
    setAnalysisProgress(prev => ({
      ...prev,
      [fileId]: {
        progress: 0,
        stage: 'Начинаем анализ...',
        startedAt: startTime
      }
    }));

    const checkProgress = async () => {
      try {
        const progress = await sessionService.monitorUploadProgress(fileId);
        setAnalysisProgress(prev => ({
          ...prev,
          [fileId]: {
            progress: progress.progress,
            stage: progress.stage,
            estimatedTime: progress.estimatedTime,
            timestamp: new Date().toISOString()
          }
        }));

        if (progress.status === 'completed') {
          // Анализ завершен, обновляем файлы
          loadFiles();
          setAnalysisProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        } else if (progress.status === 'error') {
          Alert.alert('Ошибка анализа', progress.error || 'Неизвестная ошибка');
          setAnalysisProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        } else {
          // Продолжаем мониторинг
          setTimeout(checkProgress, 2000);
        }
      } catch (error) {
        console.error('Error monitoring progress:', error);
        setTimeout(checkProgress, 5000);
      }
    };

    setTimeout(checkProgress, 1000);
  };

  const onRefresh = async () => {
    await loadFiles();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'transcribing': 
      case 'processing': return colors.warning;
      case 'pending': return colors.gray[400];
      default: return colors.gray[400];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'transcribing': return 'Транскрипция';
      case 'processing': return 'Анализ';
      case 'pending': return 'Ожидает';
      default: return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return colors.success;
    if (score >= 6) return colors.warning;
    return colors.error;
  };

  const isFileAnalyzed = (file: MediaFile) => {
    return file.isAnalyzed || 
           file.analysisStatus === 'completed' || 
           !!file.analysisData || 
           !!file.score;
  };

  const renderFileCard = (file: MediaFile, isAnalyzed: boolean) => (
    <TouchableOpacity
      key={file.id}
      style={[
        styles.fileCard,
        selectedFile?.id === file.id && styles.selectedFileCard
      ]}
      onPress={() => {
        console.log('🖱️ AnalysisScreen: File card pressed for file:', file.id, file.originalName);
        selectFile(file);
      }}
    >
      <View style={styles.fileHeader}>
        <Text style={styles.fileName} numberOfLines={2}>
          {file.originalName}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(file.analysisStatus || 'pending') }]}>
          <Text style={styles.statusText}>
            {getStatusText(file.analysisStatus || 'pending')}
          </Text>
        </View>
      </View>
      
      <View style={styles.fileMeta}>
        <Text style={styles.fileDate}>
          {new Date(file.createdAt).toLocaleDateString('ru-RU')}
        </Text>
        <Text style={styles.fileDuration}>
          {file.duration || 0} мин
        </Text>
        {isAnalyzed && file.score && file.score > 0 && (
          <Text style={[styles.fileScore, { color: getScoreColor(file.score) }]}>
            {file.score}/10
          </Text>
        )}
      </View>

      {file.analysisStatus === 'transcribing' || file.analysisStatus === 'processing' ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingText}>
            {analysisProgress[file.id]?.stage || 'Обработка...'}
          </Text>
        </View>
      ) : !isAnalyzed && (
        <TouchableOpacity
          style={styles.startAnalysisButton}
          onPress={() => startAnalysis(file.id)}
        >
          <Text style={styles.startAnalysisText}>Запустить анализ</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // Функции для рендеринга табов
  const renderCriteriaTab = () => {
    if (!analysisData?.structureCompliance) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Данные структуры недоступны</Text>
        </View>
      );
    }

    const structure = analysisData.structureCompliance;
    const criteriaBlocks = [
      {
        title: "1. ПОСТРОЕНИЕ ПОНИМАНИЯ ТЕМЫ",
        description: "Уточнить запрос менти • Спросить ожидания",
        score: structure.topicUnderstanding?.score || 5,
        status: structure.topicUnderstanding?.status || '⚠',
        proof: structure.topicUnderstanding?.proof || 'Нет данных',
        timeSpent: "8 мин 15 сек"
      },
      {
        title: "2. РАМКА ВОПРОСА И СЛОЖНОСТЬ",
        description: "Расспросил контекст • Выяснил, в чём трудность",
        score: structure.questionFrame?.score || 5,
        status: structure.questionFrame?.status || '⚠',
        proof: structure.questionFrame?.proof || 'Нет данных',
        timeSpent: "12 мин 30 сек"
      },
      {
        title: "3. ИНСАЙТ (МЕНТИ СНАЧАЛА)",
        description: "Попросил идеи менти до совета • Поделился опытом",
        score: structure.insightFirst?.score || 5,
        status: structure.insightFirst?.status || '⚠',
        proof: structure.insightFirst?.proof || 'Нет данных',
        timeSpent: "18 мин 45 сек"
      },
      {
        title: "4. СОВЕТ МЕНТОРА",
        description: "Поделился опытом, привёл примеры",
        score: structure.mentorAdvice?.score || 5,
        status: structure.mentorAdvice?.status || '⚠',
        proof: structure.mentorAdvice?.proof || 'Нет данных',
        timeSpent: "12 мин 30 сек"
      },
      {
        title: "5. ПРОВЕРКА ПОНИМАНИЯ СОВЕТА",
        description: "Проверил понимание предложенных решений",
        score: structure.adviceUnderstanding?.score || 5,
        status: structure.adviceUnderstanding?.status || '⚠',
        proof: structure.adviceUnderstanding?.proof || 'Нет данных',
        timeSpent: "5 мин 20 сек"
      },
      {
        title: "6. ВЫЯВЛЕНИЕ СИЛЬНЫХ СТОРОН",
        description: "Идентификация и использование сильных сторон",
        score: structure.strengths?.score || 5,
        status: structure.strengths?.status || '⚠',
        proof: structure.strengths?.proof || 'Нет данных',
        timeSpent: "10 мин 15 сек"
      },
      {
        title: "7. ПОИСК И ВЫБОР РЕШЕНИЯ",
        description: "Обоснованность выбора решений",
        score: structure.solutionChoice?.score || 5,
        status: structure.solutionChoice?.status || '⚠',
        proof: structure.solutionChoice?.proof || 'Нет данных',
        timeSpent: "15 мин 30 сек"
      },
      {
        title: "8. SMART-УТОЧНЕНИЕ ПЛАНА",
        description: "Качество планирования действий",
        score: structure.smartPlan?.score || 5,
        status: structure.smartPlan?.status || '⚠',
        proof: structure.smartPlan?.proof || 'Нет данных',
        timeSpent: "8 мин 45 сек"
      },
      {
        title: "9. ИТОГ И ЦЕННОСТЬ",
        description: "Эффективность подведения итогов сессии",
        score: structure.summary?.score || 5,
        status: structure.summary?.status || '⚠',
        proof: structure.summary?.proof || 'Нет данных',
        timeSpent: "5 мин 10 сек"
      },
      {
        title: "10. ЗАПРОС ОБРАТНОЙ СВЯЗИ",
        description: "Качество обратной связи",
        score: structure.feedback?.score || 5,
        status: structure.feedback?.status || '⚠',
        proof: structure.feedback?.proof || 'Нет данных',
        timeSpent: "3 мин 25 сек"
      }
    ];

    return (
      <View style={styles.criteriaContainer}>
        {criteriaBlocks.map((block, index) => (
          <View key={index} style={styles.criteriaCard}>
            <View style={styles.criteriaHeader}>
              <Text style={styles.criteriaTitle}>{block.title}</Text>
              <View style={styles.criteriaScore}>
                <Text style={styles.criteriaScoreText}>{block.score}/10</Text>
                <Text style={styles.criteriaTimeText}>{block.timeSpent}</Text>
              </View>
            </View>
            <Text style={styles.criteriaDescription}>{block.description}</Text>
            
            <View style={styles.criteriaProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${block.score * 10}%`,
                      backgroundColor: block.score >= 8 ? colors.success : block.score >= 6 ? colors.warning : colors.error
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.criteriaStatus,
                { color: block.score >= 8 ? colors.success : block.score >= 6 ? colors.warning : colors.error }
              ]}>
                {block.score >= 8 ? "Отлично" : block.score >= 6 ? "Хорошо" : "Требует внимания"}
              </Text>
            </View>

            <View style={styles.criteriaProof}>
              <Text style={styles.criteriaProofTitle}>Ключевые действия:</Text>
              <Text style={styles.criteriaProofText}>✓ {block.proof}</Text>
            </View>

            <View style={styles.criteriaSuggestion}>
              <Text style={styles.criteriaSuggestionTitle}>💡 Рекомендация:</Text>
              <Text style={styles.criteriaSuggestionText}>
                {block.score >= 8 ? "Отличная работа! Продолжайте в том же духе." :
                 block.score >= 6 ? "Хорошая работа, есть возможности для улучшения." :
                 "Рекомендуется больше внимания уделить этому аспекту."}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const getCompetencyTitle = (criterion: string) => {
    switch (criterion) {
      case 'balance_challenge_support':
        return 'Создавать баланс между вызовом и поддержкой';
      case 'make_observations':
        return 'Делать наблюдения';
      case 'listen':
        return 'Слушать';
      case 'share_experience':
        return 'Передавать свой опыт';
      case 'maintain_effective_focus':
        return 'Поддерживать эффективный фокус';
      case 'check_understanding':
        return 'Проверять понимание';
      default:
        return criterion;
    }
  };

  const renderCompetencyTab = () => {
    console.log('🔍 AnalysisScreen: Rendering competency tab, competencyAnalysis length:', competencyAnalysis.length);
    console.log('🔍 AnalysisScreen: Selected file:', selectedFile?.id, selectedFile?.originalName);
    console.log('🔍 AnalysisScreen: Is file analyzed:', selectedFile ? isFileAnalyzed(selectedFile) : false);
    
    if (!selectedFile) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Выберите файл для просмотра анализа компетенций</Text>
        </View>
      );
    }

    if (!isFileAnalyzed(selectedFile)) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Файл не проанализирован</Text>
        </View>
      );
    }

    if (competencyAnalysis.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Результаты анализа компетенций недоступны</Text>
        </View>
      );
    }

    return (
      <View style={styles.competencyContainer}>
        <View style={styles.competencyHeader}>
          <Text style={styles.competencyTitle}>Результаты анализа компетенций</Text>
          <Text style={styles.competencySubtitle}>
            Детальный анализ проявления компетенций в сессии
          </Text>
        </View>
        
        <View style={styles.competencyResultsList}>
          {competencyAnalysis.map((result, index) => (
            <View key={index} style={styles.competencyResultCard}>
              <TouchableOpacity
                style={styles.competencyResultHeader}
                onPress={() => setCompetencyAccordionOpen(
                  competencyAccordionOpen === result.criterion ? null : result.criterion
                )}
              >
                <View style={styles.competencyResultTitleContainer}>
                  <Text style={styles.competencyResultTitle}>
                    {getCompetencyTitle(result.criterion)}
                  </Text>
                  {result.result && (
                    <View style={[
                      styles.competencyResultBadge,
                      { backgroundColor: result.result.overall_competence_observed ? colors.success : colors.gray[300] }
                    ]}>
                      <Text style={[
                        styles.competencyResultBadgeText,
                        { color: result.result.overall_competence_observed ? colors.white : colors.gray[600] }
                      ]}>
                        {result.result.overall_competence_observed ? '✅ Проявлена' : '❌ Не проявлена'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.competencyResultMarkers}>
                  {result.result?.markers?.filter(m => m.observed).length || 0}/{result.result?.markers?.length || 0} маркеров
                </Text>
                <Text style={styles.competencyResultArrow}>
                  {competencyAccordionOpen === result.criterion ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {competencyAccordionOpen === result.criterion && (
                <View style={styles.competencyResultContent}>
                  {result.loading ? (
                    <View style={styles.competencyLoading}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.competencyLoadingText}>Анализируем...</Text>
                    </View>
                  ) : result.result ? (
                    <View style={styles.competencyResultDetails}>
                      {/* Маркеры компетенции */}
                      <View style={styles.competencyMarkersSection}>
                        <Text style={styles.competencyMarkersTitle}>Маркеры компетенции:</Text>
                        <View style={styles.competencyMarkersList}>
                          {result.result.markers.map((marker) => (
                            <View key={marker.id} style={styles.competencyMarkerItem}>
                              <View style={styles.competencyMarkerHeader}>
                                <Text style={styles.competencyMarkerName}>{marker.name}</Text>
                                <View style={[
                                  styles.competencyMarkerBadge,
                                  { backgroundColor: marker.observed ? colors.success : colors.gray[300] }
                                ]}>
                                  <Text style={[
                                    styles.competencyMarkerBadgeText,
                                    { color: marker.observed ? colors.white : colors.gray[600] }
                                  ]}>
                                    {marker.observed ? '✅ Проявлен' : '❌ Не проявлен'}
                                  </Text>
                                </View>
                              </View>
                              {marker.explanation && (
                                <View style={styles.competencyMarkerExplanation}>
                                  <Text style={styles.competencyMarkerExplanationText}>
                                    {marker.explanation}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      {/* Общий результат компетенции */}
                      <View style={styles.competencyOverallResult}>
                        <View style={styles.competencyOverallHeader}>
                          <Text style={styles.competencyOverallTitle}>Общий результат:</Text>
                          <View style={[
                            styles.competencyOverallBadge,
                            { backgroundColor: result.result.overall_competence_observed ? colors.success : colors.gray[300] }
                          ]}>
                            <Text style={[
                              styles.competencyOverallBadgeText,
                              { color: result.result.overall_competence_observed ? colors.white : colors.gray[600] }
                            ]}>
                              {result.result.overall_competence_observed ? '✅ Компетенция проявлена' : '❌ Компетенция не проявлена'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.competencyOverallStats}>
                          Проявлено маркеров: {result.result.markers.filter(m => m.observed).length}/{result.result.markers.length}
                        </Text>
                        {result.result.definition && (
                          <Text style={styles.competencyOverallDefinition}>
                            {result.result.definition}
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.competencyError}>Ошибка анализа</Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTranscriptionTab = () => {
    if (!transcription) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Транскрипция недоступна</Text>
        </View>
      );
    }

    return (
      <View style={styles.transcriptionContainer}>
        <View style={styles.transcriptionHeader}>
          <Text style={styles.transcriptionTitle}>Транскрипция сессии</Text>
          <Text style={styles.transcriptionSubtitle}>
            Автоматически сгенерированная расшифровка с разметкой по блокам
          </Text>
        </View>
        <View style={styles.transcriptionContent}>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      </View>
    );
  };

  const renderRecommendationsTab = () => {
    if (!analysisData) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Рекомендации недоступны</Text>
        </View>
      );
    }

    return (
      <View style={styles.recommendationsContainer}>
        {/* Общая оценка */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreTitle}>Общая оценка</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(analysisData.overallScore) }]}>
            {analysisData.overallScore}/10
          </Text>
        </View>

        {/* Сильные стороны */}
        {analysisData.keyInsights && analysisData.keyInsights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Сильные стороны</Text>
            {analysisData.keyInsights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.insightIcon}>✅</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Области для улучшения */}
        {analysisData.recommendations && analysisData.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Области для улучшения</Text>
            {analysisData.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>⚠️</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Чек-лист для следующей сессии */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Чек-лист для следующей сессии</Text>
          <View style={styles.checklistContainer}>
            <View style={styles.checklistSection}>
              <Text style={styles.checklistSectionTitle}>Перед сессией:</Text>
              <View style={styles.checklistItem}>
                <Text style={styles.checklistIcon}>☐</Text>
                <Text style={styles.checklistText}>Подготовить конкретные вопросы о прогрессе</Text>
              </View>
              <View style={styles.checklistItem}>
                <Text style={styles.checklistIcon}>☐</Text>
                <Text style={styles.checklistText}>Просмотреть записи предыдущей встречи</Text>
              </View>
            </View>
            <View style={styles.checklistSection}>
              <Text style={styles.checklistSectionTitle}>Во время сессии:</Text>
              <View style={styles.checklistItem}>
                <Text style={styles.checklistIcon}>☐</Text>
                <Text style={styles.checklistText}>Фиксировать конкретные временные рамки</Text>
              </View>
              <View style={styles.checklistItem}>
                <Text style={styles.checklistIcon}>☐</Text>
                <Text style={styles.checklistText}>Задавать уточняющие вопросы по планам</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAnalysisContent = () => {
    if (!selectedFile) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Выберите файл для просмотра анализа</Text>
        </View>
      );
    }

    if (isLoadingAnalysis) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка анализа...</Text>
        </View>
      );
    }

    if (!analysisData) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Анализ недоступен</Text>
        </View>
      );
    }

    // Если выбран таб "Анализировать по критериям", показываем только таб компетенций
    if (activeTab === 'analyzed-structure') {
      return (
        <View style={styles.analysisContainer}>
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {renderCompetencyTab()}
          </ScrollView>
        </View>
      );
    }

    // Для таба "Проанализированные" показываем все табы
    return (
      <View style={styles.analysisContainer}>
        {/* Табы */}
        <View style={styles.nestedTabContainer}>
          <TouchableOpacity
            style={[styles.nestedTab, nestedTabValue === 'criteria' && styles.activeNestedTab]}
            onPress={() => setNestedTabValue('criteria')}
          >
            <Text style={[styles.nestedTabText, nestedTabValue === 'criteria' && styles.activeNestedTabText]}>
              Оценка по структуре
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nestedTab, nestedTabValue === 'competency' && styles.activeNestedTab]}
            onPress={() => setNestedTabValue('competency')}
          >
            <Text style={[styles.nestedTabText, nestedTabValue === 'competency' && styles.activeNestedTabText]}>
              Оценка по критериям
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nestedTab, nestedTabValue === 'transcription' && styles.activeNestedTab]}
            onPress={() => setNestedTabValue('transcription')}
          >
            <Text style={[styles.nestedTabText, nestedTabValue === 'transcription' && styles.activeNestedTabText]}>
              Транскрипция
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nestedTab, nestedTabValue === 'recommendations' && styles.activeNestedTab]}
            onPress={() => setNestedTabValue('recommendations')}
          >
            <Text style={[styles.nestedTabText, nestedTabValue === 'recommendations' && styles.activeNestedTabText]}>
              Рекомендации
            </Text>
          </TouchableOpacity>
        </View>

        {/* Содержимое табов */}
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {nestedTabValue === 'criteria' && renderCriteriaTab()}
          {nestedTabValue === 'competency' && renderCompetencyTab()}
          {nestedTabValue === 'transcription' && renderTranscriptionTab()}
          {nestedTabValue === 'recommendations' && renderRecommendationsTab()}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка файлов...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Анализ сессий</Text>
        <Text style={styles.subtitle}>Анализ ваших менторских сессий</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unanalyzed' && styles.activeTab]}
          onPress={() => setActiveTab('unanalyzed')}
        >
          <Text style={[styles.tabText, activeTab === 'unanalyzed' && styles.activeTabText]}>
            Неанализированные ({unanalyzedFiles.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analyzed-structure' && styles.activeTab]}
          onPress={() => setActiveTab('analyzed-structure')}
        >
          <Text style={[styles.tabText, activeTab === 'analyzed-structure' && styles.activeTabText]}>
            Анализировать по критериям ({analyzedFiles.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analyzed' && styles.activeTab]}
          onPress={() => setActiveTab('analyzed')}
        >
          <Text style={[styles.tabText, activeTab === 'analyzed' && styles.activeTabText]}>
            Проанализированные ({analyzedFiles.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* File List */}
        <View style={styles.filesContainer}>
          {activeTab === 'unanalyzed' ? (
            unanalyzedFiles.length > 0 ? (
              unanalyzedFiles.map(file => renderFileCard(file, isFileAnalyzed(file)))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Нет неанализированных файлов</Text>
              </View>
            )
          ) : activeTab === 'analyzed-structure' ? (
            analyzedFiles.length > 0 ? (
              analyzedFiles.map(file => renderFileCard(file, isFileAnalyzed(file)))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Нет проанализированных файлов</Text>
              </View>
            )
          ) : (
            analyzedFiles.length > 0 ? (
              analyzedFiles.map(file => renderFileCard(file, isFileAnalyzed(file)))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Нет проанализированных файлов</Text>
              </View>
            )
          )}
        </View>

        {/* Analysis Content */}
        {(activeTab === 'analyzed' || activeTab === 'analyzed-structure') && renderAnalysisContent()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text,
    marginTop: spacing.md,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    fontWeight: typography.fontWeights.medium,
  },
  activeTabText: {
    color: colors.primary,
  },
  filesContainer: {
    padding: spacing.lg,
  },
  fileCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFileCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  fileName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.white,
  },
  fileMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fileDate: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  fileDuration: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  fileScore: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  processingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  startAnalysisButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  startAnalysisText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  analysisContent: {
    flex: 1,
    padding: spacing.lg,
  },
  scoreSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  insightBullet: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  insightText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    flex: 1,
  },
  transcriptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Стили для табов анализа
  analysisContainer: {
    flex: 1,
  },
  nestedTabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  nestedTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeNestedTab: {
    borderBottomColor: colors.primary,
  },
  nestedTabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
  activeNestedTabText: {
    color: colors.primary,
  },
  tabContent: {
    flex: 1,
    padding: spacing.lg,
  },
  // Стили для таба критериев
  criteriaContainer: {
    gap: spacing.md,
  },
  criteriaCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  criteriaTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  criteriaScore: {
    alignItems: 'flex-end',
  },
  criteriaScoreText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  criteriaTimeText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[600],
  },
  criteriaDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  criteriaProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  criteriaStatus: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  criteriaProof: {
    marginBottom: spacing.sm,
  },
  criteriaProofTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  criteriaProofText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  criteriaSuggestion: {
    backgroundColor: colors.gray[50],
    padding: spacing.sm,
    borderRadius: 8,
  },
  criteriaSuggestionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  criteriaSuggestionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  // Стили для таба транскрипции
  transcriptionContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  transcriptionHeader: {
    marginBottom: spacing.md,
  },
  transcriptionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  transcriptionSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  transcriptionContent: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  // Стили для таба рекомендаций
  recommendationsContainer: {
    gap: spacing.md,
  },
  checklistContainer: {
    gap: spacing.md,
  },
  checklistSection: {
    gap: spacing.sm,
  },
  checklistSectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checklistIcon: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginTop: 2,
  },
  checklistText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  // Стили для таба компетенций
  competencyContainer: {
    gap: spacing.lg,
  },
  competencyHeader: {
    marginBottom: spacing.md,
  },
  competencyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  competencySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  competencyList: {
    gap: spacing.md,
  },
  competencyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  competencyCardContent: {
    marginBottom: spacing.md,
  },
  competencyCardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  competencyCardDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  competencyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  competencyButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  // Стили для результатов анализа компетенций
  competencyResultsList: {
    gap: spacing.md,
  },
  competencyResultCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  competencyResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  competencyResultTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  competencyResultTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    flex: 1,
  },
  competencyResultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  competencyResultBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  competencyResultMarkers: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginRight: spacing.sm,
  },
  competencyResultArrow: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  competencyResultContent: {
    padding: spacing.md,
  },
  competencyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  competencyLoadingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
  },
  competencyResultDetails: {
    gap: spacing.lg,
  },
  competencyMarkersSection: {
    gap: spacing.md,
  },
  competencyMarkersTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  competencyMarkersList: {
    gap: spacing.sm,
  },
  competencyMarkerItem: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: spacing.sm,
  },
  competencyMarkerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  competencyMarkerName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    flex: 1,
  },
  competencyMarkerBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  competencyMarkerBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  competencyMarkerExplanation: {
    backgroundColor: colors.gray[50],
    padding: spacing.sm,
    borderRadius: 6,
  },
  competencyMarkerExplanationText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[600],
    lineHeight: 16,
  },
  competencyOverallResult: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  competencyOverallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  competencyOverallTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  competencyOverallBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  competencyOverallBadgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  competencyOverallStats: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  competencyOverallDefinition: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    lineHeight: 18,
  },
  competencyError: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    textAlign: 'center',
  },
});