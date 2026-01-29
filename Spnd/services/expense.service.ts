import api from './api';

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  createdAt: string;
  user: string;
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  category: string;
  createdAt?: string;
}

class ExpenseService {
  async getAllExpenses(): Promise<Expense[]> {
    const response = await api.get('/all-expenses');
    return response.data;
  }

  async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await api.post('/create-expense', data);
    return response.data;
  }

  // You'll need to add these endpoints to your backend
  async updateExpense(id: string, data: Partial<CreateExpenseData>): Promise<Expense> {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  }
}

export default new ExpenseService();
