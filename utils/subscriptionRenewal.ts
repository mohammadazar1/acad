import { Player } from '../types';
import { getAllPlayers, storePlayer } from './storage';

export const renewSubscriptions = async (academyId: number) => {
  const players = await getAllPlayers(academyId);
  const currentDate = new Date();
  
  for (const player of players) {
    if (player.autoRenew && player.isActive) {
      const lastPaymentDate = new Date(player.lastPaymentDate);
      const monthsSinceLastPayment = (currentDate.getFullYear() - lastPaymentDate.getFullYear()) * 12 + 
                                     (currentDate.getMonth() - lastPaymentDate.getMonth());
      
      if (monthsSinceLastPayment >= 1) {
        const newPayment = {
          id: Date.now(),
          amount: player.subscriptionPrice,
          date: currentDate.toISOString().split('T')[0]
        };
        
        player.payments.push(newPayment);
        player.lastPaymentDate = newPayment.date;
        
        await storePlayer(player);
      }
    }
  }
};

// Function to run subscription renewal periodically
export const scheduleSubscriptionRenewal = (academyId: number) => {
  // Run renewal every day at midnight
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // tomorrow
    0, 0, 0 // at 00:00:00
  );
  const timeToMidnight = night.getTime() - now.getTime();

  setTimeout(() => {
    renewSubscriptions(academyId);
    // Schedule the next run
    scheduleSubscriptionRenewal(academyId);
  }, timeToMidnight);
};

// Call this function when the app starts or when an academy logs in
// scheduleSubscriptionRenewal(academyId);

