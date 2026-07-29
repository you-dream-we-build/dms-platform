export interface IDonor {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  amount: number;
  currency: string;
  location: string;
  type: 'One-time' | 'Monthly' | 'Annual';
  date: Date;
  avatar?: string;
  message?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
