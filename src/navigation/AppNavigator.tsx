import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, clearUser } from '../store/slices/userSlice';
import { authService } from '../services/api/authService';
import { MainTabs } from './MainTabs';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { VerifyEmailScreen } from '../screens/VerifyEmailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { EditCourseScreen } from '../screens/EditCourseScreen';
import { MentorCourseDetailScreen } from '../screens/MentorCourseDetailScreen';
import { LessonDetailScreen } from '../screens/LessonDetailScreen';
import { AssignmentDetailScreen } from '../screens/AssignmentDetailScreen';
import { TestDetailScreen } from '../screens/TestDetailScreen';
import { CourseAssignmentsScreen } from '../screens/CourseAssignmentsScreen';
import { CourseTestsScreen } from '../screens/CourseTestsScreen';
import { SessionDetailScreen } from '../screens/SessionDetailScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        if (authenticated) {
          const userData = await authService.getCurrentUser();
          if (userData) {
            dispatch(setUser(userData));
          } else {
            dispatch(clearUser());
          }
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  if (isLoading) {
    return null; // Или компонент загрузки
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen 
            name="CourseDetail" 
            component={user?.role === 'admin' ? CourseDetailScreen : MentorCourseDetailScreen} 
          />
          <Stack.Screen name="EditCourse" component={EditCourseScreen} />
          <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
          <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
          <Stack.Screen name="TestDetail" component={TestDetailScreen} />
          <Stack.Screen name="CourseAssignments" component={CourseAssignmentsScreen} />
          <Stack.Screen name="CourseTests" component={CourseTestsScreen} />
          <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
