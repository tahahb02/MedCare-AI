import mongoose from 'mongoose';
import User from './models/User.js';
import PatientProfile from './models/PatientProfile.js';
import DoctorProfile from './models/DoctorProfile.js';
import AdminProfile from './models/AdminProfile.js';
import Subscription from './models/Subscription.js';
import Appointment from './models/Appointment.js';
import MedicalDocument from './models/MedicalDocument.js';
import Prescription from './models/Prescription.js';
import Notification from './models/Notification.js';
import { Conversation, Message } from './models/Conversation.js';
import SymptomLog from './models/SymptomLog.js';
import GamificationProfile from './models/GamificationProfile.js';
import HealthScoreLog from './models/HealthScoreLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medcare';

const hashPassword = async (pw) => await bcrypt.hash(pw, 12);

export async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected. Seeding database...');

  await User.deleteMany({});
  await PatientProfile.deleteMany({});
  await DoctorProfile.deleteMany({});
  await AdminProfile.deleteMany({});
  await Subscription.deleteMany({});
  await Appointment.deleteMany({});
  await MedicalDocument.deleteMany({});
  await Prescription.deleteMany({});
  await Notification.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});
  await SymptomLog.deleteMany({});
  await GamificationProfile.deleteMany({});
  await HealthScoreLog.deleteMany({});

  const pw = 'MedCare2024!';

  // === ADMIN ===
  const admin = await User.create({
    name: 'Sarah Benali', email: 'admin@medcare.com', phone: '+212 6 12 34 56 78',
    password: pw, role: 'admin', isVerified: true, isActive: true
  });
  const adminProfile = await AdminProfile.create({
    userId: admin._id, employeeId: 'EMP-0001', position: 'super_admin', department: 'Administration',
    permissions: { patientManagement: true, subscriptionManagement: true, doctorManagement: true, billingAccess: true, analyticsAccess: true, notificationSend: true, systemSettings: true, auditLogAccess: true, newsletterManagement: true }
  });
  console.log('Admin created: admin@medcare.com / MedCare2024!');

  // === DOCTORS ===
  const doc1 = await User.create({
    name: 'Dr. Ahmed El Fassi', email: 'dr.fassi@medcare.com', phone: '+212 6 23 45 67 89',
    password: pw, role: 'medecin', isVerified: true, isActive: true
  });
  const doc1Profile = await DoctorProfile.create({
    userId: doc1._id, specializations: [{ name: 'Cardiologie', yearsExperience: 15, isPrimary: true }, { name: 'Médecine interne', yearsExperience: 10, isPrimary: false }],
    licenseNumber: 'MED-2015-001', hospital: 'Clinique MedCare Rabat', clinicAddress: 'Av. Hassan II, Rabat',
    consultationFee: 350, currency: 'MAD', rating: 4.8, ratingsCount: 203,
    totalConsultations: 1850, totalPatients: 120, verified: true,
    languages: ['Français', 'Arabe', 'Anglais'], bio: 'Cardiologue senior avec 15 ans d\'expérience en cardiologie interventionnelle.',
    currentStatus: 'disponible', slotDuration: 30,
    workingHours: { monday: { start: '08:00', end: '17:00' }, tuesday: { start: '08:00', end: '17:00' }, wednesday: { start: '08:00', end: '13:00' }, thursday: { start: '08:00', end: '17:00' }, friday: { start: '08:00', end: '12:00' }, saturday: { start: '09:00', end: '12:00' }, sunday: { start: '', end: '' } }
  });

  const doc2 = await User.create({
    name: 'Dr. Fatima Ouazzani', email: 'dr.ouazzani@medcare.com', phone: '+212 6 34 56 78 90',
    password: pw, role: 'medecin', isVerified: true, isActive: true
  });
  const doc2Profile = await DoctorProfile.create({
    userId: doc2._id, specializations: [{ name: 'Diabétologie', yearsExperience: 12, isPrimary: true }],
    licenseNumber: 'MED-2018-002', hospital: 'Clinique MedCare Casablanca',
    consultationFee: 300, currency: 'MAD', rating: 4.6, ratingsCount: 145,
    totalConsultations: 1200, totalPatients: 85, verified: true,
    languages: ['Français', 'Arabe'], bio: 'Diabétologue spécialisée dans la prise en charge du diabète de type 2.',
    currentStatus: 'en_consultation', slotDuration: 30
  });
  console.log('Doctors created: dr.fassi@medcare.com & dr.ouazzani@medcare.com / MedCare2024!');

  // === PATIENTS ===
  const patientsData = [
    { name: 'Mohammed Alami', email: 'mohammed@medcare.com', phone: '+212 6 45 67 89 01', dob: '1978-03-22', gender: 'homme', blood: 'A+', city: 'Rabat' },
    { name: 'Fatima Zahra Tazi', email: 'fatima@medcare.com', phone: '+212 6 56 78 90 12', dob: '1985-06-15', gender: 'femme', blood: 'O+', city: 'Casablanca' },
    { name: 'Youssef Benkirane', email: 'youssef@medcare.com', phone: '+212 6 67 89 01 23', dob: '1990-11-08', gender: 'homme', blood: 'B+', city: 'Fès' },
    { name: 'Amina Bennis', email: 'amina@medcare.com', phone: '+212 6 78 90 12 34', dob: '1972-01-30', gender: 'femme', blood: 'AB+', city: 'Marrakech' },
    { name: 'Omar Fassi-Fihri', email: 'omar@medcare.com', phone: '+212 6 89 01 23 45', dob: '1995-08-19', gender: 'homme', blood: 'A-', city: 'Tanger' },
    { name: 'Khadija Alaoui', email: 'khadija@medcare.com', phone: '+212 6 90 12 34 56', dob: '1980-04-05', gender: 'femme', blood: 'O-', city: 'Meknès' },
    { name: 'Karim Idrissi', email: 'karim@medcare.com', phone: '+212 6 01 23 45 67', dob: '1988-12-12', gender: 'homme', blood: 'B-', city: 'Agadir' },
    { name: 'Nadia Chraibi', email: 'nadia@medcare.com', phone: '+212 6 11 22 33 44', dob: '1975-07-25', gender: 'femme', blood: 'A+', city: 'Rabat' },
  ];

  const patientUsers = [];
  const patientProfiles = [];

  for (const pd of patientsData) {
    const u = await User.create({
      name: pd.name, email: pd.email, phone: pd.phone,
      password: pw, role: 'patient', isVerified: true, isActive: true
    });
    patientUsers.push(u);

    const pp = await PatientProfile.create({
      userId: u._id, medicalRecordNumber: `MED-2024-${String(patientUsers.length).padStart(4, '0')}`,
      dateOfBirth: new Date(pd.dob), gender: pd.gender, bloodType: pd.blood,
      city: pd.city, address: `${pd.city}, Maroc`,
      primaryDoctorId: doc1._id, createdBy: admin._id,
      height: 160 + Math.floor(Math.random() * 25),
      weight: 60 + Math.floor(Math.random() * 30),
      smokingStatus: 'non', alcoholConsumption: 'occasionnel',
      physicalActivityLevel: 'modéré', activityFrequency: 3,
      allergies: pd.gender === 'femme' ? [{ name: 'Pénicilline', severity: 'modérée', reaction: 'Éruption cutanée' }] : [],
      chronicConditions: pd.name.includes('Mohammed') ? [{ name: 'Hypertension', diagnosedDate: new Date('2020-01-15'), status: 'contrôlé', treatment: 'Amlodipine 5mg' }] : [],
      bloodPressureHistory: [
        { systolic: 120 + Math.floor(Math.random() * 20), diastolic: 75 + Math.floor(Math.random() * 15), date: new Date('2024-10-01') },
        { systolic: 118 + Math.floor(Math.random() * 20), diastolic: 73 + Math.floor(Math.random() * 15), date: new Date('2024-11-01') },
        { systolic: 115 + Math.floor(Math.random() * 20), diastolic: 72 + Math.floor(Math.random() * 15), date: new Date('2024-12-01') },
      ],
      weightHistory: [
        { weight: 70 + Math.floor(Math.random() * 15), date: new Date('2024-09-01') },
        { weight: 69 + Math.floor(Math.random() * 15), date: new Date('2024-10-01') },
        { weight: 68 + Math.floor(Math.random() * 15), date: new Date('2024-11-01') },
        { weight: 67 + Math.floor(Math.random() * 15), date: new Date('2024-12-01') },
      ],
      consents: { dataProcessing: true, dataProcessingDate: new Date(), marketingConsent: false }
    });
    patientProfiles.push(pp);
  }
  console.log(`${patientsData.length} patients created / MedCare2024!`);

  // === SUBSCRIPTIONS ===
  const plans = ['mensuel', 'trimestriel', 'semestre', 'annuel'];
  const amounts = { mensuel: 200, trimestriel: 500, semestre: 900, annuel: 1500 };
  for (let i = 0; i < patientUsers.length; i++) {
    const plan = plans[i % plans.length];
    const start = new Date();
    start.setDate(start.getDate() - (30 * (i + 1)));
    const end = new Date(start);
    if (plan === 'mensuel') end.setDate(end.getDate() + 30);
    else if (plan === 'trimestriel') end.setDate(end.getDate() + 90);
    else if (plan === 'semestre') end.setDate(end.getDate() + 180);
    else end.setDate(end.getDate() + 365);

    await Subscription.create({
      patientId: patientUsers[i]._id, planType: plan,
      status: i < 6 ? 'actif' : (i === 6 ? 'expiré' : 'en_période_de_grâce'),
      startDate: start, endDate: end, nextPaymentDate: end,
      amount: amounts[plan], currency: 'MAD', paymentMethod: 'especes',
      createdBy: admin._id
    });
  }
  console.log('Subscriptions created');

  // === APPOINTMENTS ===
  const types = ['consultation', 'suivi', 'téléconsultation', 'bilan'];
  const urgencies = ['routine', 'normal', 'urgent', 'très_urgent'];
  const statuses = ['en_attente', 'confirmé', 'terminé', 'annulé'];
  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    date.setHours(8 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 4) * 15, 0, 0);
    const endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 30);

    await Appointment.create({
      patientId: patientUsers[i % patientUsers.length]._id,
      doctorId: i % 3 === 0 ? doc2._id : doc1._id,
      date, endDate, duration: 30,
      type: types[i % types.length],
      urgencyDegree: urgencies[i % urgencies.length],
      status: i < 14 ? 'terminé' : statuses[i % statuses.length],
      reason: ['Douleur thoracique', 'Contrôle tension', 'Suivi diabète', 'Bilan sanguin', 'Consultation générale', 'Résultats analyses'][i % 6],
      location: 'cabinet'
    });
  }
  console.log('Appointments created');

  // === PRESCRIPTIONS ===
  const meds = [
    { name: 'Amlodipine', genericName: 'Amlodipine', dosage: '5', unit: 'mg', frequency: '1 fois/jour', route: 'oral' },
    { name: 'Metformine', genericName: 'Metformine', dosage: '500', unit: 'mg', frequency: '2 fois/jour', route: 'oral' },
    { name: 'Levothyrox', genericName: 'Lévothyroxine', dosage: '75', unit: 'µg', frequency: '1 fois/jour', route: 'oral' },
    { name: 'Doliprane', genericName: 'Paracétamol', dosage: '1000', unit: 'mg', frequency: '3 fois/jour', route: 'oral' },
    { name: 'Aspégic', genericName: 'Acide acétylsalicylique', dosage: '75', unit: 'mg', frequency: '1 fois/jour', route: 'oral' },
  ];

  for (let i = 0; i < 8; i++) {
    const patientIdx = i % patientUsers.length;
    await Prescription.create({
      patientId: patientUsers[patientIdx]._id,
      doctorId: i % 3 === 0 ? doc2._id : doc1._id,
      medications: [{ ...meds[i % meds.length], instructions: 'À prendre pendant le repas', withFood: true, beforeOrAfterMeal: 'indifférent', duration: 30, startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000) }],
      diagnosis: ['Hypertension artérielle', 'Diabète de type 2', 'Hypothyroïdie', 'Céphalées', 'Prévention cardiovasculaire'][i % 5],
      notes: 'Traitement à suivre régulièrement. Contrôle dans 1 mois.',
      status: 'active', validUntil: new Date(Date.now() + 90 * 86400000),
      signedAt: new Date(), signedBy: i % 3 === 0 ? doc2._id : doc1._id
    });
  }
  console.log('Prescriptions created');

  // === NOTIFICATIONS ===
  for (let i = 0; i < 5; i++) {
    await Notification.create({
      userId: patientUsers[i]._id, senderId: admin._id, senderRole: 'admin',
      category: 'administrative', type: 'rappel_abonnement',
      title: 'Rappel abonnement', message: `Bonjour ${patientUsers[i].name}, votre abonnement arrive à échéance. Merci de le renouveler.`,
      priority: 'medium', read: i > 2
    });
  }
  for (let i = 0; i < 3; i++) {
    await Notification.create({
      userId: patientUsers[i]._id, senderId: doc1._id, senderRole: 'medecin',
      category: 'médicale', type: 'rendez-vous',
      title: 'Rappel rendez-vous', message: `Dr. El Fassi vous rappelle votre prochain rendez-vous.`,
      priority: 'high', read: false
    });
  }
  console.log('Notifications created');

  // === MESSAGES ===
  const conv = await Conversation.create({
    participants: [{ userId: patientUsers[0]._id, role: 'patient' }, { userId: doc1._id, role: 'medecin' }],
    type: 'privée', lastMessage: { content: 'Merci Docteur', senderId: patientUsers[0]._id, timestamp: new Date() },
    unreadCount: { patient: 0, medecin: 1 }
  });
  const msgs = [
    { senderId: doc1._id, senderRole: 'medecin', content: 'Bonjour Mohammed, comment allez-vous depuis la dernière consultation ?' },
    { senderId: patientUsers[0]._id, senderRole: 'patient', content: 'Bonjour Docteur, je vais mieux. La tension est plus stable.' },
    { senderId: doc1._id, senderRole: 'medecin', content: 'Très bien ! Continuez le traitement. Prenez vos mesures quotidiennes.' },
    { senderId: patientUsers[0]._id, senderRole: 'patient', content: 'Merci Docteur' },
  ];
  for (const m of msgs) {
    await Message.create({ conversationId: conv._id, ...m, contentType: 'text', readBy: [{ userId: m.senderId, readAt: new Date() }] });
  }
  console.log('Messages created');

  // === GAMIFICATION ===
  for (let i = 0; i < patientUsers.length; i++) {
    await GamificationProfile.create({
      userId: patientUsers[i]._id,
      points: Math.floor(Math.random() * 2000) + 100,
      level: Math.floor(Math.random() * 4) + 1,
      badges: [
        { badgeId: 'first_login', earnedAt: new Date(), name: 'Premier pas', description: 'Première connexion', icon: '🎯' },
        ...(i > 2 ? [{ badgeId: 'streak_7', earnedAt: new Date(), name: 'Série de 7 jours', description: '7 jours consécutifs', icon: '🔥' }] : []),
      ],
      streak: { currentDays: Math.floor(Math.random() * 14), longestDays: Math.floor(Math.random() * 30) + 5, lastLogDate: new Date() }
    });
  }
  console.log('Gamification profiles created');

  // === HEALTH SCORES ===
  for (let i = 0; i < patientUsers.length; i++) {
    for (let j = 0; j < 8; j++) {
      const d = new Date();
      d.setDate(d.getDate() - (j * 7));
      await HealthScoreLog.create({
        patientId: patientUsers[i]._id,
        date: d, score: 50 + Math.floor(Math.random() * 40),
        components: [
          { name: 'activité_physique', weight: 25, score: 40 + Math.floor(Math.random() * 50) },
          { name: 'sommeil', weight: 20, score: 50 + Math.floor(Math.random() * 40) },
          { name: 'humeur', weight: 20, score: 60 + Math.floor(Math.random() * 35) },
          { name: 'adhérence_médicaments', weight: 20, score: 70 + Math.floor(Math.random() * 30) },
          { name: 'fréquence_symptômes', weight: 15, score: 30 + Math.floor(Math.random() * 60) },
        ],
        calculatedAt: d, period: 'weekly'
      });
    }
  }
  console.log('Health scores created');

  // === SYMPTOM LOGS ===
  for (let i = 0; i < Math.min(5, patientUsers.length); i++) {
    for (let j = 0; j < 10; j++) {
      const d = new Date();
      d.setDate(d.getDate() - j);
      await SymptomLog.create({
        patientId: patientUsers[i]._id, date: d,
        quickLog: { mood: 3 + Math.floor(Math.random() * 3), painLevel: Math.floor(Math.random() * 6), energyLevel: 2 + Math.floor(Math.random() * 4) },
        sleepHours: 6 + Math.floor(Math.random() * 3), sleepQuality: 3 + Math.floor(Math.random() * 3),
        waterIntake: 4 + Math.floor(Math.random() * 5), meals: 3,
        stressLevel: 1 + Math.floor(Math.random() * 4),
        notes: j % 3 === 0 ? 'Bonne journée' : ''
      });
    }
  }
  console.log('Symptom logs created');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 LOGIN CREDENTIALS (all passwords: MedCare2024!)');
  console.log('─'.repeat(55));
  console.log('  Admin/Secrétaire : admin@medcare.com');
  console.log('  Médecin 1        : dr.fassi@medcare.com');
  console.log('  Médecin 2        : dr.ouazzani@medcare.com');
  console.log('  Patient 1        : mohammed@medcare.com');
  console.log('  Patient 2        : fatima@medcare.com');
  console.log('  Patient 3        : youssef@medcare.com');
  console.log('  Patient 4        : amina@medcare.com');
  console.log('  Patient 5        : omar@medcare.com');
  console.log('  Patient 6        : khadija@medcare.com');
  console.log('  Patient 7        : karim@medcare.com');
  console.log('  Patient 8        : nadia@medcare.com');
  console.log('─'.repeat(55));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
