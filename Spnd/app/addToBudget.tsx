import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/constants/theme';
import api from '@/services/api'; // ← use your auth-enabled axios instance
import { useRouter } from 'expo-router';
export default function AddBudgetScreen() {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const handleAddBudget = async () => {
        const numAmount = Number(amount.trim());

        if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a positive number');
            return;
        }

        try {
            setLoading(true);

            const response = await api.post('/adding-budget', { amount: numAmount });

            Alert.alert('Success', 'Amount added to shared budget!', [{
                text: 'OK', onPress: () => {
                    setAmount('');
                    router.back();           // ← This goes back to previous screen
                },
            }]);
            setAmount('');
            console.log('Updated budget:', response.data);
        } catch (error: any) {
            console.log('Contribute error:', error.response?.data || error.message);

            const msg =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to add amount. Please try again.';

            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Ionicons name="people-outline" size={40} color={colors.primary} />
                        <Text style={styles.title}>Contribute to Shared Budget</Text>
                    </View>

                    <Text style={styles.subtitle}>
                        Add money to your shared budget. This amount will be deducted from your wallet.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Amount to Contribute</Text>
                        <View style={styles.amountField}>
                            <Text style={styles.currency}>$</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                placeholderTextColor={colors.text.light}
                                value={amount}
                                onChangeText={(text) => {
                                    // Allow only numbers and one decimal point
                                    const cleaned = text.replace(/[^0-9.]/g, '');
                                    const parts = cleaned.split('.');
                                    if (parts.length > 2) return;
                                    if (parts[1]?.length > 2) return;
                                    setAmount(cleaned);
                                }}
                                keyboardType="decimal-pad"
                                autoFocus
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!amount.trim() || loading) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleAddBudget}
                        disabled={!amount.trim() || loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#111" />
                        ) : (
                            <Text style={styles.submitButtonText}>Add Amount</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {/* router.back() or navigation.goBack() */ }}
                    >
                        <Text style={styles.backButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFEF8',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: '#FDE68A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: '#111827',
        marginTop: spacing.md,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: '#374151',
        marginBottom: spacing.sm,
    },
    amountField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
    },
    currency: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
        marginRight: spacing.sm,
    },
    amountInput: {
        flex: 1,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        color: '#111827',
        paddingVertical: spacing.md,
    },
    submitButton: {
        backgroundColor: '#FACC15',
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#111827',
    },
    backButton: {
        alignItems: 'center',
    },
    backButtonText: {
        color: '#6B7280',
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
});