import api from './axios';
import { buildPayload } from './payload';

export interface Student {
  _id: string;
  name: string;
  grade: string;
  school: string;
  region: string;
  status: string;
  avatar?: string;
  certificateImage?: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateStudentDto {
  name: string;
  grade: string;
  school: string;
  region: string;
  status?: string;
  email?: string;
  phone?: string;
  notes?: string;
  avatar?: string;
  certificateImage?: string;
}

/** Every property the API's CreateStudentDto accepts. */
const STUDENT_DTO_KEYS = [
  'name',
  'grade',
  'school',
  'region',
  'status',
  'email',
  'phone',
  'notes',
  'avatar',
  'certificateImage',
] as const satisfies readonly (keyof CreateStudentDto)[];

/** Image fields that must be sendable as '' so Remove actually clears them. */
const STUDENT_CLEARABLE_KEYS = [
  'avatar',
  'certificateImage',
] as const satisfies readonly (keyof CreateStudentDto)[];

/** Narrow a form/document object down to a valid student request body. */
export const toStudentPayload = (source: Record<string, unknown>) =>
  buildPayload<CreateStudentDto>(source, STUDENT_DTO_KEYS, STUDENT_CLEARABLE_KEYS);

export const studentApi = {
  list: (params: StudentListParams = {}) =>
    api.get('/students', { params }),

  getOne: (id: string) =>
    api.get(`/students/${id}`),

  create: (data: CreateStudentDto) =>
    api.post('/students', data),

  update: (id: string, data: Partial<CreateStudentDto>) =>
    api.put(`/students/${id}`, data),

  delete: (id: string) =>
    api.delete(`/students/${id}`),
};
