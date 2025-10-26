import { apiService } from './apiService';
import { LearningMaterial, CreateLearningMaterialData, UpdateLearningMaterialData, LearningProgress } from '../../types/learning-materials';

class LearningMaterialService {
  async getLearningMaterials(): Promise<LearningMaterial[]> {
    return apiService.get<LearningMaterial[]>('/learning-materials');
  }

  async getMyLearningMaterials(): Promise<LearningMaterial[]> {
    return apiService.get<LearningMaterial[]>('/learning-materials/my');
  }

  async getLearningMaterialById(id: number): Promise<LearningMaterial> {
    return apiService.get<LearningMaterial>(`/learning-materials/${id}`);
  }

  async createLearningMaterial(data: CreateLearningMaterialData): Promise<LearningMaterial> {
    return apiService.post<LearningMaterial>('/learning-materials', data);
  }

  async updateLearningMaterial(id: number, data: UpdateLearningMaterialData): Promise<LearningMaterial> {
    return apiService.put<LearningMaterial>(`/learning-materials/${id}`, data);
  }

  async deleteLearningMaterial(id: number): Promise<void> {
    return apiService.delete<void>(`/learning-materials/${id}`);
  }

  async getLearningProgress(materialId: number): Promise<LearningProgress[]> {
    return apiService.get<LearningProgress[]>(`/learning-materials/${materialId}/progress`);
  }

  async updateLearningProgress(materialId: number, data: {
    progress: number;
    notes?: string;
    rating?: number;
    feedback?: string;
  }): Promise<LearningProgress> {
    return apiService.post<LearningProgress>(`/learning-materials/${materialId}/progress`, data);
  }

  async getMyProgress(): Promise<LearningProgress[]> {
    return apiService.get<LearningProgress[]>('/learning-materials/progress/my');
  }

  async publishLearningMaterial(id: number): Promise<LearningMaterial> {
    return apiService.post<LearningMaterial>(`/learning-materials/${id}/publish`);
  }

  async archiveLearningMaterial(id: number): Promise<LearningMaterial> {
    return apiService.post<LearningMaterial>(`/learning-materials/${id}/archive`);
  }
}

export const learningMaterialService = new LearningMaterialService();


