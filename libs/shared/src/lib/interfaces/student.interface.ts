export interface IStudent {
  _id?: string;
  name: string;
  grade: string;
  school: string;
  region: string;
  status: 'Active' | 'Pending' | 'Graduated' | 'Inactive';
  avatar?: string;
  profileImage?: string;
  certificateImage?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
