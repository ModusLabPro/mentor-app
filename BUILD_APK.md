# Инструкция по сборке APK файла

## Подготовка

Убедитесь, что у вас установлены:
- Node.js (>= 20)
- JDK 17 или выше
- Android Studio с Android SDK
- Gradle

## Быстрая сборка APK

### Debug APK (для тестирования)

```bash
npm run build:android:debug
```

или

```bash
cd android && ./gradlew assembleDebug
```

APK будет создан в: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (для публикации)

```bash
npm run build:android:release
```

или

```bash
cd android && ./gradlew assembleRelease
```

APK будет создан в: `android/app/build/outputs/apk/release/app-release.apk`

## Важные моменты

1. **Текущая конфигурация** использует debug keystore даже для release сборок.
2. **Для продакшена** необходимо:
   - Создать production keystore
   - Изменить конфигурацию в `android/app/build.gradle`
   - Добавить ключи в переменные окружения

## ⚠️ Важно: Настройка API адреса

**В текущем APK запросы идут на**: `http://10.0.2.2:4000/api` (только для эмулятора!)

### Для работы на реальном устройстве:

1. **Измените production URL** в файле `src/config/api.ts`:
   ```typescript
   production: {
     android: 'https://ваш-домен.com/api',  // Замените на реальный домен
     ios: 'https://ваш-домен.com/api',
   }
   ```

2. **Пересоберите APK** после изменения конфигурации

3. **Альтернативно**, задайте URL через переменную окружения при сборке:
   ```bash
   API_BASE_URL=https://ваш-домен.com/api npm run build:android:release
   ```

## Проверка API адреса в APK

После установки APK на устройство, можно проверить логи:
```bash
adb logcat | grep "API Configuration"
```

Вы увидите текущий API адрес, например:
```
🔧 API Configuration: Base URL: http://10.0.2.2:4000/api
```

## Создание production keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore mentor-release-key.keystore -alias mentor-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

## Очистка предыдущих сборок

```bash
npm run clean:android
```

## Размер APK

После сборки вы можете проверить размер APK:
- Debug APK: ~20-40 MB
- Release APK (с ProGuard): ~10-20 MB

## Установка APK на устройство

```bash
# Для подключенного устройства
adb install android/app/build/outputs/apk/release/app-release.apk
```

или отправьте APK файл на телефон и установите вручную.
