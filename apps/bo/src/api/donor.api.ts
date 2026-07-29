import api from './axios';
import { buildPayload } from './payload';

export interface Donor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  amount: number;
  currency: string;
  location: string;
  type: string;
  date: string;
  avatar?: string;
  message?: string;
  createdAt: string;
}

export interface DonorListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

export interface CreateDonorDto {
  name: string;
  email?: string;
  phone?: string;
  amount: number;
  currency?: string;
  location: string;
  type?: string;
  date?: string;
  avatar?: string;
  message?: string;
}

/** Every property the API's CreateDonorDto accepts. */
const DONOR_DTO_KEYS = [
  'name',
  'email',
  'phone',
  'amount',
  'currency',
  'location',
  'type',
  'date',
  'avatar',
  'message',
] as const satisfies readonly (keyof CreateDonorDto)[];

/** Image fields that must be sendable as '' so Remove actually clears them. */
const DONOR_CLEARABLE_KEYS = ['avatar'] as const satisfies readonly (keyof CreateDonorDto)[];

/** Narrow a form/document object down to a valid donor request body. */
export const toDonorPayload = (source: Record<string, unknown>) =>
  buildPayload<CreateDonorDto>(source, DONOR_DTO_KEYS, DONOR_CLEARABLE_KEYS);

export const donorApi = {
  list: (params: DonorListParams = {}) =>
    api.get('/donors', { params }),

  getOne: (id: string) =>
    api.get(`/donors/${id}`),

  create: (data: CreateDonorDto) =>
    api.post('/donors', data),

  update: (id: string, data: Partial<CreateDonorDto>) =>
    api.put(`/donors/${id}`, data),

  delete: (id: string) =>
    api.delete(`/donors/${id}`),
};
