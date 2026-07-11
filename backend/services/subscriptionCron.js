import Subscription from '../models/Subscription.js';
import Notification from '../models/Notification.js';
import { sendSubscriptionReminder } from '../utils/sendEmail.js';
import User from '../models/User.js';

export const runSubscriptionCron = async () => {
  const now = new Date();
  console.log(`[CRON] Running subscription check at ${now.toISOString()}`);

  try {
    // J-30 alerts
    const j30Date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const j30Subs = await Subscription.find({ status: 'actif', endDate: { $lte: j30Date, $gt: now }, 'alerts.j30Sent': false }).populate('patientId', 'name email');
    for (const sub of j30Subs) {
      if (sub.patientId) {
        await Notification.create({ userId: sub.patientId._id, senderRole: 'system', category: 'administrative', type: 'rappel_abonnement', title: 'Abonnement expire bientôt', message: `Votre abonnement expire le ${sub.endDate.toLocaleDateString('fr-FR')}`, priority: 'medium' });
        await sendSubscriptionReminder(sub.patientId.email, sub.patientId.name, 30, sub.endDate);
      }
      await Subscription.updateOne({ _id: sub._id }, { $set: { 'alerts.j30Sent': true } });
    }

    // J-15 alerts
    const j15Date = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const j15Subs = await Subscription.find({ status: 'actif', endDate: { $lte: j15Date, $gt: now }, 'alerts.j15Sent': false }).populate('patientId', 'name email');
    for (const sub of j15Subs) {
      if (sub.patientId) {
        await Notification.create({ userId: sub.patientId._id, senderRole: 'system', category: 'administrative', type: 'rappel_abonnement', title: 'RAPPEL: Abonnement expire dans 15 jours', message: `Votre abonnement expire le ${sub.endDate.toLocaleDateString('fr-FR')}. Renouvelez rapidement.`, priority: 'high' });
        await sendSubscriptionReminder(sub.patientId.email, sub.patientId.name, 15, sub.endDate);
      }
      await Subscription.updateOne({ _id: sub._id }, { $set: { 'alerts.j15Sent': true } });
    }

    // J-3 alerts
    const j3Date = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const j3Subs = await Subscription.find({ status: 'actif', endDate: { $lte: j3Date, $gt: now }, 'alerts.j3Sent': false }).populate('patientId', 'name email');
    for (const sub of j3Subs) {
      if (sub.patientId) {
        await Notification.create({ userId: sub.patientId._id, senderRole: 'system', category: 'administrative', type: 'rappel_abonnement', title: 'URGENT: Abonnement expire dans 3 jours!', message: `Votre abonnement expire le ${sub.endDate.toLocaleDateString('fr-FR')}. Renouvelez IMMÉDIATEMENT.`, priority: 'critical' });
        await sendSubscriptionReminder(sub.patientId.email, sub.patientId.name, 3, sub.endDate);
      }
      await Subscription.updateOne({ _id: sub._id }, { $set: { 'alerts.j3Sent': true } });
    }

    // J+0: Expired today
    const expiredSubs = await Subscription.find({ status: 'actif', endDate: { $lte: now }, 'alerts.j0Sent': false }).populate('patientId', 'name email');
    for (const sub of expiredSubs) {
      const newStatus = sub.gracePeriodDays > 0 ? 'en_période_de_grâce' : 'expiré';
      const update = { status: newStatus, 'alerts.j0Sent': true };
      if (sub.gracePeriodDays > 0) {
        update.gracePeriodEnd = new Date(now.getTime() + sub.gracePeriodDays * 24 * 60 * 60 * 1000);
      }
      await Subscription.updateOne({ _id: sub._id }, { $set: update });
      if (sub.patientId) {
        await Notification.create({ userId: sub.patientId._id, senderRole: 'system', category: 'administrative', type: 'rappel_abonnement', title: newStatus === 'expiré' ? 'Abonnement expiré' : 'Période de grâce activée', message: newStatus === 'expiré' ? 'Votre abonnement a expiré. Contactez la clinique.' : `Période de grâce jusqu'au ${update.gracePeriodEnd.toLocaleDateString('fr-FR')}.`, priority: 'critical' });
      }
    }

    // J+7: Grace period end
    const graceEndSubs = await Subscription.find({ status: 'en_période_de_grâce', gracePeriodEnd: { $lte: now }, 'alerts.j7Sent': false }).populate('patientId', 'name email');
    for (const sub of graceEndSubs) {
      await Subscription.updateOne({ _id: sub._id }, { $set: { status: 'suspendu', 'alerts.j7Sent': true } });
      if (sub.patientId) {
        await Notification.create({ userId: sub.patientId._id, senderRole: 'system', category: 'administrative', type: 'rappel_abonnement', title: 'Accès suspendu', message: 'Votre abonnement est maintenant suspendu. Contactez la clinique.', priority: 'critical' });
      }
    }

    console.log(`[CRON] Processed: J30=${j30Subs.length}, J15=${j15Subs.length}, J3=${j3Subs.length}, Expired=${expiredSubs.length}, GraceEnd=${graceEndSubs.length}`);
  } catch (error) {
    console.error('[CRON] Error:', error);
  }
};
