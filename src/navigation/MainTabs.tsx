import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { MainTabParamList } from './types';
import { CustomTabBar } from '../components/CustomTabBar';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { MentorDashboardScreen } from '../screens/MentorDashboardScreen';
import { useAppSelector } from '../store/hooks';
import { CoursesScreen } from '../screens/CoursesScreen';
import { AdminCoursesScreen } from '../screens/AdminCoursesScreen';
import { MentorCoursesScreen } from '../screens/MentorCoursesScreen';
import { MentorCourseDetailScreen } from '../screens/MentorCourseDetailScreen';
import { AssignmentsScreen } from '../screens/AssignmentsScreen';
import { MentorAssignmentsScreen } from '../screens/MentorAssignmentsScreen';
import { LearningScreen } from '../screens/LearningScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { AnalysisScreen } from '../screens/AnalysisScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { ArchiveScreen } from '../screens/ArchiveScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { MentorChatScreen } from '../screens/MentorChatScreen';
import { IntegrationsScreen } from '../screens/IntegrationsScreen';
import { BillingScreen } from '../screens/BillingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const { user } = useAppSelector((state) => state.user);
  const isAdmin = user?.role === 'admin';

  // Выбираем компоненты в зависимости от роли
  const DashboardComponent = isAdmin ? AdminDashboardScreen : MentorDashboardScreen;
  const CoursesComponent = isAdmin ? AdminCoursesScreen : MentorCoursesScreen;
  const AssignmentsComponent = isAdmin ? AssignmentsScreen : UploadScreen;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardComponent}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color, fontSize: size }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesComponent}
        options={{
          tabBarLabel: 'Курсы',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color, fontSize: size }}>📚</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarLabel: 'Загрузка',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color, fontSize: size }}>📤</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          tabBarLabel: 'Анализ',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color, fontSize: size }}>🎯</Text>
            </View>
          ),
        }}
      />
      {/* Hidden screens accessible from More menu */}
      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsComponent}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="MentorChat"
        component={MentorChatScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Integrations"
        component={IntegrationsScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Billing"
        component={BillingScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarButton: () => null, // Hide from tab bar
        }}
      />
    </Tab.Navigator>
  );
};
