import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import incomeService from '../../services/income.service';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
export interface CreateIncomeDTO {
    amount: number;
    description?: string;
    category?: string;
}

export default function IncomeScreen() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [incomeData, setIncomeData] = useState({
        amount: '',
        source: '',
        category: '',
        createdAt: new Date().toISOString().split('T')[0],
    });

    const categories = [
        'salary',
        'freelance',
        'investment',
        'business',
        'gift',
        'bonus',
        'other',
    ];

    // Fetch incomes
    const {
        data: incomes = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['incomes'],
        queryFn: () => incomeService.getAllIncomes(),
    });

    const createIncomeMutation = useMutation({
        mutationFn: (data: any) => {
            console.log('📤 Sending income data:', data);
            return incomeService.createIncome(data);
        },
        onSuccess: (response) => {
            console.log('✅ Income created successfully:', response);
            queryClient.invalidateQueries({ queryKey: ['incomes'] });
            refreshUser();
            Alert.alert('Success', 'Income added successfully!');
            resetForm();
            setIsModalVisible(false);
        },
        onError: (error: any) => {
            console.error('❌ Error creating income:', error);

            let errorMessage = 'Failed to add income';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors || error.response.data;
                if (Array.isArray(validationErrors)) {
                    errorMessage = validationErrors.map((e: any) => e.msg).join('\n');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
        },
    });

    const totalIncome = incomes.reduce((sum: number, income: any) => sum + income.amount, 0);

    const resetForm = () => {
        setIncomeData({
            amount: '',
            source: '',
            category: '',
            createdAt: new Date().toISOString().split('T')[0],
        });
    };

    const handleAddIncome = () => {
        console.log('🔍 Validating income data:', incomeData);

        if (!incomeData.amount || !incomeData.source || !incomeData.category) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const amountNumber = parseFloat(incomeData.amount);
        if (isNaN(amountNumber) || amountNumber <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        const incomePayload = {
            amount: amountNumber,
            source: incomeData.source.trim(),
            category: incomeData.category,
            ...(incomeData.createdAt && { date: incomeData.createdAt }),
        };

        console.log('📦 Final payload:', incomePayload);
        createIncomeMutation.mutate(incomePayload);
    };

    const handleCategorySelect = (category: string) => {
        setIncomeData((prev) => ({ ...prev, category }));
    };

    const renderCategoryItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.categoryChip,
                incomeData.category === item && styles.categoryChipSelected,
            ]}
            onPress={() => handleCategorySelect(item)}
        >
            <Ionicons
                name={getCategoryIcon(item)}
                size={16}
                color={incomeData.category === item ? '#fff' : colors.text.secondary}
            />
            <Text
                style={[
                    styles.categoryText,
                    incomeData.category === item && styles.categoryTextSelected,
                ]}
            >
                {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
        </TouchableOpacity>
    );

    const renderIncomeItem = ({ item }: { item: any }) => {
        // Determine which date to use and validate it
        const rawDate = item.date || item.createdAt;
        const dateObj = new Date(rawDate);
        const isValidDate = !isNaN(dateObj.getTime());

        const formattedDate = isValidDate
            ? dateObj.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })
            : 'Recent'; // Fallback text

        return (
            <View style={styles.incomeItem}>
                <View style={[styles.incomeIcon, { backgroundColor: getCategoryColor(item.category) }]}>
                    <Ionicons name={getCategoryIcon(item.category)} size={22} color="#fff" />
                </View>

                <View style={styles.incomeInfo}>
                    <Text style={styles.incomeName} numberOfLines={1}>{item.source}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.incomeCategory}>{item.category}</Text>
                        <Text style={styles.dot}> • </Text>
                        <Text style={styles.incomeDate}>{formattedDate}</Text>
                    </View>
                </View>

                <Text style={styles.incomeAmount}>+${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Income</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Total Income Card */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total Balance</Text>
                <Text style={styles.totalAmount}>${user?.totalIncome?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.totalSubtext}>
                    {incomes.length} income {incomes.length === 1 ? 'source' : 'sources'}
                </Text>
            </View>

            {/* Income List */}
            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>All Income</Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : incomes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="cash-outline" size={64} color={colors.text.light} />
                        <Text style={styles.emptyText}>No income added yet</Text>
                        <Text style={styles.emptySubtext}>Tap the + button to add your first income</Text>
                    </View>
                ) : (
                    <FlatList
                        data={incomes}
                        renderItem={renderIncomeItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                        }
                    />
                )}
            </View>

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    console.log('➕ Opening modal to add income');
                    setIsModalVisible(true);
                }}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Add Income Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => !createIncomeMutation.isPending && setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Income</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!createIncomeMutation.isPending) {
                                        resetForm();
                                        setIsModalVisible(false);
                                    }
                                }}
                                disabled={createIncomeMutation.isPending}
                            >
                                <Ionicons name="close" size={24} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Amount */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Amount *</Text>
                                <View style={styles.amountContainer}>
                                    <Text style={styles.currencySymbol}>$</Text>
                                    <TextInput
                                        style={[styles.input, styles.amountInput]}
                                        placeholder="0.00"
                                        value={incomeData.amount}
                                        onChangeText={(text) => {
                                            const cleaned = text.replace(/[^0-9.]/g, '');
                                            const parts = cleaned.split('.');
                                            if (parts.length > 2) return;
                                            setIncomeData((prev) => ({ ...prev, amount: cleaned }));
                                        }}
                                        keyboardType="decimal-pad"
                                        editable={!createIncomeMutation.isPending}
                                    />
                                </View>
                            </View>

                            {/* Source */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Source *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Monthly Salary, Freelance Project"
                                    value={incomeData.source}
                                    onChangeText={(text) => setIncomeData((prev) => ({ ...prev, source: text }))}
                                    maxLength={100}
                                    editable={!createIncomeMutation.isPending}
                                />
                                <Text style={styles.charCount}>{incomeData.source.length}/100</Text>
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
                                <Text style={styles.label}>Date (Optional)</Text>
                                <View style={styles.dateInputContainer}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                                    <TextInput
                                        style={styles.dateInput}
                                        value={incomeData.createdAt}
                                        onChangeText={(text) => setIncomeData((prev) => ({ ...prev, date: text }))}
                                        placeholder="YYYY-MM-DD"
                                        editable={!createIncomeMutation.isPending}
                                    />
                                </View>
                                <Text style={styles.dateHint}>Leave as is for today's date</Text>
                            </View>

                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        resetForm();
                                        setIsModalVisible(false);
                                    }}
                                    disabled={createIncomeMutation.isPending}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.submitButton,
                                        (!incomeData.amount || !incomeData.source || !incomeData.category || createIncomeMutation.isPending) &&
                                        styles.submitButtonDisabled,
                                    ]}
                                    onPress={handleAddIncome}
                                    disabled={
                                        createIncomeMutation.isPending ||
                                        !incomeData.amount ||
                                        !incomeData.source ||
                                        !incomeData.category
                                    }
                                >
                                    {createIncomeMutation.isPending ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Add Income</Text>
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
        salary: 'briefcase-outline',
        freelance: 'laptop-outline',
        investment: 'trending-up-outline',
        business: 'storefront-outline',
        gift: 'gift-outline',
        bonus: 'star-outline',
        other: 'cash-outline',
        default: 'cash-outline',
    };
    return icons[category?.toLowerCase()] || icons['default'];
};

