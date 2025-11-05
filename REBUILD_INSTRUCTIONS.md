# Инструкции по пересборке приложения после изменений в нативном коде

После изменений в нативном коде (Kotlin/Swift) **ОБЯЗАТЕЛЬНО** нужно пересобрать приложение.

## Проблема с ошибкой "Cannot convert argument of type class java.util.LinkedHashMap"

Эта ошибка возникает, когда нативное приложение использует старую версию модуля, которая еще ожидает объект `ReadableMap` вместо отдельных параметров.

## Решение для Android

1. **Очистите и пересоберите Android приложение:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

   Или используйте React Native CLI:
   ```bash
   cd MentorApp
   yarn android
   ```

2. **Очистите кэш Metro bundler:**
   ```bash
   yarn start --reset-cache
   ```

3. **Перезапустите приложение на устройстве/эмуляторе**

## Решение для iOS

1. **Очистите и пересоберите iOS приложение:**
   ```bash
   cd ios
   pod install
   cd ..
   yarn ios
   ```

2. **Очистите кэш Metro bundler:**
   ```bash
   yarn start --reset-cache
   ```

## Проверка изменений

После пересборки проверьте:
- Метод `extractAudio` принимает отдельные параметры, а не объект
- Android: `extractAudio(videoPath: String, audioPath: String, format: String?, bitrate: Int?, sampleRate: Int?, promise: Promise)`
- iOS: `extractAudio(_ videoPath: String, audioPath: String, format: String?, bitrate: NSNumber?, sampleRate: NSNumber?, ...)`

## Если проблема сохраняется

1. Убедитесь, что изменения в Kotlin/Swift файлах сохранены
2. Проверьте, что модуль правильно зарегистрирован в `MainApplication.kt` (Android) или `AppDelegate.swift` (iOS)
3. Полностью удалите приложение с устройства и установите заново
4. Проверьте логи в Android Studio / Xcode для более подробной информации об ошибке

