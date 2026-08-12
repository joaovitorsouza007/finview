import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../lib/api.js';

// Fonte única de verdade para categorias, movimentações e demais dados.
// Todas as mutações passam por aqui: ao final, os dados são recarregados
// e `dataVersion` sobe — o dashboard e as metas refazem os gráficos sozinhos.
const useAppStore = create((set, get) => ({
  categories: [],
  transactions: [],
  recent: [],
  accounts: [],
  banks: [],
  notifications: [],
  rules: [],
  savingsGoals: [],
  sharing: { sent: [], received: [], active: [] },
  dataVersion: 0,
  loading: false,

  // Incrementa a versão dos dados para que telas dependentes re-executem
  bump() {
    set((s) => ({ dataVersion: s.dataVersion + 1 }));
  },

  async fetchCategories() {
    try {
      const res = await api.get('/categories');
      set({ categories: res.data });
    } catch {
      toast.error('Não foi possível carregar as categorias.');
    }
  },

  async fetchTransactions() {
    try {
      const res = await api.get('/transactions');
      set({ transactions: res.data, recent: res.data.slice(0, 5) });
    } catch {
      toast.error('Não foi possível carregar as movimentações.');
    }
  },

  async fetchAccounts() {
    try {
      const res = await api.get('/accounts');
      set({ accounts: res.data });
    } catch {
      /* contas são opcionais */
    }
  },

  async fetchBanks() {
    try {
      const res = await api.get('/banks');
      set({ banks: res.data });
    } catch {
      /* bancos são opcionais */
    }
  },

  async fetchRules() {
    try {
      const res = await api.get('/rules');
      set({ rules: res.data });
    } catch {
      /* regras são opcionais */
    }
  },

  async fetchSavingsGoals() {
    try {
      const res = await api.get('/savings-goals');
      set({ savingsGoals: res.data });
    } catch {
      /* metas são opcionais */
    }
  },

  async fetchSharing() {
    try {
      const res = await api.get('/sharing');
      set({ sharing: res.data });
    } catch {
      /* compartilhamento é opcional */
    }
  },

  // Recarrega tudo após uma criação, edição ou exclusão
  async refresh() {
    set({ loading: true });
    await Promise.all([
      get().fetchCategories(),
      get().fetchTransactions(),
      get().fetchAccounts(),
      get().fetchBanks(),
    ]);
    get().bump();
    set({ loading: false });
  },

  // ---- Movimentações -------------------------------------------------
  async addTransaction(payload) {
    try {
      await api.post('/transactions', payload);
      await get().refresh();
      toast.success('Movimentação adicionada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível salvar.');
      throw err;
    }
  },

  async updateTransaction(id, payload) {
    try {
      await api.put(`/transactions/${id}`, payload);
      await get().refresh();
      toast.success('Movimentação atualizada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível salvar.');
      throw err;
    }
  },

  async deleteTransaction(id) {
    try {
      await api.delete(`/transactions/${id}`);
      await get().refresh();
      toast.success('Movimentação excluída.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível excluir.');
      throw err;
    }
  },

  // ---- Categorias ----------------------------------------------------
  async addCategory(payload) {
    try {
      await api.post('/categories', payload);
      await get().refresh();
      toast.success('Categoria criada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível criar a categoria.');
      throw err;
    }
  },

  async updateCategory(id, payload) {
    try {
      await api.put(`/categories/${id}`, payload);
      await get().refresh();
      toast.success('Categoria atualizada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível salvar.');
      throw err;
    }
  },

  async deleteCategory(id) {
    try {
      const res = await api.delete(`/categories/${id}`);
      await get().refresh();
      toast.success(`Categoria excluída. Movimentações movidas para "${res.data.reassignedTo}".`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível excluir.');
      throw err;
    }
  },

  // ---- Contas --------------------------------------------------------
  async addAccount(payload) {
    try {
      await api.post('/accounts', payload);
      await get().refresh();
      toast.success('Conta adicionada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível criar a conta.');
      throw err;
    }
  },

  async updateAccount(id, payload) {
    try {
      await api.put(`/accounts/${id}`, payload);
      await get().refresh();
      toast.success('Conta atualizada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível salvar.');
      throw err;
    }
  },

  async deleteAccount(id) {
    try {
      await api.delete(`/accounts/${id}`);
      await get().refresh();
      toast.success('Conta excluída.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível excluir.');
      throw err;
    }
  },

  // ---- Metas personalizadas ------------------------------------------
  async addSavingsGoal(payload) {
    try {
      await api.post('/savings-goals', payload);
      await get().fetchSavingsGoals();
      get().bump();
      toast.success('Meta criada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível criar a meta.');
      throw err;
    }
  },

  async updateSavingsGoal(id, payload) {
    try {
      await api.put(`/savings-goals/${id}`, payload);
      await get().fetchSavingsGoals();
      get().bump();
      toast.success('Meta atualizada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível salvar.');
      throw err;
    }
  },

  async deleteSavingsGoal(id) {
    try {
      await api.delete(`/savings-goals/${id}`);
      await get().fetchSavingsGoals();
      get().bump();
      toast.success('Meta excluída.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível excluir.');
      throw err;
    }
  },

  // ---- Regras de categorização ---------------------------------------
  async addRule(payload) {
    try {
      await api.post('/rules', payload);
      await get().fetchRules();
      toast.success('Regra criada. Ela passa a valer para novas movimentações.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível criar a regra.');
      throw err;
    }
  },

  async deleteRule(id) {
    try {
      await api.delete(`/rules/${id}`);
      await get().fetchRules();
      toast.success('Regra excluída.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível excluir.');
      throw err;
    }
  },

  // ---- Notificações --------------------------------------------------
  async fetchNotifications() {
    try {
      const res = await api.get('/notifications');
      set({ notifications: res.data });
    } catch {
      /* opcional */
    }
  },

  // Roda a checagem de alertas e atualiza a lista
  async checkAlerts() {
    try {
      const res = await api.post('/notifications/check');
      set({ notifications: res.data.notifications });
      return res.data.created;
    } catch {
      return 0;
    }
  },

  async markNotificationRead(id) {
    await api.patch(`/notifications/${id}/read`);
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  async markAllNotificationsRead() {
    await api.post('/notifications/read-all');
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },
}));

export default useAppStore;
