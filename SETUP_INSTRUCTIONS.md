# Инструкции по настройке функционала сессий

## Установленные зависимости

### Основные пакеты:
- `@react-native-documents/picker@10.1.7` - для выбора файлов
- `axios@1.12.2` - для HTTP запросов
- `@react-native-async-storage/async-storage@2.2.0` - для хранения токенов

## Настройка разрешений

### Android (android/app/src/main/AndroidManifest.xml)
Добавлены разрешения:
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

### iOS (ios/MentorApp/Info.plist)
Добавлены разрешения:
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select files for upload</string>
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to capture photos for upload</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone to record audio for upload</string>
```

## Запуск приложения

### Для Android:
```bash
cd /Users/qb/work/mentor-ai/MentorApp
npx react-native run-android
```

### Для iOS:
```bash
cd /Users/qb/work/mentor-ai/MentorApp
cd ios && pod install && cd ..
npx react-native run-ios
```

### Сброс кеша (если возникают проблемы):
```bash
npx react-native start --reset-cache
```

## Проверка функционала

### 1. Загрузка файлов (UploadScreen)
- Откройте раздел "Загрузка" в приложении
- Нажмите "Выбрать файл"
- Выберите аудио, видео или документ
- Проверьте прогресс загрузки и обработки

### 2. Анализ сессий (AnalysisScreen)
- Откройте раздел "Анализ"
- Просмотрите список сессий
- Нажмите на сессию для детального просмотра
- Запустите анализ для неанализированных сессий

### 3. Детальный просмотр (SessionDetailScreen)
- Откройте детали сессии
- Просмотрите результаты анализа
- Проверьте транскрипцию и заметки
- Используйте функцию "Поделиться"

## Возможные проблемы и решения

### 1. Ошибка "Unable to resolve module"
**Решение:**
```bash
npx react-native start --reset-cache
```

### 2. Проблемы с разрешениями на Android
**Решение:**
- Убедитесь, что разрешения добавлены в AndroidManifest.xml
- Переустановите приложение на устройстве

### 3. Проблемы с разрешениями на iOS
**Решение:**
- Убедитесь, что разрешения добавлены в Info.plist
- Пересоберите проект: `cd ios && pod install && cd ..`

### 4. Проблемы с автолинкингом
**Решение:**
```bash
cd android && ./gradlew clean && cd ..
cd ios && pod install && cd ..
```

## API Endpoints

Убедитесь, что backend сервер запущен и доступен по адресу, указанному в `API_BASE_URL` (по умолчанию `http://localhost:4000/api`).

### Основные endpoints:
- `POST /api/upload` - загрузка файлов
- `GET /api/upload` - получение файлов пользователя
- `GET /api/upload/analyzed` - проанализированные файлы
- `POST /api/analysis/{id}/start` - запуск анализа
- `GET /api/analysis/{id}/status` - статус анализа
- `GET /api/sessions/stats` - статистика сессий

## Тестирование

### Рекомендуемые тесты:
1. **Загрузка различных типов файлов** (аудио, видео, документы)
2. **Проверка прогресса загрузки** и обработки
3. **Запуск анализа** и мониторинг статуса
4. **Навигация между экранами** (Upload → Analysis → SessionDetail)
5. **Функция поделиться** результатами анализа
6. **Обработка ошибок** (сеть, файлы, разрешения)

## Дополнительные настройки

### Для разработки:
- Убедитесь, что Metro bundler запущен
- Проверьте подключение к backend API
- Используйте React Native DevTools для отладки

### Для продакшена:
- Настройте правильные URL для API
- Проверьте все разрешения на реальных устройствах
- Протестируйте на различных размерах экранов



