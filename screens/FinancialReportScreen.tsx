import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player, Expense, Academy } from '../types';
import { exportToExcel } from '../utils/excelExport';

export default function FinancialReportScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentAcademy, setCurrentAcademy] = useState<Academy | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const academyJson = await AsyncStorage.getItem('currentAcademy');
      if (academyJson) {
        const academy = JSON.parse(academyJson);
        setCurrentAcademy(academy);
        const playersJson = await AsyncStorage.getItem(`players_${academy.id}`);
        const expensesJson = await AsyncStorage.getItem(`expenses_${academy.id}`);
        if (playersJson) setPlayers(JSON.parse(playersJson));
        if (expensesJson) setExpenses(JSON.parse(expensesJson));
      }
    };
    fetchData();
  }, []);

  const calculateTotalPaid = (payments: Payment[]) => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const calculateRemainingAmount = (subscriptionPrice: number, payments: Payment[]) => {
    const totalPaid = calculateTotalPaid(payments);
    return Math.max(subscriptionPrice - totalPaid, 0);
  };

  const totalIncome = players.reduce((sum, player) => sum + calculateTotalPaid(player.payments), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const handleExportToExcel = async () => {
    try {
      if (currentAcademy) {
        await exportToExcel(players, expenses, currentAcademy.name);
        Alert.alert('نجاح', 'تم تصدير التقرير بنجاح!');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير التقرير');
    }
  };

  const getOverduePlayers = () => {
    const currentDate = new Date();
    return players.filter(player => {
      if (!player.lastPaymentDate) return true;
      const lastPayment = new Date(player.lastPaymentDate);
      const daysSinceLastPayment = Math.floor((currentDate.getTime() - lastPayment.getTime()) / (1000 * 3600 * 24));
      return (player.subscription === 'شهري' && daysSinceLastPayment > 30) ||
             (player.subscription === 'ربع سنوي' && daysSinceLastPayment > 90) ||
             (player.subscription === 'سنوي' && daysSinceLastPayment > 365);
    });
  };

  const overduePlayers = getOverduePlayers();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>التقرير المالي</Text>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>إجمالي الدخل: {totalIncome} ريال</Text>
        <Text style={styles.summaryText}>إجمالي النفقات: {totalExpenses} ريال</Text>
        <Text style={styles.summaryText}>صافي الدخل: {netIncome} ريال</Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={handleExportToExcel}>
        <Text style={styles.exportButtonText}>تصدير إلى Excel</Text>
      </TouchableOpacity>

      {overduePlayers.length > 0 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>تحذير: لاعبون متأخرون في الدفع</Text>
          {overduePlayers.map(player => (
            <Text key={player.id} style={styles.warningText}>
              {player.name} - آخر دفعة: {player.lastPaymentDate || 'لم يتم الدفع'}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>قائمة اللاعبين</Text>
      {players.map(player => (
        <View key={player.id} style={styles.playerItem}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text>الاشتراك: {player.subscription}</Text>
          <Text>المبلغ المدفوع: {calculateTotalPaid(player.payments)} ريال</Text>
          <Text>المبلغ المتبقي: {calculateRemainingAmount(player.subscriptionPrice, player.payments)} ريال</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>قائمة المصروفات</Text>
      {expenses.map(expense => (
        <View key={expense.id} style={styles.expenseItem}>
          <Text style={styles.expenseDescription}>{expense.description}</Text>
          <Text>المبلغ: {expense.amount} ريال</Text>
          <Text>التاريخ: {expense.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: '#FFEB3B',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  playerItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