const getCategoryColor = (category: string) => {
    const colors_map: { [key: string]: string } = {
        salary: '#4CAF50',
        freelance: '#2196F3',
        investment: '#9C27B0',
        business: '#FF9800',
        gift: '#E91E63',
        bonus: '#FFC107',
        other: '#607D8B',
        default: '#607D8B',
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text.primary,
    },
    placeholder: {
        width: 40,
    },
    totalCard: {
        backgroundColor: '#061e55',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    totalLabel: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: spacing.xs,
    },
    totalAmount: {
        fontSize: 40,
        fontWeight: fontWeight.bold,
        color: '#fff',
        marginBottom: spacing.xs,
    },
    totalSubtext: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    listTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    list: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        backgroundColor: colors.card,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        marginTop: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text.secondary,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: fontSize.sm,
        color: colors.text.light,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    incomeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    incomeIcon: {
        width: 44,
        height: 44,
        borderRadius: 22, // Perfect circle
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    incomeInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    incomeName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1C1E',
        marginBottom: 2,
    },
    incomeCategory: {
        fontSize: 13,
        color: '#64748B', // Muted Slate
        fontWeight: '500',
    },
    incomeDate: {
        fontSize: 12,
        color: '#94A3B8',
    },
    incomeAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#10B981',
        marginLeft: 8,
    },
    addButton: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.lg,
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: '#061e55',
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
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        maxHeight: '85%',
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
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text.primary,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
        color: colors.text.primary,
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
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.card,
        paddingHorizontal: spacing.md,
    },
    currencySymbol: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginRight: spacing.sm,
        color: colors.income,
    },
    amountInput: {
        flex: 1,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        borderWidth: 0,
        padding: spacing.md,
    },
    charCount: {
        fontSize: fontSize.xs,
        color: colors.text.light,
        marginTop: spacing.xs,
        textAlign: 'right',
    },
    categoriesContainer: {
        paddingVertical: spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dot: {
        fontSize: 13,
        color: '#CBD5E1',
        marginHorizontal: 4,
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
        backgroundColor: colors.income,
        borderColor: colors.income,
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
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.card,
        paddingHorizontal: spacing.md,
    },
    dateInput: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.text.primary,
        padding: spacing.md,
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
        gap: spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    cancelButton: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        color: colors.text.secondary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    submitButton: {
        backgroundColor: colors.income,
    },
    submitButtonDisabled: {
        backgroundColor: colors.text.light,
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
});