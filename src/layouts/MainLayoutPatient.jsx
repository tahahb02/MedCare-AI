import SidebarPatient from '../components/SidebarPatient';
import MainLayoutShell from './MainLayoutShell';

export default function MainLayoutPatient() {
  return <MainLayoutShell SidebarComponent={SidebarPatient} />;
}
