// services/sharedBudget.service.ts
import api from './api'; // your axios instance with auth interceptor

export interface CreateSharedBudgetData {
  budgetname: string;
  amount?: number;
  participants: string[]; // array of emails
}

export interface SharedBudget {
  _id: string;
  budgetname: string;
  user: string;
  participants: string[]; // user IDs
  amount: number;
  createdAt: string;
  // add more fields if your model has them
}

export interface ContributeBudgetData {
  amount: number;
}

const sharedBudgetService = {
  // Create shared budget
  createSharedBudget: async (data: CreateSharedBudgetData): Promise<SharedBudget> => {
    const response = await api.post('/create-sharedBudget', data);
    return response.data;
  },

  // Contribute (add) amount to shared budget
  contributeToBudget: async (data: ContributeBudgetData): Promise<SharedBudget> => {
    const response = await api.post('/adding-budget', data);
    return response.data;
  },

  // Optional: Get all shared budgets where user is participant or owner
  getMySharedBudgets: async (): Promise<SharedBudget[]> => {
    const response = await api.get('/shared-budgets'); // add this endpoint in backend if needed
    return response.data;
  },
};

export default sharedBudgetService;