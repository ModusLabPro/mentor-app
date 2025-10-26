export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  specialization?: string;
  experience?: number;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  is_privacy_policy_accepted: boolean;
  is_newsletter_subscription: boolean;
  organizationId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  avatar?: string;
}

export interface Achievement {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
}

export interface Activity {
  date: string;
  action: string;
  score?: number;
}

export interface ProfileStats {
  completedCourses: number;
  completedAssignments: number;
  averageScore: number;
  totalSessions: number;
}


