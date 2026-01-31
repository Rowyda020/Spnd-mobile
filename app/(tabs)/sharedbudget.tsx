import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, FlatList,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sharedBudgetService, { CreateSharedBudgetData } from '@/services/sharedBudget.service';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SharedBudgetScreen() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [budgetName, setBudgetName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [participants, setParticipants] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['sharedBudgets'],
    queryFn: () => sharedBudgetService.getMySharedBudgets(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSharedBudgetData) => sharedBudgetService.createSharedBudget(data),
    onSuccess: () => {
      Alert.alert('Success', 'Shared budget created!');
      setShowForm(false);
      setBudgetName('');
      setInitialAmount('');
      setParticipants('');
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['sharedBudgets'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.error || 'Failed to create budget.';
      Alert.alert('Error', errMsg);
    },
  });

  const renderBudgetItem = ({ item }: { item: any }) => (
    <View style={styles.budgetCard}>
      <View style={styles.cardTop}>
        <View style={styles.infoSection}>
          <Text style={styles.budgetNameText}>{item.budgetname}</Text>
          <View style={styles.participantBadge}>
            <Ionicons name="people" size={12} color={colors.text.light} />
            <Text style={styles.participantText}>{item.participants.length} members</Text>
          </View>
        </View>
        <Text style={styles.budgetAmountText}>${item.amount.toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        style={styles.contributeButton}
        onPress={() => router.push({
          pathname: '/addToBudget',
          params: { budgetId: item._id, budgetName: item.budgetname }
        })}
      >
        <Text style={styles.contributeButtonText}>Contribute</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.secondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Dark Header matching Login/Register */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerTextSection}>
          <Text style={styles.headerTitle}>Shared Budgets</Text>
          <Text style={styles.headerSubtitle}>Collaborative spending tracking</Text>
        </View>
      </SafeAreaView>

      <View style={styles.formSheet}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={budgets}
            renderItem={renderBudgetItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="wallet-membership" size={60} color={colors.border} />
                <Text style={styles.emptyText}>No active shared budgets.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button - Golden */}
      {!showForm && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={32} color={colors.secondary} />
        </TouchableOpacity>
      )}

      {/* Simplified Modal Overlay */}
      {showForm && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>New Shared Budget</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Budget Name</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Trip to Paris"
                  value={budgetName}
                  onChangeText={setBudgetName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Initial Amount</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="0.00"
                  value={initialAmount}
                  onChangeText={setInitialAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Participant Emails</Text>
                <TextInput
                  style={[styles.modernInput, styles.textArea]}
                  placeholder="friend@email.com, friend2@email.com"
                  value={participants}
                  onChangeText={setParticipants}
                  multiline
                />
              </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  headerContainer: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTextSection: {
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.card,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.text.light,
    marginTop: 4,
  },
  formSheet: {
    flex: 1,
    backgroundColor: colors.card, // White background
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 20,
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 100,
    paddingTop: 10,
  },
  budgetCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    // Subtle Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoSection: {
    flex: 1,
  },
  budgetNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  participantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  participantText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  budgetAmountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b91e',
  },
  contributeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contributeButtonText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 15,
    marginRight: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: colors.text.light,
    marginTop: 10,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 25,
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 25,
    width: '100%',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 25,
    color: colors.text.primary,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.light,
    marginBottom: 8,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  modernInput: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  mainActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
  },
  mainActionBtnText: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.secondary,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  cancelBtnText: {
    color: colors.text.light,
    fontWeight: '600',
    fontSize: 15,
  },
});