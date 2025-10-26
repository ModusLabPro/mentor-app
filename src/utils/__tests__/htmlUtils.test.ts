import { htmlToFormattedText, stripHtmlTags, formatHtmlContent } from '../htmlUtils';

describe('htmlUtils', () => {
  describe('htmlToFormattedText', () => {
    it('should convert HTML to formatted text', () => {
      const html = '<div><p>Hello <strong>world</strong>!</p><br/><ul><li>Item 1</li><li>Item 2</li></ul></div>';
      const result = htmlToFormattedText(html);
      expect(result).toBe('Hello world!\n\nItem 1\nItem 2');
    });

    it('should handle CSS styles', () => {
      const html = '<div style="color: red; font-size: 16px;"><p class="text">Hello world!</p></div>';
      const result = htmlToFormattedText(html);
      expect(result).toBe('Hello world!');
    });

    it('should handle HTML entities', () => {
      const html = '<p>Hello &amp; welcome to &quot;our site&quot;!</p>';
      const result = htmlToFormattedText(html);
      expect(result).toBe('Hello & welcome to "our site"!');
    });

    it('should handle empty input', () => {
      const result = htmlToFormattedText('');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = htmlToFormattedText(null as any);
      expect(result).toBe('');
    });
  });

  describe('stripHtmlTags', () => {
    it('should remove HTML tags', () => {
      const html = '<div><p>Hello <strong>world</strong>!</p></div>';
      const result = stripHtmlTags(html);
      expect(result).toBe('Hello world!');
    });
  });

  describe('formatHtmlContent', () => {
    it('should format HTML content with max length', () => {
      const html = '<p>This is a very long text that should be truncated</p>';
      const result = formatHtmlContent(html, 20);
      expect(result).toBe('This is a very long...');
    });
  });

  describe('stripAllHtml', () => {
    it('should remove all HTML tags completely', () => {
      const complexHtml = '<b><span style="font-size: 22px; font-family: Montserrat, sans-serif; color: rgb(0, 235, 193);"><a href="/course/2?lesson=20" data-lesson-id="20" target="_blank" class="lesson-link">Тема 1. Менторство: современный подход</a></span></b>';
      const result = stripAllHtml(complexHtml);
      expect(result).toBe('Тема 1. Менторство: современный подход');
    });

    it('should handle nested spans with complex styles', () => {
      const nestedHtml = '<span style="font-size: 17px; color: rgb(0, 0, 0);">📌 Понятие менторинга.</span>';
      const result = stripAllHtml(nestedHtml);
      expect(result).toBe('📌 Понятие менторинга.');
    });

    it('should handle empty spans and links', () => {
      const emptyHtml = '<span style="color: red;"></span><a href="/test"></a>';
      const result = stripAllHtml(emptyHtml);
      expect(result).toBe('');
    });

    it('should handle very complex HTML with multiple nested elements', () => {
      const veryComplexHtml = '<b><span style="font-size: 22px; font-family: Montserrat, sans-serif; color: rgb(0, 235, 193); background-color: transparent; font-variant-numeric: normal;"><span style="font-weight: normal; font-style: normal; text-decoration: none;"><a href="/course/2?lesson=20" data-lesson-id="20" data-lesson-title="Введение" target="_blank" rel="noopener noreferrer" class="lesson-link">Тема 1. Менторство: современный подход к развитию людей</a></span></span></b>';
      const result = stripAllHtml(veryComplexHtml);
      expect(result).toBe('Тема 1. Менторство: современный подход к развитию людей');
    });
  });
});
