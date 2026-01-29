import api from './api';

export interface Income {
  _id: string;
  amount: number;
  source: string;
  category: string;
  createdAt: string;
  user: string;
}

export interface CreateIncomeData {
  amount: number;
  source: string;
  category: string;
  createdAt?: string;
}

class IncomeService {
  async getAllIncomes(): Promise<Income[]> {
    const response = await api.get('/all-incomes');
    return response.data;
  }

  async createIncome(data: CreateIncomeData): Promise<Income> {
    const response = await api.post('/create-income', data);
    return response.data;
  }

  async updateIncome(id: string, data: Partial<CreateIncomeData>): Promise<Income> {
    const response = await api.put(`/incomes/${id}`, data);
    return response.data;
  }

  async deleteIncome(id: string): Promise<void> {
    await api.delete(`/incomes/${id}`);
  }
}

export default new IncomeService();
