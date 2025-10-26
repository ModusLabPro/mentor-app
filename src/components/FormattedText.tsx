import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { colors, typography, spacing } from '../styles';
import { stripAllHtml } from '../utils/htmlUtils';

interface FormattedTextProps {
  text?: string;
  html?: string;
  style?: any;
  maxLength?: number;
}

// Простой парсер Markdown для мобильного приложения
const parseMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    if (line.trim() === '') {
      elements.push(<Text key={`empty-${index}`} style={styles.emptyLine}>\n</Text>);
      return;
    }
    
    // Заголовки
    if (line.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${index}`} style={styles.h3}>
          {line.substring(4)}
        </Text>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${index}`} style={styles.h2}>
          {line.substring(3)}
        </Text>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <Text key={`h1-${index}`} style={styles.h1}>
          {line.substring(2)}
        </Text>
      );
    }
    // Списки
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <Text key={`list-${index}`} style={styles.listItem}>
          • {line.substring(2)}
        </Text>
      );
    }
    // Нумерованные списки
    else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <Text key={`ordered-${index}`} style={styles.orderedItem}>
          {line}
        </Text>
      );
    }
    // Цитаты
    else if (line.startsWith('> ')) {
      elements.push(
        <Text key={`quote-${index}`} style={styles.quote}>
          {line.substring(2)}
        </Text>
      );
    }
    // Обычный текст
    else {
      // Обработка жирного текста
      const boldText = line.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        return `**${content}**`;
      });
      
      if (boldText.includes('**')) {
        const parts = boldText.split(/(\*\*.*?\*\*)/);
        const formattedParts = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={`bold-${index}-${partIndex}`} style={styles.bold}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        });
        
        elements.push(
          <Text key={`text-${index}`} style={styles.paragraph}>
            {formattedParts}
          </Text>
        );
      } else {
        elements.push(
          <Text key={`text-${index}`} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    }
  });
  
  return elements;
};

export const FormattedText: React.FC<FormattedTextProps> = ({ 
  text,
  html, 
  style, 
  maxLength 
}) => {
  const content = text || (html ? stripAllHtml(html) : '');
  const displayText = maxLength && content.length > maxLength 
    ? content.substring(0, maxLength) + '...' 
    : content;
  
  const formattedElements = parseMarkdown(displayText);
  
  return (
    <View style={[styles.container, style]}>
      {formattedElements}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyLine: {
    height: 8,
  },
  h1: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  h2: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  h3: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  paragraph: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  listItem: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  orderedItem: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  quote: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: spacing.xs,
    marginLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue[300],
    paddingLeft: spacing.sm,
  },
  bold: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
});
