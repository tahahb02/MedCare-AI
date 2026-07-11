import SidebarAdmin from '../components/SidebarAdmin';
import MainLayoutShell from './MainLayoutShell';

export default function MainLayoutAdmin() {
  return <MainLayoutShell SidebarComponent={SidebarAdmin} />;
}
