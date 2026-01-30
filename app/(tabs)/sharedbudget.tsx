import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sharedBudgetService, { CreateSharedBudgetData } from '@/services/sharedBudget.service';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function SharedBudgetScreen() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  // Form state for creating budget
  const [budgetName, setBudgetName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [participants, setParticipants] = useState(''); // comma-separated emails
  const [showForm, setShowForm] = useState(false);

  // Fetch shared budgets (add backend endpoint if needed)
  const { data: budgets = [], isLoading, isFetching } = useQuery({
    queryKey: ['sharedBudgets'],
    queryFn: () => sharedBudgetService.getMySharedBudgets(),
    // enabled: !!user,     // optional: only run if logged in
  });

  // In onSuccess of createMutation – force refetch

  const createMutation = useMutation({
    mutationFn: (data: CreateSharedBudgetData) => sharedBudgetService.createSharedBudget(data),
    onSuccess: () => {
      Alert.alert('Success', 'Shared budget created!');
      setShowForm(false);
      resetForm();
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['sharedBudgets'] });
    },
    onError: (error: any) => {
      console.log('─'.repeat(60));
      console.error('CREATE SHARED BUDGET FAILED');
      console.error('Status:', error.response?.status);
      console.error('Full response:', JSON.stringify(error.response?.data, null, 2));
      // console.error('Sent payload:', payload); // add this
      console.log('─'.repeat(60));

      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error.response?.data?.errors?.map?.((e: any) => e.msg).join('\n')) ||
        'Failed to create shared budget. Check console for details.';

      Alert.alert('Error', errMsg);
    },
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);


  const contributeMutation = useMutation({
    mutationFn: (data: { amount: number }) => sharedBudgetService.contributeToBudget(data),
    onSuccess: () => {
      Alert.alert('Success', 'Shared budget created!');
      setShowForm(false);
      resetForm();
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['sharedBudgets'] });
      // Optional: refetch immediately if you want
      queryClient.refetchQueries({ queryKey: ['sharedBudgets'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to contribute');
    },
  });

  const handleCreateBudget = () => {
    if (!budgetName || !participants) {
      Alert.alert('Error', 'Budget name and at least one participant email are required');
      return;
    }

    const participantEmails = participants.split(',').map(e => e.trim()).filter(Boolean);

    const payload: CreateSharedBudgetData = {
      budgetname: budgetName.trim(),
      amount: initialAmount ? Number(initialAmount) : 0,
      participants: participantEmails,
    };

    createMutation.mutate(payload);
  };

  const resetForm = () => {
    setBudgetName('');
    setInitialAmount('');
    setParticipants('');
  };
  const renderBudgetItem = ({ item }: { item: any }) => (
    <View style={styles.budgetCard}>
      <View style={styles.cardTop}>
        <View style={styles.infoSection}>
          <Text style={styles.budgetNameText}>{item.budgetname}</Text>
          <View style={styles.participantBadge}>
            <Text style={styles.participantText}>👤 {item.participants.length} members</Text>
          </View>
        </View>
        <Text style={styles.budgetAmountText}>${item.amount.toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => router.push({
          pathname: '/addToBudget',
          params: { budgetId: item._id, budgetName: item.budgetname }
        })}
      >
        <Text style={styles.outlineButtonText}>Contribute</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shared Budgets</Text>
        <Text style={styles.subtitle}>Collaborative spending tracking</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No active shared budgets.</Text>}
        />
      )}

      {/* Modern FAB (Floating Action Button) */}
      {!showForm && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>New Shared Budget</Text>

              <TextInput
                style={styles.modernInput}
                placeholder="Budget Name (e.g. Trip to Paris)"
                value={budgetName}
                onChangeText={setBudgetName}
              />

              <TextInput
                style={styles.modernInput}
                placeholder="Initial Amount"
                value={initialAmount}
                onChangeText={setInitialAmount}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.modernInput, styles.textArea]}
                placeholder="Emails (comma separated)"
                value={participants}
                onChangeText={setParticipants}
                multiline
              />

              <TouchableOpacity
                style={styles.mainActionBtn}
                onPress={() => createMutation.mutate({
                  budgetname: budgetName,
                  amount: Number(initialAmount),
                  participants: participants.split(',').map(p => p.trim())
                })}
              >
                <Text style={styles.mainActionBtnText}>Create Budget</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowForm(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

// Styles (add to your theme or here)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFE', // Ultra-clean subtle blue-white
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1C1E',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6C757D',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  emptyText: {

    textAlign: 'center',

    color: '#6B7280',

    marginTop: 40,

  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  budgetAmountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00c954', // Deep green for money
  },
  participantBadge: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  participantText: {
    fontSize: 11,
    color: '#495057',
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#FACC15',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#1A1C1E',
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FACC15',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FACC15',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
    color: '#1A1C1E',
    fontWeight: '300',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1A1C1E',
  },
  modernInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mainActionBtn: {
    backgroundColor: '#FACC15',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  mainActionBtnText: {
    fontWeight: '800',
    fontSize: 16,
    color: '#1A1C1E',
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 15,
  },
  cancelBtnText: {
    color: '#ADB5BD',
    fontSize: 14,
  },
  infoSection: {
    flex: 1,           // Takes up the available space on the left
    paddingRight: 10,  // Prevents text from hitting the amount
  },
});
