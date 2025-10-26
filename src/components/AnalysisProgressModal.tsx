import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography } from '../styles';
import { sessionService } from '../services/api';
import { SessionAnalysis } from '../types/sessions';

interface AnalysisProgressModalProps {
  visible: boolean;
  fileId: number;
  onClose: () => void;
  onComplete?: (analysisData: any) => void;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  visible,
  fileId,
  onClose,
  onComplete,
}) => {
  const [analysisStatus, setAnalysisStatus] = useState<SessionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && fileId) {
      startMonitoring();
    }
  }, [visible, fileId]);

  const startMonitoring = async () => {
    setIsLoading(true);
    
    const monitorInterval = setInterval(async () => {
      try {
        const status = await sessionService.getAnalysisStatus(fileId);
        setAnalysisStatus(status);

        if (status.status === 'completed') {
          clearInterval(monitorInterval);
          setIsLoading(false);
          if (onComplete) {
            onComplete(status.results);
          }
          onClose();
        } else if (status.status === 'failed') {
          clearInterval(monitorInterval);
          setIsLoading(false);
          onClose();
        }
      } catch (error) {
        console.error('Error monitoring analysis:', error);
        clearInterval(monitorInterval);
        setIsLoading(false);
        onClose();
      }
    }, 2000); // Проверяем каждые 2 секунды

    // Очищаем интервал при размонтировании
    return () => clearInterval(monitorInterval);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'processing': return colors.primary;
      case 'failed': return colors.error;
      default: return colors.gray[400];
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'transcribing': return 'Транскрипция аудио...';
      case 'analyzing': return 'Анализ содержания...';
      case 'generating_insights': return 'Генерация инсайтов...';
      case 'finalizing': return 'Завершение анализа...';
      default: return 'Обработка...';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Анализ сессии</Text>
            <Text style={styles.subtitle}>Пожалуйста, подождите...</Text>
          </View>

          <View style={styles.content}>
            {isLoading && (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.progressText}>
                  {analysisStatus ? getStageText(analysisStatus.stage) : 'Запуск анализа...'}
                </Text>
                
                {analysisStatus && (
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${analysisStatus.progress}%`,
                          backgroundColor: getProgressColor(analysisStatus.status)
                        }
                      ]} 
                    />
                  </View>
                )}
                
                {analysisStatus?.progress && (
                  <Text style={styles.progressPercentage}>
                    {analysisStatus.progress}%
                  </Text>
                )}

                {analysisStatus?.estimatedTime && (
                  <Text style={styles.estimatedTime}>
                    Примерное время: {analysisStatus.estimatedTime}
                  </Text>
                )}
              </View>
            )}

            {analysisStatus?.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Ошибка: {analysisStatus.error}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: typography.fontWeights.medium,
  },
  estimatedTime: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  errorContainer: {
    backgroundColor: colors.error + '10',
    padding: spacing.md,
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
});




