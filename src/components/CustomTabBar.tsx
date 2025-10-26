import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacing, typography } from '../styles';
import { useAppSelector } from '../store/hooks';
import { Logo } from './Logo';

interface MenuItem {
  key: string;
  title: string;
  icon: string;
  description?: string;
}

export const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { user } = useAppSelector((state) => state.user);
  const isAdmin = user?.role === 'admin';

  // Меню для менторов
  const mentorMenuItems: MenuItem[] = [
    { key: 'AIAssistant', title: 'AI ассистент', icon: '🤖', description: 'Помощник с ИИ' },
    { key: 'MentorChat', title: 'Чат с админом', icon: '💬', description: 'Общение с администратором' },
    { key: 'Billing', title: 'Эквайринг', icon: '💳', description: 'Управление подпиской' },
    { key: 'Profile', title: 'Профиль', icon: '👤', description: 'Настройки аккаунта' },
  ];

  // Меню для администраторов
  const adminMenuItems: MenuItem[] = [
    { key: 'Learning', title: 'Обучение', icon: '🎓', description: 'Управление обучением' },
    { key: 'Assignments', title: 'Проверка и оценка', icon: '✅', description: 'Проверка заданий' },
    { key: 'AIAssistant', title: 'AI-ассистент', icon: '🤖', description: 'Помощник с ИИ' },
    { key: 'Analytics', title: 'Аналитика', icon: '📊', description: 'Статистика и метрики' },
    { key: 'MentorChat', title: 'Чат с менторами', icon: '💬', description: 'Общение с менторами' },
    { key: 'Integrations', title: 'Интеграции', icon: '🔗', description: 'Подключение сервисов' },
    { key: 'Billing', title: 'Биллинг', icon: '💳', description: 'Управление подпиской' },
    { key: 'Archive', title: 'Архив', icon: '📦', description: 'Завершенные материалы' },
    { key: 'Profile', title: 'Профиль', icon: '👤', description: 'Настройки аккаунта' },
  ];

  const moreMenuItems = isAdmin ? adminMenuItems : mentorMenuItems;

  const handleMoreMenuPress = (routeName: string) => {
    console.log('Navigating to:', routeName);
    setShowMoreMenu(false);
    // @ts-ignore - navigation type issue
    navigation.navigate(routeName);
  };

  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.slice(0, 4).map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={styles.tabContent}>
                {options.tabBarIcon && options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? colors.primary : colors.gray[500],
                  size: 24,
                })}
                <Text 
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.primary : colors.gray[500] }
                  ]}
                  numberOfLines={1}
                >
                  {typeof label === 'string' ? label : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        
        {/* More Button */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            console.log('Opening more menu');
            setShowMoreMenu(true);
          }}
        >
          <View style={styles.tabContent}>
            <Text style={styles.moreIcon}>⋯</Text>
            <Text style={[styles.tabLabel, { color: colors.gray[500] }]}>Еще</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Меню</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMoreMenu(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuList}>
              {moreMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuItem}
                  onPress={() => handleMoreMenuPress(item.key)}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      {item.description && (
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  moreIcon: {
    fontSize: 24,
    color: colors.gray[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    width: Dimensions.get('window').width * 0.67, // 2/3 ширины экрана
    maxHeight: Dimensions.get('window').height * 0.8, // Максимальная высота
    marginRight: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.gray[600],
    fontWeight: 'bold',
  },
  menuList: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  menuItemContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[600],
  },
  menuArrow: {
    fontSize: typography.fontSizes.md,
    color: colors.gray[400],
    fontWeight: typography.fontWeights.bold,
  },
});
