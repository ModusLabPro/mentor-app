export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { token: string };
  CourseDetail: { courseId: number };
  EditCourse: { courseId: number };
  LessonDetail: { lessonId: number };
  AssignmentDetail: { assignmentId: number; courseId?: number };
  TestDetail: { testId: number };
  CourseAssignments: { courseId: number };
  CourseTests: { courseId: number };
  SessionDetail: { sessionId: number };
  Profile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Courses: undefined;
  Upload: undefined;
  Analysis: undefined;
  More: undefined;
  // Additional screens accessible from More menu
  Learning: undefined;
  MentorAssignments: undefined;
  MentorCourses: undefined;
  Assignments: undefined;
  AIAssistant: undefined;
  Analytics: undefined;
  Archive: undefined;
  MentorChat: undefined;
  Integrations: undefined;
  Billing: undefined;
  Profile: undefined;
};
