import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Player, Expense, CoachSalary } from '../types';
import { calculatePlayerFinances } from './subscriptionCalculator';
import notoKufiArabicFont from './NotoKufiArabic-Regular-base64';
import * as XLSX from 'xlsx';

const addFontToDoc = (doc: jsPDF) => {
  doc.addFileToVFS('NotoKufiArabic-Regular.ttf', notoKufiArabicFont);
  doc.addFont('NotoKufiArabic-Regular.ttf', 'NotoKufiArabic', 'normal');
  doc.setFont('NotoKufiArabic');
};

export const exportToPDF = (players: Player[], expenses: Expense[], coachSalaries: CoachSalary[], year: number) => {
  const doc = new jsPDF();
  addFontToDoc(doc);

  // Title
  doc.setFontSize(18);
  doc.text(`التقرير المالي لعام ${year}`, 200, 10, { align: 'right' });

  // Players list
  doc.setFontSize(14);
  doc.text('قائمة اللاعبين', 200, 20, { align: 'right' });

  const playersTableData = players.map(player => {
    const { totalDue, totalPaid, remainingDue } = calculatePlayerFinances(player);
    return [
      player.name,
      player.subscription === 'monthly' ? 'شهري' : 'سنوي',
      `${player.subscriptionPrice}`,
      `${totalDue.toFixed(2)}`,
      `${totalPaid.toFixed(2)}`,
      `${remainingDue.toFixed(2)}`,
      player.isActive ? 'نشط' : 'غير نشط'
    ];
  });

  (doc as any).autoTable({
    startY: 25,
    head: [[
      'اسم اللاعب',
      'نوع الاشتراك',
      'سعر الاشتراك',
      'المبلغ المستحق',
      'المبلغ المدفوع',
      'المبلغ المتبقي',
      'الحالة'
    ]],
    body: playersTableData,
    theme: 'grid',
    styles: { font: 'NotoKufiArabic', halign: 'right' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // Expenses details
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('تفاصيل النفقات', 200, currentY, { align: 'right' });

  const expensesTableData = [
    ...expenses.map(expense => [
      expense.description,
      `${expense.amount.toFixed(2)}`,
      new Date(expense.date).toLocaleDateString('ar-EG')
    ]),
    ...coachSalaries.map(salary => [
      `راتب المدرب - ${salary.coach_name || 'غير معروف'}`,
      `${salary.amount.toFixed(2)}`,
      new Date(salary.payment_date).toLocaleDateString('ar-EG')
    ])
  ];

  (doc as any).autoTable({
    startY: currentY + 5,
    head: [['الوصف', 'المبلغ', 'التاريخ']],
    body: expensesTableData,
    theme: 'grid',
    styles: { font: 'NotoKufiArabic', halign: 'right' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // Financial summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('الملخص المالي', 200, finalY, { align: 'right' });

  const totalIncome = players.reduce((sum, player) => {
    const { totalPaid } = calculatePlayerFinances(player);
    return sum + totalPaid;
  }, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) +
                        coachSalaries.reduce((sum, salary) => sum + salary.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  doc.setFontSize(12);
  doc.text(`إجمالي الدخل: ${totalIncome.toFixed(2)} شيكل`, 200, finalY + 10, { align: 'right' });
  doc.text(`إجمالي النفقات: ${totalExpenses.toFixed(2)} شيكل`, 200, finalY + 20, { align: 'right' });
  doc.text(`صافي الدخل: ${netIncome.toFixed(2)} شيكل`, 200, finalY + 30, { align: 'right' });

  // Save the file
  doc.save(`financial_report_${year}.pdf`);
};

export const exportPlayerReportToExcel = (player: Player) => {
  // إنشاء بيانات التقرير
  const reportData = [
    ['اسم اللاعب', player.name],
    ['العمر', player.age],
    ['الرياضة', player.sport],
    ['نوع الاشتراك', player.subscription],
    ['سعر الاشتراك', player.subscriptionPrice],
    ['تاريخ البدء', player.startDate],
    ['الحالة', player.isActive ? 'نشط' : 'غير نشط'],
    ['تجديد تلقائي', player.autoRenew ? 'نعم' : 'لا'],
    ['آخر دفعة', player.lastPaymentDate],
    ['', ''],
    ['تاريخ الدفعة', 'المبلغ'],
    ...player.payments.map((payment: any) => [payment.date, payment.amount]),
  ];

  // إنشاء ورقة عمل Excel
  const ws = XLSX.utils.aoa_to_sheet(reportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير اللاعب');

  // تحويل المصنف إلى ثنائي
  const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

  // تحويل إلى Blob
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

  // إنشاء رابط التنزيل
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `تقرير_${player.name.replace(' ', '_')}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// تحويل السلسلة إلى ArrayBuffer
function s2ab(s: string) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

