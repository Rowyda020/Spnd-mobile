import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
    Animated, SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '@/constants/theme';
import api from '@/services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

export default function AddBudgetScreen() {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusAnim] = useState(new Animated.Value(0));

    const router = useRouter();
    const queryClient = useQueryClient();

    const { budgetId, budgetName } = useLocalSearchParams<{
        budgetId: string;
        budgetName?: string;
    }>();

    const handleAddBudget = async () => {
        const numAmount = Number(amount.trim().replace(/,/g, ''));
        if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a positive number');
            return;
        }
        if (!budgetId) {
            Alert.alert('Error', 'No budget selected.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/adding-budget', { amount: numAmount, budgetId });
            queryClient.invalidateQueries({ queryKey: ['sharedBudgets'] });

            Alert.alert('Success!', `$${numAmount.toLocaleString()} added to ${budgetName || 'budget'}`, [
                { text: 'Done', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Oops', error.response?.data?.error || 'Failed to add amount.');
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (value: string) => {
        const numeric = value.replace(/[^0-9.]/g, '');
        const parts = numeric.split('.');
        if (parts.length > 2 || parts[1]?.length > 2) return value;
        if (parts[0]) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    return (
        <View style={styles.container}>
            {/* Header Section matching Auth Style */}
            <SafeAreaView style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.card} />
                </TouchableOpacity>
                <View style={styles.headerTextSection}>
                    <Text style={styles.headerTitle}>Add Funds</Text>
                    <Text style={styles.headerSubtitle}>
                        Contributing to {budgetName ? `"${budgetName}"` : 'Shared Budget'}
                    </Text>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.formSheet}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Large Amount Display */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Contribution Amount</Text>
                            <Animated.View style={[
                                styles.amountField,
                                {
                                    borderColor: focusAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [colors.border, colors.primary],
                                    })
                                }
                            ]}>
                                <MaterialCommunityIcons name="currency-usd" size={32} color={colors.primary} />
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0.00"
                                    placeholderTextColor="#A0A0A0"
                                    value={formatAmount(amount)}
                                    onChangeText={(text) => setAmount(formatAmount(text))}
                                    keyboardType="decimal-pad"
                                    autoFocus
                                    editable={!loading}
                                    onFocus={() => Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
                                    onBlur={() => Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
                                />
                            </Animated.View>
                            <Text style={styles.hintText}>Funds will be deducted from your available wallet.</Text>
                        </View>

                        {/* Submit Button - Golden Style */}
                        <TouchableOpacity
                            style={[styles.submitButton, (!amount.trim() || loading) && { opacity: 0.7 }]}
                            onPress={handleAddBudget}
                            disabled={!amount.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.secondary} />
                            ) : (
                                <Text style={styles.submitButtonText}>Confirm Contribution</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
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
    backButton: {
        marginBottom: 10,
        marginLeft: -5,
    },
    headerTextSection: {
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.card,
        lineHeight: 40,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: colors.text.light,
        lineHeight: 22,
    },
    formSheet: {
        flex: 1,
        backgroundColor: colors.card,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingHorizontal: 25,
        paddingTop: 40,
    },
    inputWrapper: {
        marginBottom: 35,
    },
    inputLabel: {
        fontSize: 12,
        color: colors.text.light,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        fontWeight: '600',
    },
    amountField: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        paddingVertical: 10,
    },
    amountInput: {
        flex: 1,
        fontSize: 42,
        fontWeight: '700',
        color: colors.text.primary,
        padding: 0,
        marginLeft: 5,
    },
    hintText: {
        fontSize: 13,
        color: colors.text.light,
        marginTop: 15,
        fontStyle: 'italic',
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 30,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonText: {
        color: colors.secondary,
        fontSize: 18,
        fontWeight: '700',
    },
    cancelButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.text.light,
        fontSize: 16,
        fontWeight: '600',
    },
});