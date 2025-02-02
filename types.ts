export interface Player {
  id: string;
  name: string;
  phoneNumber: string;
  age: number;
  sport: string;
  created_at: string;
  subscriptionPrice: number;
  payments: Payment[];
  isActive: boolean;
  autoRenew: boolean;
  division: string;
  academyId: string;
  subscription: 'monthly' | 'yearly';
}

export interface Payment {
  id: number;
  amount: number;
  date: string;
}

export type UserRole = 'ADMIN' | 'ACADEMY' | 'COACH';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  academyId: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  academyId: string;
}

export interface Coach {
  id: string;
  name: string;
  specialization: string;
  phone_number: string;
  email: string;
  password: string;
  academyId: string;
  salary: number;
}

export interface CoachSalary {
  id: string;
  coach_id: string;
  amount: number;
  payment_date: string;
  notes?: string;
}

export interface RevenueItem {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  profit: number;
  date: string;
  academyId: string;
}

