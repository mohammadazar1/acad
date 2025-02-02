import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Academy } from '../types';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [currentAcademy, setCurrentAcademy] = useState<Academy | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const academyJson = await AsyncStorage.getItem('currentAcademy');
      if (academyJson) {
        const academy = JSON.parse(academyJson);
        setCurrentAcademy(academy);
        const expensesJson = await AsyncStorage.getItem(`expenses_${academy.id}`);
        if (expensesJson) setExpenses(JSON.parse(expensesJson));
      }
    };
    fetchData();
  }, []);

  const addExpense = async () => {
    if (!currentAcademy) return;
    if (newExpense.description.trim() === '' || newExpense.amount.trim() === '') {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }
    const expense: Expense = {
      id: Date.now(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString().split('T')[0],
      academyId: currentAcademy.id,
    };
    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);
    await AsyncStorage.setItem(`expenses_${currentAcademy.id}`, JSON.stringify(updatedExpenses));
    setNewExpense({ description: '', amount: '' });
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseDescription}>{item.description}</Text>
      <Text style={styles.expenseAmount}>{item.amount} ريال</Text>
      <Text style={styles.expenseDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إدارة المصروفات</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="وصف المصروف"
          value={newExpense.description}
          onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="المبلغ"
          value={newExpense.amount}
          onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.addButtonText}>إضافة مصروف</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
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
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  expenseAmount: {
    fontSize: 14,
    color: '#666',
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
});

