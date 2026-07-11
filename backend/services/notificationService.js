import Notification from '../models/Notification.js';

export const createNotification = async ({ userId, senderId, senderRole, category, type, title, message, data, priority, quickActions, scheduledFor }) => {
  return Notification.create({
    userId, senderId, senderRole, category, type, title, message,
    data: data || {}, priority: priority || 'medium',
    quickActions: quickActions || [], scheduledFor
  });
};

export const notifyNewAppointment = async (patientId, doctorName, date) => {
  return createNotification({
    userId: patientId, senderRole: 'medecin', category: 'médicale', type: 'rendez-vous',
    title: 'Nouveau rendez-vous', message: `${doctorName} vous a programmé un rendez-vous le ${new Date(date).toLocaleDateString('fr-FR')}`,
    priority: 'medium'
  });
};

export const notifyDocumentReady = async (patientId, documentName) => {
  return createNotification({
    userId: patientId, senderRole: 'medecin', category: 'médicale', type: 'analyse_prête',
    title: 'Analyse prête', message: `Votre document "${documentName}" a été analysé par le médecin.`,
    priority: 'medium'
  });
};

export const notifyNewPatient = async (doctorId, patientName) => {
  return createNotification({
    userId: doctorId, senderRole: 'admin', category: 'administrative', type: 'nouveau_patient',
    title: 'Nouveau patient assigné', message: `${patientName} a été assigné(e) à votre patientèle.`,
    priority: 'medium'
  });
};

export const notifyReminderCabinet = async (patientId, doctorName, date) => {
  return createNotification({
    userId: patientId, senderRole: 'medecin', category: 'médicale', type: 'rappel_cabinet',
    title: 'Rappel cabinet', message: `${doctorName} vous demande de vous présenter au cabinet le ${date}`,
    priority: 'high'
  });
};
