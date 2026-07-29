/**
 * API client for DMS Platform REST API
 * Base URL is controlled by NEXT_PUBLIC_API_URL env variable.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface Student {
  _id: string;
  name: string;
  grade: string;
  school: string;
  region: string;
  status: string;
  avatar?: string;
  profileImage?: string;
  certificateImage?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    next: { revalidate: 60 }, // ISR: revalidate every 60s
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error [${res.status}]: ${path}`);
  }

  return res.json();
}

// --- Students ---
export async function getStudents(params?: { page?: number; limit?: number; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  return apiFetch<Student[]>(`/students?${qs.toString()}`);
}

export async function getStudent(id: string) {
  return apiFetch<Student>(`/students/${id}`);
}

// --- Donors ---
export async function getDonors(params?: { page?: number; limit?: number; search?: string; type?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  if (params?.type) qs.set('type', params.type);
  return apiFetch<Donor[]>(`/donors?${qs.toString()}`);
}

export async function getDonor(id: string) {
  return apiFetch<Donor>(`/donors/${id}`);
}
