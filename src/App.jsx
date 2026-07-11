import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Layouts
import MainLayoutAdmin from './layouts/MainLayoutAdmin';
import MainLayoutMedecin from './layouts/MainLayoutMedecin';
import MainLayoutPatient from './layouts/MainLayoutPatient';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import CreatePatient from './pages/admin/CreatePatient';
import PatientList from './pages/admin/PatientList';
import SubscriptionManagement from './pages/admin/SubscriptionManagement';
import NotificationsAdmin from './pages/admin/NotificationsAdmin';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import AuditLogs from './pages/admin/AuditLogs';
import NewsletterManager from './pages/admin/NewsletterManager';
import SettingsClinic from './pages/admin/SettingsClinic';

// Medecin
import DoctorDashboard from './pages/medecin/DoctorDashboard';
import PatientListMedecin from './pages/medecin/PatientListMedecin';
import PatientDetailMedecin from './pages/medecin/PatientDetailMedecin';
import DocumentsPage from './pages/medecin/DocumentsPage';
import AppointmentsPage from './pages/medecin/AppointmentsPage';
import PrescriptionsPage from './pages/medecin/PrescriptionsPage';
import ClinicalDecision from './pages/medecin/ClinicalDecision';
import DrugInteractions from './pages/medecin/DrugInteractions';
import WaitingRoomManagement from './pages/medecin/WaitingRoomManagement';
import MessagesPage from './pages/shared/MessagesPage';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import DossierMedical from './pages/patient/DossierMedical';
import DocumentsPatient from './pages/patient/DocumentsPatient';
import AppointmentsPatient from './pages/patient/AppointmentsPatient';
import PrescriptionsPatient from './pages/patient/PrescriptionsPatient';
import SubscriptionPage from './pages/patient/SubscriptionPage';
import HealthJournal from './pages/patient/HealthJournal';
import NotificationsPatient from './pages/patient/NotificationsPatient';
import GamificationPage from './pages/patient/GamificationPage';
import HealthCalendarPage from './pages/patient/HealthCalendarPage';
import HealthCoaching from './pages/patient/HealthCoaching';
import WaitingRoomView from './pages/patient/WaitingRoomView';

function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-dark-text">Chargement de MedCare AI...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = { admin: '/admin', medecin: '/medecin', patient: '/patient' };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><MainLayoutAdmin /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="create-patient" element={<CreatePatient />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="subscriptions" element={<SubscriptionManagement />} />
          <Route path="notifications" element={<NotificationsAdmin />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="newsletters" element={<NewsletterManager />} />
          <Route path="settings" element={<SettingsClinic />} />
        </Route>

        <Route path="/medecin" element={<ProtectedRoute allowedRoles={['medecin']}><MainLayoutMedecin /></ProtectedRoute>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<PatientListMedecin />} />
          <Route path="patients/:id" element={<PatientDetailMedecin />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="clinical-decision" element={<ClinicalDecision />} />
          <Route path="drug-interactions" element={<DrugInteractions />} />
          <Route path="waiting-room" element={<WaitingRoomManagement />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><MainLayoutPatient /></ProtectedRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="dossier" element={<DossierMedical />} />
          <Route path="documents" element={<DocumentsPatient />} />
          <Route path="appointments" element={<AppointmentsPatient />} />
          <Route path="prescriptions" element={<PrescriptionsPatient />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="journal" element={<HealthJournal />} />
          <Route path="notifications" element={<NotificationsPatient />} />
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="health-calendar" element={<HealthCalendarPage />} />
          <Route path="coaching" element={<HealthCoaching />} />
          <Route path="waiting-room" element={<WaitingRoomView />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
