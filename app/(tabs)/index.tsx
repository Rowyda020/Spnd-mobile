import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import expenseService from '../../services/expense.service';
import incomeService from '../../services/income.service';
import sharedBudgetService from '@/services/sharedBudget.service';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenseData, setExpenseData] = useState({
    amount: '',
    description: '',
    category: '',
    createdAt: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'food',
    'transport',
    'entertainment',
    'shopping',
    'bills',
    'shared budget',
    'other',
  ];

  // Fetch expenses
  const {
    data: expenses = [],
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseService.getAllExpenses(),
  });

  // Fetch incomes
  const {
    data: incomes = [],
    isLoading: incomesLoading,
    refetch: refetchIncomes,
  } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => incomeService.getAllIncomes(),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => expenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      Alert.alert('Success', 'Expense added successfully!');
      resetForm();
      refreshUser();
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add expense');
    },
  });

  const isLoading =
    expensesLoading ||
    incomesLoading ||
    createExpenseMutation.isPending;  // ← Changed here

  // Calculate this month's spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthExpenses = expenses.filter((expense: any) => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const thisMonthTotal = thisMonthExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

  // TODO: Calculate real last month total (you can fetch older data or use a separate query)
  const lastMonthTotal = 1000; // Replace with real calculation later
  const percentageChange = lastMonthTotal ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  // Recent transactions (last 5)
  const recentTransactions = expenses.slice(-5).reverse();

  const onRefresh = () => {
    refetchExpenses();
    refetchIncomes();
  };

  const resetForm = () => {
    setExpenseData({
      amount: '',
      description: '',
      category: '',
      createdAt: new Date().toISOString().split('T')[0],
    });
  };
  const createIncomeMutation = useMutation({
    mutationFn: (data) => {
      console.log('MUTATION CALLED WITH DATA:', data);  // ← add this line
      return incomeService.createIncome(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });

      refreshUser(); // ✅ updates totalIncome immediately
      Alert.alert('Success', 'Income added!');
    },
  });

  // Same for expense mutation

  const handleAddExpense = () => {
    if (!expenseData.amount || !expenseData.description || !expenseData.category) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const amountNumber = parseFloat(expenseData.amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const expensePayload = {
      amount: amountNumber,
      description: expenseData.description.trim(),
      category: expenseData.category,
      date: expenseData.createdAt || new Date().toISOString().split('T')[0],
    };

    createExpenseMutation.mutate(expensePayload);
  };

  const handleCategorySelect = (category: string) => {
    setExpenseData((prev) => ({ ...prev, category }));
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        expenseData.category === item && styles.categoryChipSelected,
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Ionicons
        name={getCategoryIcon(item)}
        size={16}
        color={expenseData.category === item ? '#fff' : colors.text.secondary}
      />
      <Text
        style={[
          styles.categoryText,
          expenseData.category === item && styles.categoryTextSelected,
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Monthly Spend Card */}
        <View style={styles.spendCard}>
          <Text style={styles.spendLabel}>This Month Spend</Text>
          <Text style={styles.spendAmount}>${thisMonthTotal.toFixed(2)}</Text>
          <View style={styles.changeContainer}>
            <Ionicons
              name={percentageChange < 0 ? 'arrow-down' : 'arrow-up'}
              size={16}
              color={percentageChange < 0 ? colors.success : colors.error}
            />
            <Text style={[styles.changeText, { color: percentageChange < 0 ? colors.success : colors.error }]}>
              {Math.abs(percentageChange).toFixed(0)}% {percentageChange < 0 ? 'below' : 'above'} last month
            </Text>
          </View>
        </View>

        {/* Spending Wallet */}
        <TouchableOpacity
          style={styles.walletCard}
          onPress={() => router.push('/income')}
          activeOpacity={0.7}
        >

          <View style={styles.walletIcon}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Spending Wallet</Text>
            <Text style={styles.walletAmount}>${user?.totalIncome?.toFixed(2) || '0.00'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={32} color={colors.text.light} />
              </View>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your expenses</Text>
            </View>
          ) : (
            recentTransactions.map((transaction: any) => {
              // Date Safety Check
              const dateObj = new Date(transaction.date || transaction.createdAt);
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                : 'Recently';

              return (
                <View key={transaction._id} style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: getCategoryColor(transaction.category) }]}>
                    <Ionicons name={getCategoryIcon(transaction.category)} size={20} color="#fff" />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName} numberOfLines={1}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>{formattedDate} • {transaction.category}</Text>
                  </View>

                  <Text style={styles.transactionAmount}>
                    -${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              );
            })
          )}
        </View>


        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)} // ← This opens the modal!
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !createExpenseMutation.isPending && setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Expense</Text>
              <TouchableOpacity
                onPress={() => !createExpenseMutation.isPending && setIsModalVisible(false)}
                disabled={createExpenseMutation.isPending}  // ← Changed
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push('/shared-budget')}>
              <Text>View Shared Budgets</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount *</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    placeholder="0.00"
                    value={expenseData.amount}
                    onChangeText={(text) => setExpenseData((prev) => ({ ...prev, amount: text }))}
                    keyboardType="decimal-pad"
                    editable={!createExpenseMutation.isPending}
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What was this expense for?"
                  value={expenseData.description}
                  onChangeText={(text) => setExpenseData((prev) => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  editable={!createExpenseMutation.isPending}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesContainer}
                />
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={expenseData.createdAt}
                    onChangeText={(text) => setExpenseData((prev) => ({ ...prev, date: text }))}
                    placeholder="YYYY-MM-DD"
                    editable={!createExpenseMutation.isPending}
                  />
                </View>
                <Text style={styles.dateHint}>Leave empty for today's date</Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}
                  disabled={createExpenseMutation.isPending}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    (!expenseData.amount || !expenseData.description || !expenseData.category) &&
                    styles.submitButtonDisabled,
                  ]}
                  onPress={handleAddExpense}
                  disabled={
                    createExpenseMutation.isPending ||
                    !expenseData.amount ||
                    !expenseData.description ||
                    !expenseData.category
                  }
                >
                  {createExpenseMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add Expense</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper functions
const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: any } = {
    'food': 'restaurant-outline',
    'transport': 'car-outline',
    'entertainment': 'game-controller-outline',
    'shopping': 'cart-outline',
    'bills': 'document-text-outline',
    'shared budget': 'people-outline',
    'default': 'cash-outline',
  };
  return icons[category?.toLowerCase()] || icons['default'];
};

const getCategoryColor = (category: string) => {
  const colors_map: { [key: string]: string } = {
    'food': '#4CAF50',
    'transport': '#2196F3',
    'entertainment': '#9C27B0',
    'shopping': '#FF9800',
    'bills': '#F44336',
    'shared budget': '#8B7FD9',
    'default': '#757575',
  };
  return colors_map[category?.toLowerCase()] || colors_map['default'];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  spendCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spendLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  spendAmount: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  seeAllText: {
    color: '#FACC15', // Using your brand yellow for links
    fontWeight: '700',
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    // Subtle lift instead of border
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20, // Perfectly round
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  transactionDate: {
    fontSize: 12,
    color: '#94A3B8', // Muted slate
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444', // Red for expenses
    marginLeft: 8,
  },
  // Empty State Styling
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  emptyIconContainer: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
    color: colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    backgroundColor: colors.card,
    color: colors.text.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginRight: spacing.sm,
    color: colors.text.primary,
  },
  amountInput: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: fontWeight.semibold,
  },

  dateInput: {
    flex: 1,
    borderWidth: 0,
    marginLeft: spacing.sm,
    paddingLeft: 0,
  },
  dateHint: {
    fontSize: fontSize.xs,
    color: colors.text.light,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.light,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

});
