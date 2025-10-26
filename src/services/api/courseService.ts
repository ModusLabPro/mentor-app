import { apiService } from './apiService';
import { Course, CreateCourseData, UpdateCourseData, CourseProgress, CourseStats, CourseForReview } from '../../types/courses';

class CourseService {
  async getCourses(): Promise<Course[]> {
    return apiService.get<Course[]>('/courses');
  }

  async getMyCourses(): Promise<Course[]> {
    return apiService.get<Course[]>('/courses/my');
  }

  async getCourseById(id: number): Promise<Course> {
    return apiService.get<Course>(`/courses/${id}`);
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    return apiService.post<Course>('/courses', data);
  }

  async updateCourse(id: number, data: UpdateCourseData): Promise<Course> {
    return apiService.put<Course>(`/courses/${id}`, data);
  }

  async deleteCourse(id: number): Promise<void> {
    return apiService.delete<void>(`/courses/${id}`);
  }

  async getCourseProgress(courseId: number): Promise<CourseProgress[]> {
    return apiService.get<CourseProgress[]>(`/courses/${courseId}/progress`);
  }

  async startCourse(courseId: number): Promise<CourseProgress> {
    return apiService.post<CourseProgress>(`/courses/${courseId}/start`);
  }

  async updateCourseProgress(courseId: number, data: any): Promise<CourseProgress> {
    return apiService.post<CourseProgress>(`/courses/${courseId}/progress`, data);
  }

  async getCourseStats(courseId: number): Promise<CourseStats> {
    return apiService.get<CourseStats>(`/courses/${courseId}/stats`);
  }

  async getCoursesForReview(): Promise<CourseForReview[]> {
    return apiService.get<CourseForReview[]>('/courses/for-review');
  }

  async publishCourse(courseId: number): Promise<Course> {
    return apiService.post<Course>(`/courses/${courseId}/publish`);
  }

  async archiveCourse(courseId: number): Promise<Course> {
    return apiService.post<Course>(`/courses/${courseId}/archive`);
  }
}

export const courseService = new CourseService();
