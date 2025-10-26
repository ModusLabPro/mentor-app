# Устранение проблем с DocumentPicker

## Проблема
```
Error: Cannot read property 'NativeDocumentPicker' of undefined
TypeError: Cannot read property 'isCancel' of undefined
TypeError: Cannot read property 'pick' of null
```

## Решение

### 1. Проблема с версией пакета
Новые версии `react-native-document-picker` (8.2.1, 9.3.1) несовместимы с React Native 0.82.

**Решение:** Используйте совместимую версию:
```bash
yarn remove react-native-document-picker
yarn add react-native-document-picker@7.0.0 --ignore-engines
```

### 2. Проблемы с автолинкингом
React Native 0.82 имеет проблемы с автолинкингом некоторых пакетов.

**Решение:**
```bash
# Очистка кеша
rm -rf node_modules
yarn install --ignore-engines

# Очистка Android кеша
rm -rf android/app/.cxx
rm -rf android/build
cd android && ./gradlew clean && cd ..

# Очистка Metro кеша
npx react-native start --reset-cache
```

### 3. Правильный API для версии 8.2.1
```typescript
import DocumentPicker from 'react-native-document-picker';

const handleFilePicker = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.audio, DocumentPicker.types.video, DocumentPicker.types.allFiles],
      allowMultiSelection: false,
    });

    if (result && result.length > 0) {
      await handleUpload(result[0]);
    }
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      // Пользователь отменил выбор файла
      return;
    }
    
    console.error('Error picking file:', error);
    Alert.alert('Ошибка', `Не удалось выбрать файл: ${error.message || 'Неизвестная ошибка'}`);
  }
};
```

### 4. Настройка разрешений

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

#### iOS (ios/MentorApp/Info.plist)
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select files for upload</string>
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to capture photos for upload</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone to record audio for upload</string>
```

## Проверка работоспособности

1. **Запуск приложения:**
   ```bash
   npx react-native run-android
   ```

2. **Тестирование:**
   - Откройте раздел "Загрузка"
   - Нажмите "Выбрать файл"
   - Выберите аудио, видео или документ
   - Проверьте, что файл загружается без ошибок

## Альтернативные решения

Если проблемы продолжаются, можно рассмотреть:

1. **Использование expo-document-picker** (если используете Expo)
2. **Ручная реализация** с использованием нативных модулей
3. **Обновление React Native** до более новой версии

## Полезные команды

```bash
# Проверка совместимости
npx react-native doctor

# Очистка всех кешей
npx react-native start --reset-cache
cd android && ./gradlew clean && cd ..

# Переустановка зависимостей
rm -rf node_modules && yarn install --ignore-engines
```
