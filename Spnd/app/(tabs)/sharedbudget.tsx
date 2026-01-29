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
      <View>
        <Text style={styles.budgetName}>{item.budgetname}</Text>
        <Text style={styles.budgetAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.participants}>
          {item.participants.length} participant{item.participants.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.contributeButton}
        onPress={() => router.push({
          pathname: '/addToBudget',
          params: { budgetId: item._id, budgetName: item.budgetname } // optional: pass info
        })}
      >
        <Text style={styles.contributeText}>Contribute</Text>
      </TouchableOpacity>
    </View>
  );
  return (

    <View style={styles.container}>
      <Text style={styles.title}>Shared Budgets</Text>
      <Text style={styles.subtitle}>Manage money with others easily</Text>

      {showForm ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Budget name"
            placeholderTextColor={colors.text.secondary}
            value={budgetName}
            onChangeText={setBudgetName}
          />

          <TextInput
            style={styles.input}
            placeholder="Initial amount (optional)"
            placeholderTextColor={colors.text.secondary}
            value={initialAmount}
            onChangeText={setInitialAmount}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Participant emails (comma-separated)"
            placeholderTextColor={colors.text.secondary}
            value={participants}
            onChangeText={setParticipants}
            multiline
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCreateBudget}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Budget</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowForm(false)}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.addButtonText}>＋ New Shared Budget</Text>
          </TouchableOpacity>

          {isLoading || isFetching ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : budgets.length === 0 ? (
            <Text style={styles.emptyText}>No shared budgets yet</Text>
          ) : (
            <FlatList
              data={budgets}
              renderItem={renderBudgetItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>

  );
}

// Styles (add to your theme or here)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFEF8',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },

  form: {
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    color: '#111827',
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  primaryButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  secondaryButton: {
    alignItems: 'center',
    marginTop: 14,
  },

  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },

  addButton: {
    backgroundColor: '#FACC15',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },

  addButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },

  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40,
  },

  budgetCard: {
    backgroundColor: '#FFFBEB',
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  budgetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  budgetAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16A34A',
    marginVertical: 6,
  },

  participants: {
    color: '#6B7280',
    fontSize: 13,
  },

  contributeButton: {
    marginTop: 20,
    backgroundColor: '#5fa859',
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
  },

  contributeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
