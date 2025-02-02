import { differenceInDays, addDays, parseISO, addMonths, addYears } from 'date-fns';

export function calculateSubscriptionPeriods(createdAt: string, subscriptionPrice: number, subscription: string) {
  const start = parseISO(createdAt);
  const today = new Date();
  const periods = [];
  let currentDate = start;

  while (currentDate < today) {
    let endDate;
    let amount;

    if (subscription === 'monthly') {
      endDate = addMonths(currentDate, 1);
      amount = subscriptionPrice;
    } else { // yearly
      endDate = addYears(currentDate, 1);
      amount = subscriptionPrice;
    }

    if (endDate > today) {
      endDate = today;
      const daysInPeriod = differenceInDays(endDate, currentDate);
      const fullPeriodDays = subscription === 'monthly' ? 30 : 365;
      amount = (subscriptionPrice / fullPeriodDays) * daysInPeriod;
    }

    periods.push({
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      amount: Number(amount.toFixed(2))
    });

    currentDate = endDate;
  }

  return periods;
}

export function calculateTotalDue(createdAt: string, subscriptionPrice: number, paidAmount: number, subscription: string) {
  const periods = calculateSubscriptionPeriods(createdAt, subscriptionPrice, subscription);
  const totalDue = periods.reduce((sum, period) => sum + period.amount, 0);
  return Math.max(totalDue - paidAmount, 0);
}

interface Player {
  created_at: string;
  subscription: string;
  subscriptionPrice: number;
  payments?: { date: string; amount: number }[];
}

export function calculateSubscriptionForYear(player: Player, year: number) {
  const startDate = new Date(player.created_at);
  const endDate = new Date(year, 11, 31); // 31 December of the selected year
  
  if (startDate > endDate) {
    return 0; // Player joined after the selected year
  }

  const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1;
  
  if (player.subscription === 'monthly') {
    return Math.min(monthsDiff, 12) * player.subscriptionPrice;
  } else { // yearly
    return player.subscriptionPrice;
  }
}

export function calculatePlayerFinances(player: Player) {
  const startDate = new Date(player.created_at);
  const today = new Date();
  const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + today.getMonth() - startDate.getMonth();
  const monthsDue = Math.max(0, monthsDiff + 1); // +1 to include the current month

  const totalDue = player.subscription === 'monthly' 
    ? player.subscriptionPrice * monthsDue 
    : (player.subscriptionPrice / 12) * monthsDue;

  let remainingDue = totalDue;
  let paidMonths = 0;
  let totalPaid = 0;
  let totalDiscounts = 0;

  // Ensure payments is an array before sorting
  const payments = Array.isArray(player.payments) ? player.payments : [];

  // Sort payments by date
  const sortedPayments = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const payment of sortedPayments) {
    if (payment.amount < 0) {
      // This is a discount
      totalDiscounts += Math.abs(payment.amount);
      remainingDue -= Math.abs(payment.amount);
    } else {
      // This is a payment
      totalPaid += payment.amount;
      remainingDue -= payment.amount;
    }
    paidMonths = Math.floor((totalDue - remainingDue) / player.subscriptionPrice);
  }

  return {
    monthsDue,
    paidMonths,
    totalDue,
    totalPaid,
    totalDiscounts,
    remainingDue: Math.max(0, remainingDue),
  };
}

