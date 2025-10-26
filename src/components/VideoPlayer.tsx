import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import { colors, typography, spacing } from '../styles';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  originalName?: string;
  onError?: (error: any) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  originalName,
  onError,
  style
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<Video>(null);

  const handleLoad = (data: any) => {
    console.log('🎥 VideoPlayer: Video loaded:', data);
    setLoading(false);
    setDuration(data.duration);
  };

  const handleError = (error: any) => {
    console.error('🎥 VideoPlayer: Video error:', error);
    setError(true);
    setLoading(false);
    if (onError) {
      onError(error);
    }
  };

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  const handlePress = () => {
    setShowControls(!showControls);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
    }
  };

  const handleSeek = (event: any) => {
    const { locationX } = event.nativeEvent;
    const progress = locationX / screenWidth;
    const newTime = progress * duration;
    seekTo(newTime);
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Не удалось загрузить видео</Text>
          {originalName && (
            <Text style={styles.errorFileName}>Файл: {originalName}</Text>
          )}
          <Text style={styles.errorUrl}>URL: {videoUrl}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(false);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          paused={paused}
          onLoad={handleLoad}
          onError={handleError}
          onProgress={handleProgress}
          resizeMode="contain"
          controls={false}
          onLoadStart={() => {
            console.log('🎥 VideoPlayer: Starting to load video:', videoUrl);
            setLoading(true);
          }}
          onLoadEnd={() => {
            console.log('🎥 VideoPlayer: Load ended for video:', videoUrl);
            setLoading(false);
          }}
        />
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingText}>Загрузка видео...</Text>
          </View>
        )}

        {showControls && !loading && (
          <View style={styles.controlsContainer}>
            <View style={styles.controlsHeader}>
              {title && (
                <Text style={styles.videoTitle}>{title}</Text>
              )}
              {originalName && (
                <Text style={styles.videoFileName}>{originalName}</Text>
              )}
            </View>
            
            <View style={styles.controlsCenter}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={togglePlayPause}
              >
                <Text style={styles.playButtonText}>
                  {paused ? '▶' : '⏸'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.controlsBottom}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)}
              </Text>
              
              <TouchableOpacity 
                style={styles.progressBar}
                onPress={handleSeek}
              >
                <View style={styles.progressTrack}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(currentTime / duration) * 100}%` }
                    ]} 
                  />
                </View>
              </TouchableOpacity>
              
              <Text style={styles.timeText}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  videoContainer: {
    width: screenWidth - (spacing.lg * 2),
    height: 200,
    backgroundColor: colors.black,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  loadingText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.sm,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    minHeight: 150,
    justifyContent: 'center',
    width: screenWidth - (spacing.lg * 2),
  },
  errorText: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[600],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorFileName: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
  },
  errorUrl: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  controlsHeader: {
    alignItems: 'center',
  },
  videoTitle: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
  videoFileName: {
    color: colors.gray[300],
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  controlsCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: colors.black,
    fontWeight: typography.fontWeights.bold,
  },
  controlsBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: spacing.sm,
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});


