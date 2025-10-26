/**
 * Удаляет HTML теги из строки
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Удаляем HTML теги
  let text = html.replace(/<[^>]*>/g, '');
  
  // Заменяем HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  // Удаляем лишние пробелы и переносы строк
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/**
 * Удаляет CSS стили из HTML
 */
export const removeCssStyles = (html: string): string => {
  if (!html) return '';
  
  let text = html;
  
  // Удаляем <style> блоки
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Удаляем style атрибуты
  text = text.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
  
  // Удаляем class атрибуты
  text = text.replace(/\s*class\s*=\s*["'][^"']*["']/gi, '');
  
  // Удаляем id атрибуты
  text = text.replace(/\s*id\s*=\s*["'][^"']*["']/gi, '');
  
  return text;
};

/**
 * Преобразует HTML в форматированный текст
 */
export const htmlToFormattedText = (html: string): string => {
  if (!html) return '';
  
  let text = html;
  
  // Сначала удаляем CSS стили
  text = removeCssStyles(text);
  
  // Удаляем data-атрибуты
  text = text.replace(/\s*data-[^=]*="[^"]*"/gi, '');
  
  // Удаляем target, rel атрибуты
  text = text.replace(/\s*(target|rel)="[^"]*"/gi, '');
  
  // Обрабатываем ссылки - извлекаем только текст
  text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
  
  // Заменяем блочные элементы на переносы строк
  text = text
    .replace(/<\/?(div|p|h[1-6]|br|li|ul|ol|blockquote|pre|code|section|article|header|footer|nav|main|aside|figure|figcaption)>/gi, '\n')
    .replace(/<\/?(h[1-6])>/gi, '\n\n')
    .replace(/<\/?(blockquote|pre|code)>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?(ul|ol)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');
  
  // Заменяем inline элементы на пробелы
  text = text
    .replace(/<\/?(span|strong|b|em|i|u|mark|small|sub|sup|del|ins|s|strike)>/gi, ' ');
  
  // Удаляем оставшиеся HTML теги
  text = text.replace(/<[^>]*>/g, '');
  
  // Заменяем HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™');
  
  // Очищаем лишние пробелы и переносы
  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Убираем множественные переносы
    .replace(/[ \t]+/g, ' ') // Заменяем множественные пробелы на один
    .replace(/\n /g, '\n') // Убираем пробелы в начале строк
    .replace(/ \n/g, '\n') // Убираем пробелы в конце строк
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
    .trim();
  
  return text;
};

/**
 * Обрезает текст до указанной длины
 */
export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Агрессивная функция для полной очистки HTML
 * 
 * Пример использования:
 * const complexHtml = '<b><span style="font-size: 22px; color: rgb(0, 235, 193);"><a href="/course/2?lesson=20" data-lesson-id="20" target="_blank" class="lesson-link">Тема 1. Менторство</a></span></b>';
 * const result = cleanComplexHtml(complexHtml);
 * // Результат: "Тема 1. Менторство"
 */
export const cleanComplexHtml = (html: string): string => {
  if (!html) return '';
  
  let text = html;
  
  // Сначала извлекаем текст из ссылок
  text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
  
  // Удаляем ВСЕ HTML теги (включая самозакрывающиеся)
  text = text.replace(/<[^>]*>/g, '');
  
  // Заменяем HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™');
  
  // Очищаем лишние пробелы
  text = text
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
    .replace(/\n\s*\n/g, '\n\n') // Убираем множественные переносы
    .trim();
  
  return text;
};

/**
 * Максимально простая функция для удаления HTML с сохранением переносов строк
 */
export const stripAllHtml = (html: string): string => {
  if (!html) return '';
  
  // Сначала заменяем <br> и <br/> на переносы строк
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n');
  
  // Удаляем ВСЕ HTML теги
  text = text.replace(/<[^>]*>/g, '');
  
  // Заменяем HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Очищаем множественные пробелы, но сохраняем переносы строк
  text = text
    .replace(/[ \t]+/g, ' ') // Заменяем множественные пробелы и табы на один пробел
    .replace(/\n\s+/g, '\n') // Убираем пробелы в начале строк после переноса
    .replace(/\s+\n/g, '\n') // Убираем пробелы в конце строк перед переносом
    .replace(/\n{3,}/g, '\n\n') // Заменяем множественные переносы на двойные
    .trim();
  
  return text;
};

/**
 * Форматирует HTML контент для отображения
 */
export const formatHtmlContent = (html: string, maxLength?: number): string => {
  // Используем максимально простую очистку
  const cleanText = stripAllHtml(html);
  
  if (maxLength) {
    return truncateText(cleanText, maxLength);
  }
  
  return cleanText;
};
