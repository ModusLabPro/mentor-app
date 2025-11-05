import { Platform, NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import { Audio, getRealPath } from 'react-native-compressor';

// Используем react-native-compressor Audio.compress для извлечения аудио из видео
// Audio.compress автоматически извлекает аудио из MP4 файлов и конвертирует в MP3

export interface AudioExtractionOptions {
  format?: 'mp3' | 'wav' | 'm4a';
  quality?: 'low' | 'medium' | 'high';
  sampleRate?: number;
  bitrate?: number;
}

export interface AudioExtractionResult {
  audioBlob: any; // В React Native это может быть объект с uri
  duration: number;
  sampleRate: number;
  format: string;
  filePath?: string; // Для React Native
  audioFilePath?: string; // Путь к извлеченному аудио файлу
}

export class AudioExtractor {
  /**
   * Извлекает аудио из видео файла
   * Реальная реализация для React Native с использованием FFmpeg
   */
  static async extractAudioFromVideo(
    videoFile: any, 
    options: AudioExtractionOptions = {}
  ): Promise<AudioExtractionResult> {
    try {
      console.log('Начинаем извлечение аудио из видео:', videoFile.name);
      
      // Проверяем, что это видео файл
      if (!videoFile.type?.startsWith('video/')) {
        throw new Error('Файл не является видео');
      }

      if (!videoFile.uri) {
        throw new Error('Не указан путь к видео файлу');
      }

      const format = options.format || 'mp3';
      const bitrate = options.bitrate || (options.quality === 'high' ? 320 : options.quality === 'medium' ? 192 : 128);
      const sampleRate = options.sampleRate || 44100;
      
      // Получаем путь к видео файлу
      // Используем fileCopyUri если доступен (копия файла в доступном месте)
      // Иначе используем uri
      let videoPath = videoFile.fileCopyUri || videoFile.uri;
      console.log('Исходный URI видео файла:', videoPath);
      console.log('fileCopyUri:', videoFile.fileCopyUri);
      console.log('uri:', videoFile.uri);
      
      // Обрабатываем разные форматы URI в React Native
      // Убираем лишние слэши в начале пути
      if (videoPath.startsWith('/file://')) {
        videoPath = videoPath.replace('/file://', '');
      } else if (videoPath.startsWith('file://')) {
        videoPath = videoPath.replace('file://', '');
      } else if (videoPath.startsWith('content://')) {
        // Для Android content:// URI нужно копировать файл во временную директорию
        console.log('Обнаружен content:// URI, копируем файл...');
        
        // Сначала пробуем использовать fileCopyUri если он есть
        if (videoFile.fileCopyUri) {
          videoPath = videoFile.fileCopyUri.replace('file://', '');
          console.log('Используем fileCopyUri:', videoPath);
        } else {
          // Если fileCopyUri нет, копируем файл через react-native-fs
          // Для content:// URI используем специальный метод
          const tempFileName = `temp_video_${Date.now()}.${videoFile.name?.split('.').pop() || 'mp4'}`;
          const tempPath = `${RNFS.DocumentDirectoryPath}/${tempFileName}`;
          
          console.log('Копируем файл из content:// в:', tempPath);
          
          try {
            // Для content:// URI используем copyFile с поддержкой URI
            // RNFS.copyFile может работать с content:// URI на Android
            await RNFS.copyFile(videoFile.uri, tempPath);
            
            console.log('Файл успешно скопирован в:', tempPath);
            // Убеждаемся, что путь правильный - без file:// префикса для RNFS
            videoPath = tempPath;
          } catch (copyError) {
            console.error('Ошибка копирования файла из content:// через RNFS:', copyError);
            
            // Если RNFS.copyFile не работает, пробуем через readFile/writeFile
            // Но это может быть медленно для больших файлов
            try {
              console.log('Пробуем альтернативный метод копирования...');
              
              // Читаем файл по частям (для больших файлов)
              const chunkSize = 1024 * 1024; // 1MB chunks
              const fileSize = videoFile.size || 0;
              
              if (fileSize > 100 * 1024 * 1024) { // > 100MB
                throw new Error('Файл слишком большой для копирования. Размер: ' + (fileSize / (1024 * 1024)).toFixed(2) + 'MB');
              }
              
              // Читаем весь файл
              const fileData = await RNFS.readFile(videoFile.uri, 'base64');
              
              // Записываем в файл
              await RNFS.writeFile(tempPath, fileData, 'base64');
              
              console.log('Файл успешно скопирован альтернативным методом');
              videoPath = tempPath;
            } catch (altError) {
              console.error('Альтернативный метод копирования также не сработал:', altError);
              throw new Error(`Не удалось скопировать файл из content:// URI. Попробуйте выбрать файл через файловый менеджер или убедитесь, что у приложения есть разрешение на чтение файлов. Ошибка: ${altError instanceof Error ? altError.message : String(altError)}`);
            }
          }
        }
      } else if (videoPath.startsWith('ph://')) {
        // Для iOS Photos framework
        console.log('Обнаружен ph:// URI, это может не работать напрямую');
        throw new Error('Выбор файлов из фото библиотеки iOS не поддерживается напрямую. Используйте файловый менеджер.');
      }
      
      // Декодируем URI если нужно
      try {
        videoPath = decodeURI(videoPath);
      } catch (e) {
        // Игнорируем ошибки декодирования
      }
      
      // Убеждаемся, что путь правильный - убираем лишние слэши
      // Путь должен быть без file:// для RNFS.exists
      if (videoPath.startsWith('/file://')) {
        videoPath = videoPath.replace('/file://', '');
      } else if (videoPath.startsWith('file://')) {
        videoPath = videoPath.replace('file://', '');
      }
      
      console.log('Обработанный путь к видео файлу:', videoPath);
      
      // Проверяем существование файла
      const fileExists = await RNFS.exists(videoPath);
      console.log('Файл существует:', fileExists);
      
      if (!fileExists) {
        // Попробуем получить информацию о файле для диагностики
        try {
          const fileInfo = await RNFS.stat(videoPath);
          console.log('Информация о файле:', fileInfo);
        } catch (statError) {
          console.error('Ошибка получения информации о файле:', statError);
        }
        
        // Попробуем альтернативные пути
        const alternativePaths = [
          videoFile.fileCopyUri?.replace('file://', ''),
          videoFile.uri?.replace('file://', ''),
          videoFile.uri,
        ].filter(Boolean);
        
        console.log('Пробуем альтернативные пути:', alternativePaths);
        
        for (const altPath of alternativePaths) {
          if (altPath && altPath !== videoPath) {
            // Убираем file:// из альтернативного пути
            const cleanAltPath = altPath.startsWith('file://') ? altPath.replace('file://', '') : altPath;
            if (cleanAltPath !== videoPath && await RNFS.exists(cleanAltPath)) {
              console.log('Найден альтернативный путь:', cleanAltPath);
              videoPath = cleanAltPath;
              break;
            }
          }
        }
        
        // Проверяем еще раз
        if (!(await RNFS.exists(videoPath))) {
          throw new Error(`Видео файл не найден по пути: ${videoPath}. Исходный URI: ${videoFile.uri}, fileCopyUri: ${videoFile.fileCopyUri}`);
        }
      }
      
      // Создаем путь для выходного аудио файла
      // react-native-compressor Audio.compress всегда возвращает MP3
      const actualFormat = 'mp3'; // Audio.compress всегда создает MP3
      const audioFileName = `extracted_audio_${Date.now()}.${actualFormat}`;
      const actualAudioPath = `${RNFS.DocumentDirectoryPath}/${audioFileName}`;
      const audioFilePath = `file://${actualAudioPath}`;
      
      // Извлекаем аудио используя react-native-compressor Audio.compress
      await this.extractAudioFromVideoFile(videoPath, actualAudioPath, {
        ...options,
        format: actualFormat as 'mp3' | 'wav' | 'm4a'
      });
      
      // Получаем информацию о созданном аудио файле
      const audioFileInfo = await RNFS.stat(actualAudioPath);
      
      // Получаем длительность из видео или используем оценку
      let duration: number;
      try {
        duration = await this.getVideoDuration(videoPath);
      } catch (error) {
        console.warn('Не удалось получить длительность видео, используем оценку:', error);
        duration = this.estimateVideoDuration(videoFile);
      }
      
      // Создаем объект, имитирующий Blob для React Native
      const audioBlob = {
        size: audioFileInfo.size,
        type: actualFormat === 'mp3' ? 'audio/mpeg' : actualFormat === 'wav' ? 'audio/wav' : 'audio/m4a',
        uri: audioFilePath,
        name: audioFileName,
        _isRealFile: true,
        _filePath: audioFilePath,
        _duration: duration,
        _sampleRate: sampleRate,
        _format: actualFormat
      };
      
      const result: AudioExtractionResult = {
        audioBlob,
        duration,
        sampleRate,
        format: actualFormat, // Используем фактический формат
        filePath: audioFileName,
        audioFilePath: audioFilePath
      };

      console.log('Аудио извлечено успешно:');
      console.log('- Формат:', format);
      console.log('- Размер файла:', (audioFileInfo.size / (1024 * 1024)).toFixed(2), 'MB');
      console.log('- Длительность:', duration.toFixed(1), 'сек');
      console.log('- Частота:', sampleRate, 'Hz');
      console.log('- Битрейт:', bitrate, 'kbps');
      console.log('- Путь к файлу:', audioFilePath);

      return result;
    } catch (error) {
      console.error('Ошибка извлечения аудио:', error);
      throw error;
    }
  }

  /**
   * Оценивает длительность видео на основе размера файла
   */
  private static estimateVideoDuration(videoFile: any): number {
    // Примерная оценка: 1MB = 10 секунд видео
    const estimatedDuration = (videoFile.size / (1024 * 1024)) * 10;
    // Ограничиваем длительность для избежания переполнения стека
    return Math.max(5, Math.min(estimatedDuration, 60)); // От 5 сек до 1 минуты
  }

  /**
   * Извлекает аудио из видео файла используя react-native-compressor Audio.compress
   * Audio.compress автоматически извлекает аудио из MP4 файлов через genVideoUsingMuxer
   */
  private static async extractAudioFromVideoFile(
    videoPath: string, 
    audioPath: string, 
    options: AudioExtractionOptions
  ): Promise<void> {
    try {
      console.log('Извлекаем аудио из видео файла используя react-native-compressor Audio.compress...');
      console.log('Входной файл:', videoPath);
      console.log('Выходной файл:', audioPath);
      
      // Audio.compress всегда возвращает MP3, независимо от запрошенного формата
      const format = 'mp3'; // Audio.compress всегда создает MP3
      const bitrate = options.bitrate || (options.quality === 'high' ? 320 : options.quality === 'medium' ? 192 : 128);
      const quality = options.quality || 'low';
      
      // Получаем реальный путь к файлу
      // videoPath уже должен быть правильным путем без file:// префикса
      // Но для Audio.compress нужно использовать getRealPath для обработки content:// URI
      
      // Формируем путь для getRealPath - должен быть с file:// или без
      // videoPath уже не содержит file:// (мы его убрали ранее)
      let inputPathForGetRealPath = videoPath;
      
      // Убеждаемся, что путь не содержит file:// префикс (если есть, убираем)
      if (inputPathForGetRealPath.startsWith('file://')) {
        inputPathForGetRealPath = inputPathForGetRealPath.replace('file://', '');
      }
      // Убираем лишние слэши в начале
      while (inputPathForGetRealPath.startsWith('/')) {
        inputPathForGetRealPath = inputPathForGetRealPath.substring(1);
      }
      
      // Добавляем file:// для getRealPath (если путь не content://)
      if (!inputPathForGetRealPath.startsWith('content://')) {
        inputPathForGetRealPath = `file:///${inputPathForGetRealPath}`;
      }
      
      console.log('Путь к видео перед getRealPath:', inputPathForGetRealPath);
      
      // Получаем реальный путь через getRealPath
      // getRealPath обрабатывает content:// URI и другие форматы
      // getRealPath возвращает путь с file:// префиксом
      let realVideoPath: string;
      try {
        realVideoPath = await getRealPath(inputPathForGetRealPath, 'video');
        console.log('Реальный путь к видео от getRealPath:', realVideoPath);
      } catch (getRealPathError) {
        console.warn('Ошибка getRealPath, используем исходный путь:', getRealPathError);
        // Если getRealPath не работает, используем исходный путь с file://
        // videoPath уже не содержит file://, поэтому добавляем его
        realVideoPath = `file:///${videoPath}`;
      }
      
      // Нормализуем путь - убираем лишние слэши и двойные префиксы
      // getRealPath уже возвращает путь с file://, поэтому не нужно добавлять его снова
      let finalVideoPath = String(realVideoPath).trim();
      
      console.log('Путь после getRealPath (до нормализации):', finalVideoPath);
      
      // Убираем все лишние слэши в начале пути
      while (finalVideoPath.startsWith('/')) {
        finalVideoPath = finalVideoPath.substring(1);
      }
      
      // Убираем двойной и тройной префикс file:// (если есть file://file://, делаем file://)
      // Обрабатываем все варианты: file://file:///, file://file://, file://file:///
      while (finalVideoPath.includes('file://file://')) {
        finalVideoPath = finalVideoPath.replace(/file:\/\/file:\/\//g, 'file://');
      }
      
      // Убеждаемся, что путь начинается с file:// (не добавляем, если уже есть)
      if (!finalVideoPath.startsWith('file://')) {
        // Если путь начинается с /, добавляем file://
        if (finalVideoPath.startsWith('/')) {
          finalVideoPath = `file://${finalVideoPath}`;
        } else {
          // Если путь не начинается ни с file://, ни с /, добавляем file:///
          finalVideoPath = `file:///${finalVideoPath}`;
        }
      }
      
      // Нормализуем формат - путь должен быть file:///path/to/file
      // Убираем множественные слэши после file://, оставляя только один
      finalVideoPath = finalVideoPath.replace(/^file:\/\/\/+/, 'file:///');
      
      // Убеждаемся, что после file:// есть один слэш (file:///path)
      if (finalVideoPath.match(/^file:\/\/[^/]/)) {
        // file://path -> file:///path
        finalVideoPath = finalVideoPath.replace(/^file:\/\//, 'file:///');
      }
      
      // Финальная проверка - путь должен быть file:///path/to/file
      if (!finalVideoPath.startsWith('file:///')) {
        console.error('КРИТИЧЕСКАЯ ОШИБКА: Путь в неправильном формате:', finalVideoPath);
        // Принудительно исправляем - убираем все лишнее и формируем правильный путь
        // Извлекаем путь без префиксов
        let cleanPath = finalVideoPath
          .replace(/^\/+/, '')
          .replace(/^file:\/\/file:\/\/\/+/, '')
          .replace(/^file:\/\/file:\/\/+/, '')
          .replace(/^file:\/\/\/+/, '')
          .replace(/^file:\/\/+/, '')
          .replace(/^file:\//, '');
        
        // Формируем правильный путь
        finalVideoPath = `file:///${cleanPath}`;
      }
      
      // Последняя проверка - убеждаемся, что нет двойных префиксов
      if (finalVideoPath.includes('file://file://')) {
        console.warn('Обнаружен двойной префикс file://, исправляем...');
        finalVideoPath = finalVideoPath.replace(/file:\/\/file:\/\//g, 'file://');
        // Убеждаемся, что после исправления путь правильный
        if (!finalVideoPath.startsWith('file:///')) {
          finalVideoPath = finalVideoPath.replace(/^file:\/\//, 'file:///');
        }
      }
      
      console.log('Финальный путь к видео для Audio.compress:', finalVideoPath);
      console.log('Проверка формата пути:', {
        startsWithFileProtocol: finalVideoPath.startsWith('file://'),
        hasThreeSlashes: finalVideoPath.startsWith('file:///'),
        hasNoLeadingSlash: !finalVideoPath.startsWith('/file://'),
        path: finalVideoPath,
        pathLength: finalVideoPath.length
      });
      
      // Используем Audio.compress для извлечения аудио из видео
      // Audio.compress автоматически извлекает аудио из MP4 через genVideoUsingMuxer
      // с параметрами useAudio=true, useVideo=false
      try {
        console.log('Вызываем Audio.compress для извлечения аудио...');
        
        // Audio.compress извлекает аудио из видео и конвертирует в MP3
        const compressedAudioPath = await Audio.compress(finalVideoPath, {
          quality: quality,
          bitrate: bitrate * 1000, // bitrate в битах (kbps * 1000)
          // Можно также указать channels и samplerate если нужно
        });
        
        console.log('Аудио извлечено, путь:', compressedAudioPath);
        
        // Audio.compress возвращает MP3 файл, поэтому просто копируем его в нужное место
        const sourcePath = compressedAudioPath.replace('file://', '');
        
        // Копируем файл в нужный путь (audioPath уже содержит правильное расширение)
        await RNFS.copyFile(sourcePath, audioPath);
        
        console.log('Аудио файл сохранен:', audioPath);
        
        // Удаляем временный файл из кэша библиотеки если нужно
        try {
          // Проверяем, что это не один и тот же файл
          if (sourcePath !== audioPath && await RNFS.exists(sourcePath)) {
            // Удаляем временный файл если он отличается от целевого
            await RNFS.unlink(sourcePath);
          }
        } catch (e) {
          console.warn('Не удалось удалить временный файл:', e);
        }
        
      } catch (error: any) {
        console.error('Ошибка при использовании Audio.compress:', error);
        throw new Error(`Не удалось извлечь аудио из видео: ${error.message || error}`);
      }
    } catch (error) {
      console.error('Ошибка извлечения аудио из видео файла:', error);
      throw error;
    }
  }

  /**
   * Получает длительность видео используя react-native-compressor getVideoMetaData
   */
  private static async getVideoDuration(videoPath: string): Promise<number> {
    try {
      // Используем react-native-compressor для получения метаданных видео
      const { getVideoMetaData } = await import('react-native-compressor');
      
      try {
        // getVideoMetaData ожидает путь с file://
        const pathForMetadata = videoPath.startsWith('file://') ? videoPath : `file://${videoPath}`;
        const metadata = await getVideoMetaData(pathForMetadata);
        if (metadata && metadata.duration && metadata.duration > 0) {
          return metadata.duration;
        }
      } catch (error) {
        console.warn('Ошибка получения длительности через getVideoMetaData:', error);
      }
      
      // Если не удалось получить длительность, используем оценку
      throw new Error('Получение длительности через getVideoMetaData не удалось, используем оценку');
    } catch (error) {
      console.warn('Ошибка получения длительности видео:', error);
      throw error;
    }
  }



  /**
   * Удаляет временный файл
   */
  private static async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (await RNFS.exists(filePath)) {
        await RNFS.unlink(filePath);
        console.log('Временный файл удален:', filePath);
      }
    } catch (error) {
      console.error('Ошибка удаления временного файла:', error);
    }
  }

  /**
   * Конвертирует аудио в MP3
   */
  static async convertToMp3(audioBlob: any, options: AudioExtractionOptions = {}): Promise<any> {
    console.log('Конвертация в MP3...');
    
    if (audioBlob._isRealFile && audioBlob._filePath) {
      // Если у нас есть реальный файл, конвертируем его
      const mp3Path = audioBlob._filePath.replace(/\.[^.]+$/, '.mp3');
      
      try {
        // В реальном приложении здесь будет конвертация через FFmpeg
        // Пока просто копируем файл с новым расширением
        await RNFS.copyFile(audioBlob._filePath, mp3Path);
        
        const mp3FileInfo = await RNFS.stat(mp3Path);
        
        return {
          ...audioBlob,
          type: 'audio/mpeg',
          _format: 'mp3',
          _filePath: mp3Path,
          size: mp3FileInfo.size
        };
      } catch (error) {
        console.error('Ошибка конвертации в MP3:', error);
        return audioBlob;
      }
    }
    
    // Для мок-объектов просто меняем тип
    return {
      ...audioBlob,
      type: 'audio/mpeg',
      _format: 'mp3'
    };
  }

  /**
   * Получает информацию о видео файле
   */
  static async getVideoInfo(videoFile: any): Promise<{
    type: 'video' | 'audio' | 'other';
    duration?: number;
    sampleRate?: number;
    channels?: number;
  }> {
    if (videoFile.type?.startsWith('video/')) {
      return {
        type: 'video',
        duration: this.estimateVideoDuration(videoFile),
        sampleRate: 44100,
        channels: 1
      };
    } else if (videoFile.type?.startsWith('audio/')) {
      return {
        type: 'audio',
        duration: this.estimateVideoDuration(videoFile),
        sampleRate: 44100,
        channels: 1
      };
    }
    
    return { type: 'other' };
  }
}
