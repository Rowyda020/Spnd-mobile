// services/sharedBudget.service.ts
import api from './api'; // your axios instance with auth interceptor

export interface CreateSharedBudgetData {
  budgetname: string;
  amount?: number;
  participants: string[]; // array of emails or user IDs — clarify in your backend
}

export interface SharedBudget {
  _id: string;
  budgetname: string;
  user: string;           // probably owner ID
  participants: string[]; // user IDs
  amount: number;
  createdAt: string;
  // add updatedAt, __v, etc. if needed
}

export interface ContributeBudgetData {
  amount: number;
  budgetId: string;       // ← required now to specify which budget
}

const sharedBudgetService = {
  // Create shared budget
  createSharedBudget: async (data: CreateSharedBudgetData): Promise<SharedBudget> => {
    const response = await api.post('/create-sharedBudget', data);
    return response.data;
  },

  // Contribute (add) amount to a specific shared budget
  contributeToBudget: async (data: ContributeBudgetData): Promise<SharedBudget> => {
    if (!data.budgetId) {
      throw new Error('budgetId is required to contribute to a shared budget');
    }
    if (!data.amount || data.amount <= 0) {
      throw new Error('A positive amount is required');
    }

    const response = await api.post('/adding-budget', {
      amount: data.amount,
      budgetId: data.budgetId,
    });

    return response.data; // assuming backend returns the updated SharedBudget
  },

  // Get all shared budgets where current user is participant or owner
  getMySharedBudgets: async (): Promise<SharedBudget[]> => {
    const response = await api.get('/shared-budgets');
    return response.data;
  },

  // Optional: Get one specific shared budget by ID
  getSharedBudgetById: async (budgetId: string): Promise<SharedBudget> => {
    const response = await api.get(`/shared-budgets/${budgetId}`);
    return response.data;
  },
};

export default sharedBudgetService;