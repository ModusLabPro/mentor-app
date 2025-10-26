import React, { useState } from 'react';
import { 
  Text, 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Linking,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { colors, typography, spacing } from '../styles';
import { VideoPlayer } from './VideoPlayer';

interface StructuredContentViewerProps {
  content?: string;
  contentFormatted?: any[];
  onLessonLinkClick?: (lessonId: number) => void;
  onTestLinkClick?: (testId: number) => void;
  onAssignmentLinkClick?: (assignmentId: number) => void;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

// Компонент для отображения изображений
const MediaImage: React.FC<{ imageUrl: string; originalName?: string }> = ({ imageUrl, originalName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Добавляем отладочную информацию
  React.useEffect(() => {
    console.log('🖼️ MediaImage: Loading image with URL:', imageUrl);
  }, [imageUrl]);

  const handleImageError = (error: any) => {
    console.error('🖼️ MediaImage: Failed to load image:', imageUrl, error);
    setError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    console.log('🖼️ MediaImage: Successfully loaded image:', imageUrl);
    setLoading(false);
  };

  if (!imageUrl || imageUrl.trim() === '') {
    return (
      <View style={styles.imageContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>URL изображения не найден</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.imageContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Не удалось загрузить изображение</Text>
          {originalName && (
            <Text style={styles.errorFileName}>Файл: {originalName}</Text>
          )}
          <Text style={styles.errorUrl}>URL: {imageUrl}</Text>
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
    <View style={styles.imageContainer}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={() => console.log('🖼️ MediaImage: Starting to load image:', imageUrl)}
        onLoadEnd={() => console.log('🖼️ MediaImage: Load ended for image:', imageUrl)}
        // Добавляем дополнительные свойства для лучшей совместимости
        cache="force-cache"
        fadeDuration={300}
      />
      {originalName && (
        <Text style={styles.imageFileName}>{originalName}</Text>
      )}
    </View>
  );
};

// Компонент для отображения видео
const MediaVideo: React.FC<{ 
  videoUrl: string; 
  originalName?: string;
  title?: string;
}> = ({ videoUrl, originalName, title }) => {
  const handleVideoError = (error: any) => {
    console.error('🎥 MediaVideo: Video error:', error);
    Alert.alert(
      'Ошибка видео',
      'Не удалось загрузить видео. Хотите открыть в браузере?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Открыть в браузере', 
          onPress: () => Linking.openURL(videoUrl).catch(err => {
            console.error('Failed to open video in browser:', err);
            Alert.alert('Ошибка', 'Не удалось открыть видео');
          })
        }
      ]
    );
  };

  return (
    <VideoPlayer
      videoUrl={videoUrl}
      title={title}
      originalName={originalName}
      onError={handleVideoError}
    />
  );
};

// Компонент для обрезки длинного текста
const TruncatedText: React.FC<{ 
  text: string; 
  maxLength?: number;
  style?: any;
}> = ({ text, maxLength = 100, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= maxLength || isExpanded) {
    return (
      <Text style={style}>
        {text}
        {text.length > maxLength && (
          <Text 
            style={[style, { color: colors.primary, fontWeight: 'bold' }]}
            onPress={() => setIsExpanded(false)}
          >
            {' '}Свернуть
          </Text>
        )}
      </Text>
    );
  }
  
  return (
    <Text style={style}>
      {text.substring(0, maxLength)}...
      <Text 
        style={[style, { color: colors.primary, fontWeight: 'bold' }]}
        onPress={() => setIsExpanded(true)}
      >
        {' '}Развернуть
      </Text>
    </Text>
  );
};

// Компонент для HTML таблицы
const HtmlTableBlock: React.FC<{ 
  htmlContent: string;
}> = ({ htmlContent }) => {
  // Простое отображение HTML таблицы как текста
  // В реальном приложении можно использовать WebView или более сложный парсер
  const cleanContent = htmlContent
    .replace(/<table[^>]*>/gi, '')
    .replace(/<\/table>/gi, '')
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<\/tr>/gi, '')
    .replace(/<td[^>]*>/gi, ' | ')
    .replace(/<\/td>/gi, '')
    .replace(/<th[^>]*>/gi, ' | ')
    .replace(/<\/th>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();

  return (
    <View style={styles.htmlTableContainer}>
      <TruncatedText 
        text={cleanContent} 
        maxLength={200}
        style={styles.htmlTableText}
      />
    </View>
  );
};

// Компонент для таблицы
const TableBlock: React.FC<{ 
  content: string[][];
  borderColor?: string;
}> = ({ content, borderColor = '#e2e8f0' }) => {
  if (!content || content.length === 0) {
    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableEmptyText}>Таблица пуста</Text>
      </View>
    );
  }

  // Рассчитываем оптимальную ширину ячеек
  const maxColumns = Math.max(...content.map(row => row.length));
  const cellWidth = Math.max(120, (screenWidth - spacing.lg * 2) / maxColumns);

  return (
    <View style={styles.tableContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ minWidth: maxColumns * cellWidth }}
      >
        <View style={[styles.table, { borderColor }]}>
          {content.map((row: string[], rowIndex: number) => (
            <View key={rowIndex} style={styles.tableRow}>
              {row.map((cell: string, cellIndex: number) => {
                const isHeader = rowIndex === 0;
                return (
                  <View 
                    key={cellIndex} 
                    style={[
                      styles.tableCell,
                      isHeader && styles.tableHeaderCell,
                      { 
                        borderColor,
                        width: cellWidth,
                        minWidth: cellWidth,
                        maxWidth: cellWidth
                      }
                    ]}
                  >
                    <TruncatedText 
                      text={cell}
                      maxLength={isHeader ? 50 : 80}
                      style={[
                        styles.tableCellText,
                        isHeader && styles.tableHeaderText
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Компонент для аккордеона с диапазоном блоков
const AccordionRangeBlock: React.FC<{ 
  title: string; 
  blocks: any[];
  index: number;
  expandedAccordions: Set<number>;
  onToggle: (index: number) => void;
  headerColor?: string;
  backgroundColor?: string;
  renderBlock: (block: any, blockIndex: number) => React.ReactNode;
}> = ({ title, blocks, index, expandedAccordions, onToggle, headerColor, backgroundColor, renderBlock }) => {
  const isExpanded = expandedAccordions.has(index);

  return (
    <View style={styles.accordionRangeContainer}>
      <TouchableOpacity 
        style={[
          styles.accordionRangeHeader,
          { backgroundColor: backgroundColor || colors.gray[50] }
        ]}
        onPress={() => onToggle(index)}
      >
        <Text style={styles.accordionRangeTitle}>
          {title.replace(/<[^>]*>/g, '')}
        </Text>
        <Text style={styles.accordionRangeIcon}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={[
          styles.accordionRangeContent,
          { backgroundColor: headerColor || colors.white }
        ]}>
          {blocks && blocks.length > 0 ? (
            <View style={styles.accordionRangeBlocks}>
              {blocks.map((innerBlock: any, innerIndex: number) => (
                <View key={innerIndex} style={styles.accordionRangeBlockItem}>
                  {renderBlock(innerBlock, innerIndex)}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.accordionRangeEmpty}>
              Содержимое аккордеона пусто
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

// Компонент для аккордеона
const AccordionBlock: React.FC<{ 
  title: string; 
  content: string; 
  index: number;
  expandedAccordions: Set<number>;
  onToggle: (index: number) => void;
}> = ({ title, content, index, expandedAccordions, onToggle }) => {
  const isExpanded = expandedAccordions.has(index);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        style={styles.accordionHeader}
        onPress={() => onToggle(index)}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Text style={[styles.accordionIcon, isExpanded && styles.accordionIconExpanded]}>
          ▼
        </Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

// Компонент для ссылок на уроки, тесты и задания
const LessonLink: React.FC<{ 
  lessonId: number; 
  text: string; 
  onLessonLinkClick?: (lessonId: number) => void;
}> = ({ lessonId, text, onLessonLinkClick }) => {
  const handlePress = () => {
    if (onLessonLinkClick) {
      onLessonLinkClick(lessonId);
    } else {
      Alert.alert('Урок', `Переход к уроку: ${text}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.linkContainer}>
      <Text style={styles.linkText}>📚 {text}</Text>
    </TouchableOpacity>
  );
};

const TestLink: React.FC<{ 
  testId: number; 
  text: string; 
  onTestLinkClick?: (testId: number) => void;
}> = ({ testId, text, onTestLinkClick }) => {
  const handlePress = () => {
    if (onTestLinkClick) {
      onTestLinkClick(testId);
    } else {
      Alert.alert('Тест', `Переход к тесту: ${text}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.linkContainer}>
      <Text style={styles.linkText}>📝 {text}</Text>
    </TouchableOpacity>
  );
};

const AssignmentLink: React.FC<{ 
  assignmentId: number; 
  text: string; 
  onAssignmentLinkClick?: (assignmentId: number) => void;
}> = ({ assignmentId, text, onAssignmentLinkClick }) => {
  const handlePress = () => {
    if (onAssignmentLinkClick) {
      onAssignmentLinkClick(assignmentId);
    } else {
      Alert.alert('Задание', `Переход к заданию: ${text}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.linkContainer}>
      <Text style={styles.linkText}>📋 {text}</Text>
    </TouchableOpacity>
  );
};

export const StructuredContentViewer: React.FC<StructuredContentViewerProps> = ({ 
  content,
  contentFormatted, 
  onLessonLinkClick,
  onTestLinkClick,
  onAssignmentLinkClick,
  style 
}) => {
  const [expandedAccordions, setExpandedAccordions] = useState<Set<number>>(new Set());

  // Добавляем отладочную информацию
  React.useEffect(() => {
    console.log('📄 StructuredContentViewer: Content type:', {
      hasContent: !!content,
      hasContentFormatted: !!contentFormatted,
      contentLength: content?.length || 0,
      contentFormattedLength: contentFormatted?.length || 0,
      contentPreview: content?.substring(0, 200) + '...',
      contentFormattedPreview: contentFormatted?.slice(0, 2)
    });
  }, [content, contentFormatted]);

  const toggleAccordion = (index: number) => {
    const newExpanded = new Set(expandedAccordions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAccordions(newExpanded);
  };

  // Функция для обработки inline-форматирования
  const processInlineFormatting = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    
    // Обрабатываем HTML-сущности
    let processedText = text
      .replace(/&nbsp;/g, ' ')  // Неразрывный пробел
      .replace(/&amp;/g, '&')  // Амперсанд
      .replace(/&lt;/g, '<')   // Меньше
      .replace(/&gt;/g, '>')   // Больше
      .replace(/&quot;/g, '"') // Кавычки
      .replace(/&#39;/g, "'")  // Апостроф
      .replace(/&apos;/g, "'") // Апостроф (альтернативный)
      .replace(/&hellip;/g, '...') // Многоточие
      .replace(/&mdash;/g, '—') // Длинное тире
      .replace(/&ndash;/g, '–') // Короткое тире
      .replace(/&copy;/g, '©') // Знак авторского права
      .replace(/&reg;/g, '®')  // Знак регистрации
      .replace(/&trade;/g, '™') // Товарный знак
      .replace(/&euro;/g, '€')  // Евро
      .replace(/&pound;/g, '£') // Фунт
      .replace(/&yen;/g, '¥')  // Йена
      .replace(/&sect;/g, '§') // Параграф
      .replace(/&para;/g, '¶') // Параграф
      .replace(/&middot;/g, '·') // Точка по центру
      .replace(/&bull;/g, '•')  // Маркер списка
      .replace(/&deg;/g, '°')  // Градус
      .replace(/&plusmn;/g, '±') // Плюс-минус
      .replace(/&times;/g, '×') // Знак умножения
      .replace(/&divide;/g, '÷') // Знак деления
      .replace(/&frac14;/g, '¼') // Одна четверть
      .replace(/&frac12;/g, '½') // Одна половина
      .replace(/&frac34;/g, '¾') // Три четверти
      .replace(/&sup1;/g, '¹')  // Верхний индекс 1
      .replace(/&sup2;/g, '²')  // Верхний индекс 2
      .replace(/&sup3;/g, '³')  // Верхний индекс 3
      .replace(/&ordm;/g, 'º')  // Порядковый номер (мужской)
      .replace(/&ordf;/g, 'ª')  // Порядковый номер (женский)
      .replace(/&alpha;/g, 'α') // Альфа
      .replace(/&beta;/g, 'β') // Бета
      .replace(/&gamma;/g, 'γ') // Гамма
      .replace(/&delta;/g, 'δ') // Дельта
      .replace(/&epsilon;/g, 'ε') // Эпсилон
      .replace(/&zeta;/g, 'ζ') // Дзета
      .replace(/&eta;/g, 'η')  // Эта
      .replace(/&theta;/g, 'θ') // Тета
      .replace(/&iota;/g, 'ι') // Йота
      .replace(/&kappa;/g, 'κ') // Каппа
      .replace(/&lambda;/g, 'λ') // Лямбда
      .replace(/&mu;/g, 'μ')   // Мю
      .replace(/&nu;/g, 'ν')   // Ню
      .replace(/&xi;/g, 'ξ')   // Кси
      .replace(/&omicron;/g, 'ο') // Омикрон
      .replace(/&pi;/g, 'π')   // Пи
      .replace(/&rho;/g, 'ρ') // Ро
      .replace(/&sigma;/g, 'σ') // Сигма
      .replace(/&tau;/g, 'τ')  // Тау
      .replace(/&upsilon;/g, 'υ') // Ипсилон
      .replace(/&phi;/g, 'φ')  // Фи
      .replace(/&chi;/g, 'χ') // Хи
      .replace(/&psi;/g, 'ψ') // Пси
      .replace(/&omega;/g, 'ω') // Омега
      .replace(/&Alpha;/g, 'Α') // Альфа (заглавная)
      .replace(/&Beta;/g, 'Β') // Бета (заглавная)
      .replace(/&Gamma;/g, 'Γ') // Гамма (заглавная)
      .replace(/&Delta;/g, 'Δ') // Дельта (заглавная)
      .replace(/&Epsilon;/g, 'Ε') // Эпсилон (заглавная)
      .replace(/&Zeta;/g, 'Ζ') // Дзета (заглавная)
      .replace(/&Eta;/g, 'Η') // Эта (заглавная)
      .replace(/&Theta;/g, 'Θ') // Тета (заглавная)
      .replace(/&Iota;/g, 'Ι') // Йота (заглавная)
      .replace(/&Kappa;/g, 'Κ') // Каппа (заглавная)
      .replace(/&Lambda;/g, 'Λ') // Лямбда (заглавная)
      .replace(/&Mu;/g, 'Μ')  // Мю (заглавная)
      .replace(/&Nu;/g, 'Ν')  // Ню (заглавная)
      .replace(/&Xi;/g, 'Ξ')  // Кси (заглавная)
      .replace(/&Omicron;/g, 'Ο') // Омикрон (заглавная)
      .replace(/&Pi;/g, 'Π')  // Пи (заглавная)
      .replace(/&Rho;/g, 'Ρ') // Ро (заглавная)
      .replace(/&Sigma;/g, 'Σ') // Сигма (заглавная)
      .replace(/&Tau;/g, 'Τ') // Тау (заглавная)
      .replace(/&Upsilon;/g, 'Υ') // Ипсилон (заглавная)
      .replace(/&Phi;/g, 'Φ') // Фи (заглавная)
      .replace(/&Chi;/g, 'Χ') // Хи (заглавная)
      .replace(/&Psi;/g, 'Ψ') // Пси (заглавная)
      .replace(/&Omega;/g, 'Ω'); // Омега (заглавная)
    
    // Обрабатываем ссылки на уроки, тесты и задания
    return processedText
      .replace(/<a href="\/course\/\d+\?lesson=(\d+)"[^>]*data-lesson-id="(\d+)"[^>]*>(.*?)<\/a>/g, (match, lessonId, dataLessonId, linkText) => {
        return `[LESSON_LINK:${dataLessonId}:${linkText}]`;
      })
      .replace(/<a href="\/course\/\d+\/tests\?test=(\d+)"[^>]*data-test-id="(\d+)"[^>]*>(.*?)<\/a>/g, (match, testId, dataTestId, linkText) => {
        return `[TEST_LINK:${dataTestId}:${linkText}]`;
      })
      .replace(/<a href="\/course\/\d+\/assignments\?assignment=(\d+)"[^>]*data-assignment-id="(\d+)"[^>]*>(.*?)<\/a>/g, (match, assignmentId, dataAssignmentId, linkText) => {
        return `[ASSIGNMENT_LINK:${dataAssignmentId}:${linkText}]`;
      })
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '');
  };

  // Функция для рендеринга блока контента
  const renderBlock = (block: any, index: number) => {
    if (!block || !block.type || !block.data) {
      return (
        <View key={index} style={styles.unsupportedBlock}>
          <Text style={styles.unsupportedText}>Неподдерживаемый блок</Text>
        </View>
      );
    }

    switch (block.type) {
      case 'header':
        const HeaderComponent = block.data.level === 1 ? Text : 
                               block.data.level === 2 ? Text : 
                               block.data.level === 3 ? Text : Text;
        return (
          <HeaderComponent 
            key={index} 
            style={[
              styles.header,
              block.data.level === 1 && styles.h1,
              block.data.level === 2 && styles.h2,
              block.data.level === 3 && styles.h3,
            ]}
          >
            {processInlineFormatting(block.data.text || '')}
          </HeaderComponent>
        );

      case 'paragraph':
        const paragraphText = processInlineFormatting(block.data.text || '');
        // Обрабатываем ссылки в параграфе
        const linkRegex = /\[(LESSON_LINK|TEST_LINK|ASSIGNMENT_LINK):(\d+):(.*?)\]/g;
        const parts = paragraphText.split(linkRegex);
        
        if (parts.length > 1) {
          // Есть ссылки в тексте
          const elements: React.ReactNode[] = [];
          let key = 0;
          
          for (let i = 0; i < parts.length; i += 4) {
            if (parts[i]) {
              elements.push(
                <Text key={key++} style={styles.paragraph}>
                  {parts[i]}
                </Text>
              );
            }
            
            if (parts[i + 1] && parts[i + 2] && parts[i + 3]) {
              const linkType = parts[i + 1];
              const linkId = parseInt(parts[i + 2]);
              const linkText = parts[i + 3];
              
              if (linkType === 'LESSON_LINK') {
                elements.push(
                  <LessonLink
                    key={key++}
                    lessonId={linkId}
                    text={linkText}
                    onLessonLinkClick={onLessonLinkClick}
                  />
                );
              } else if (linkType === 'TEST_LINK') {
                elements.push(
                  <TestLink
                    key={key++}
                    testId={linkId}
                    text={linkText}
                    onTestLinkClick={onTestLinkClick}
                  />
                );
              } else if (linkType === 'ASSIGNMENT_LINK') {
                elements.push(
                  <AssignmentLink
                    key={key++}
                    assignmentId={linkId}
                    text={linkText}
                    onAssignmentLinkClick={onAssignmentLinkClick}
                  />
                );
              }
            }
          }
          
          return <View key={index}>{elements}</View>;
        } else {
          // Обычный текст без ссылок
          return (
            <Text key={index} style={styles.paragraph}>
              {paragraphText}
            </Text>
          );
        }

      case 'list':
        return (
          <View key={index} style={styles.listContainer}>
            {block.data.items?.map((item: any, itemIndex: number) => (
              <View key={itemIndex} style={styles.listItem}>
                <Text style={styles.listBullet}>
                  {block.data.style === 'ordered' ? `${itemIndex + 1}.` : '•'}
                </Text>
                <Text style={styles.listText}>
                  {processInlineFormatting(typeof item === 'string' ? item : (item.content || JSON.stringify(item)))}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'quote':
        return (
          <View key={index} style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              {processInlineFormatting(block.data.text || '')}
            </Text>
          </View>
        );

      case 'image':
      case 'imageUpload':
        const imageUrl = block.data.imageUrl || block.data.url || block.data.src || block.data.file?.url || '';
        console.log('🖼️ Image block data:', {
          type: block.type,
          data: block.data,
          imageUrl: imageUrl,
          originalName: block.data.originalName
        });
        return (
          <MediaImage 
            key={index}
            imageUrl={imageUrl}
            originalName={block.data.originalName}
          />
        );

      case 'video':
      case 'videoUpload':
        const videoUrl = block.data.videoUrl || block.data.url || block.data.src || block.data.file?.url || '';
        console.log('🎥 Video block data:', {
          type: block.type,
          data: block.data,
          videoUrl: videoUrl,
          originalName: block.data.originalName
        });
        return (
          <MediaVideo 
            key={index}
            videoUrl={videoUrl}
            originalName={block.data.originalName}
            title={block.data.title}
          />
        );

      case 'accordion':
      case 'iacordionPage':
        return (
          <AccordionBlock
            key={index}
            title={block.data.title || 'Аккордеон'}
            content={block.data.content || ''}
            index={index}
            expandedAccordions={expandedAccordions}
            onToggle={toggleAccordion}
          />
        );

      case 'accordionRange':
        console.log('🎯 AccordionRange block data:', {
          type: block.type,
          data: block.data,
          title: block.data.title,
          blocks: block.data.blocks?.length || 0
        });
        return (
          <AccordionRangeBlock
            key={index}
            title={block.data.title || 'Аккордеон'}
            blocks={block.data.blocks || []}
            index={index}
            expandedAccordions={expandedAccordions}
            onToggle={toggleAccordion}
            headerColor={block.data.headerColor}
            backgroundColor={block.data.backgroundColor}
            renderBlock={renderBlock}
          />
        );

      case 'borderFrame':
        return (
          <View key={index} style={styles.borderFrame}>
            <Text style={styles.borderFrameText}>
              {processInlineFormatting(block.data.content || '')}
            </Text>
          </View>
        );

      case 'table':
        console.log('📊 Table block data:', {
          type: block.type,
          data: block.data,
          content: block.data.content
        });
        return (
          <TableBlock
            key={index}
            content={block.data.content || []}
            borderColor={block.data.borderColor}
          />
        );

      default:
        console.log('⚠️ Unsupported block type:', block.type, block.data);
        return (
          <View key={index} style={styles.unsupportedBlock}>
            <Text style={styles.unsupportedText}>
              Неподдерживаемый тип блока: {block.type}
            </Text>
            <Text style={styles.unsupportedDetails}>
              Данные: {JSON.stringify(block.data, null, 2).substring(0, 100)}...
            </Text>
          </View>
        );
    }
  };

  // Если есть contentFormatted, используем его
  if (contentFormatted && contentFormatted.length > 0) {
    return (
      <View style={[styles.container, style]}>
        {contentFormatted.map(renderBlock)}
      </View>
    );
  }

  // Если нет contentFormatted, отображаем обычный текст с обработкой ссылок и изображений
  const processedContent = processInlineFormatting(content || '');
  
  // Обрабатываем изображения в HTML
  const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const videoRegex = /<video[^>]+src="([^"]+)"[^>]*>/gi;
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  
  // Обрабатываем специальные ссылки
  const linkRegex = /\[(LESSON_LINK|TEST_LINK|ASSIGNMENT_LINK):(\d+):(.*?)\]/g;
  const parts = processedContent.split(linkRegex);
  
  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    let key = 0;
    
    for (let i = 0; i < parts.length; i += 4) {
      if (parts[i]) {
        // Проверяем, есть ли в тексте изображения, видео или таблицы
        const text = parts[i];
        const imageMatches = [...text.matchAll(imageRegex)];
        const videoMatches = [...text.matchAll(videoRegex)];
        const tableMatches = [...text.matchAll(tableRegex)];
        
        if (imageMatches.length > 0 || videoMatches.length > 0 || tableMatches.length > 0) {
          // Есть медиа в тексте, обрабатываем их
          let processedText = text;
          let lastIndex = 0;
          
          // Обрабатываем изображения
          imageMatches.forEach((match) => {
            const beforeImage = processedText.substring(lastIndex, match.index);
            if (beforeImage.trim()) {
              elements.push(
                <Text key={key++} style={styles.paragraph}>
                  {beforeImage}
                </Text>
              );
            }
            
            elements.push(
              <MediaImage
                key={key++}
                imageUrl={match[1]}
              />
            );
            
            lastIndex = match.index + match[0].length;
          });
          
          // Обрабатываем видео
          videoMatches.forEach((match) => {
            const beforeVideo = processedText.substring(lastIndex, match.index);
            if (beforeVideo.trim()) {
              elements.push(
                <Text key={key++} style={styles.paragraph}>
                  {beforeVideo}
                </Text>
              );
            }
            
            elements.push(
              <MediaVideo
                key={key++}
                videoUrl={match[1]}
              />
            );
            
            lastIndex = match.index + match[0].length;
          });
          
          // Обрабатываем таблицы
          tableMatches.forEach((match) => {
            const beforeTable = processedText.substring(lastIndex, match.index);
            if (beforeTable.trim()) {
              elements.push(
                <Text key={key++} style={styles.paragraph}>
                  {beforeTable}
                </Text>
              );
            }
            
            elements.push(
              <HtmlTableBlock
                key={key++}
                htmlContent={match[0]}
              />
            );
            
            lastIndex = match.index + match[0].length;
          });
          
          // Добавляем оставшийся текст
          const remainingText = processedText.substring(lastIndex);
          if (remainingText.trim()) {
            elements.push(
              <Text key={key++} style={styles.paragraph}>
                {remainingText}
              </Text>
            );
          }
        } else {
          // Обычный текст без медиа
          elements.push(
            <Text key={key++} style={styles.paragraph}>
              {text}
            </Text>
          );
        }
      }
      
      if (parts[i + 1] && parts[i + 2] && parts[i + 3]) {
        const linkType = parts[i + 1];
        const linkId = parseInt(parts[i + 2]);
        const linkText = parts[i + 3];
        
        if (linkType === 'LESSON_LINK') {
          elements.push(
            <LessonLink
              key={key++}
              lessonId={linkId}
              text={linkText}
              onLessonLinkClick={onLessonLinkClick}
            />
          );
        } else if (linkType === 'TEST_LINK') {
          elements.push(
            <TestLink
              key={key++}
              testId={linkId}
              text={linkText}
              onTestLinkClick={onTestLinkClick}
            />
          );
        } else if (linkType === 'ASSIGNMENT_LINK') {
          elements.push(
            <AssignmentLink
              key={key++}
              assignmentId={linkId}
              text={linkText}
              onAssignmentLinkClick={onAssignmentLinkClick}
            />
          );
        }
      }
    }
    
    return elements;
  };

  return (
    <View style={[styles.container, style]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  h1: {
    fontSize: typography.fontSizes.xl,
  },
  h2: {
    fontSize: typography.fontSizes.lg,
  },
  h3: {
    fontSize: typography.fontSizes.md,
  },
  paragraph: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  listContainer: {
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  listBullet: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  listText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  quoteContainer: {
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue[300],
  },
  quoteText: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  imageContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  image: {
    width: screenWidth - (spacing.lg * 2),
    height: 200,
    borderRadius: 8,
  },
  imageFileName: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  errorContainer: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    minHeight: 100,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorUrl: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  errorFileName: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
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
  accordionContainer: {
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    overflow: 'hidden',
  },
  accordionHeader: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    flex: 1,
  },
  accordionIcon: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    transform: [{ rotate: '0deg' }],
  },
  accordionIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  accordionContent: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  accordionRangeContainer: {
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  accordionRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  accordionRangeTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    flex: 1,
  },
  accordionRangeIcon: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginLeft: spacing.sm,
  },
  accordionRangeContent: {
    padding: spacing.md,
  },
  accordionRangeBlocks: {
    gap: spacing.sm,
  },
  accordionRangeBlockItem: {
    marginBottom: spacing.sm,
  },
  accordionRangeEmpty: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
    padding: spacing.lg,
  },
  accordionText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  borderFrame: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.gray[50],
  },
  borderFrameText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  linkContainer: {
    backgroundColor: colors.blue[50],
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.blue[200],
  },
  linkText: {
    fontSize: typography.fontSizes.md,
    color: colors.blue[600],
    fontWeight: typography.fontWeights.medium,
  },
  unsupportedBlock: {
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  unsupportedText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },
  unsupportedDetails: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
  tableContainer: {
    marginVertical: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  tableCell: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    minWidth: 120,
  },
  tableHeaderCell: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[300],
  },
  tableCellText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    textAlign: 'left',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  tableHeaderText: {
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    fontSize: typography.fontSizes.sm,
  },
  tableEmptyText: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
    padding: spacing.lg,
    fontStyle: 'italic',
  },
  htmlTableContainer: {
    marginVertical: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  htmlTableText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    fontFamily: 'monospace',
    lineHeight: 22,
    textAlign: 'left',
  },
});
