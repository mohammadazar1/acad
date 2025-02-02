import * as XLSX from 'xlsx';
import { Player, Payment } from '../types';

export const exportPlayerReport = (player: Player) => {
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
    ...player.payments.map((payment: Payment) => [payment.date, payment.amount]),
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

