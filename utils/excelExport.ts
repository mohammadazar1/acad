import * as XLSX from 'xlsx';
import { Player, Expense, CoachSalary } from '../types';
import { calculatePlayerFinances } from './subscriptionCalculator';

export const exportToExcel = (players: Player[], expenses: Expense[], coachSalaries: CoachSalary[], year: number) => {
  const workbook = XLSX.utils.book_new();

  // Players worksheet
  const playersData = players.map(player => {
    const { totalDue, totalPaid, remainingDue } = calculatePlayerFinances(player);
    return {
      'اسم اللاعب': player.name,
      'العمر': player.age,
      'الرياضة': player.sport,
      'نوع الاشتراك': player.subscription === 'monthly' ? 'شهري' : 'سنوي',
      'سعر الاشتراك': player.subscriptionPrice,
      'المبلغ المستحق': totalDue,
      'المبلغ المدفوع': totalPaid,
      'المبلغ المتبقي': remainingDue,
      'الحالة': player.isActive ? 'نشط' : 'غير نشط'
    };
  });
  const playersSheet = XLSX.utils.json_to_sheet(playersData);
  XLSX.utils.book_append_sheet(workbook, playersSheet, 'اللاعبين');

  // Expenses worksheet
  const expensesData = [
    ...expenses.map(expense => ({
      'الوصف': expense.description,
      'المبلغ': expense.amount,
      'التاريخ': new Date(expense.date).toLocaleDateString('ar-EG')
    })),
    ...coachSalaries.map(salary => ({
      'الوصف': `راتب المدرب - ${salary.coach_name || 'غير معروف'}`,
      'المبلغ': salary.amount,
      'التاريخ': new Date(salary.payment_date).toLocaleDateString('ar-EG')
    }))
  ];
  const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'النفقات');

  // Financial summary worksheet
  const totalIncome = players.reduce((sum, player) => {
    const { totalPaid } = calculatePlayerFinances(player);
    return sum + totalPaid;
  }, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) +
                        coachSalaries.reduce((sum, salary) => sum + salary.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const summaryData = [
    { 'البند': 'إجمالي الدخل', 'القيمة': totalIncome },
    { 'البند': 'إجمالي النفقات', 'القيمة': totalExpenses },
    { 'البند': 'صافي الدخل', 'القيمة': netIncome }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص المالي');

  // Generate Excel file
  XLSX.writeFile(workbook, `التقرير_المالي_${year}.xlsx`);
};

