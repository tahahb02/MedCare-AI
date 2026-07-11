import SidebarMedecin from '../components/SidebarMedecin';
import MainLayoutShell from './MainLayoutShell';

export default function MainLayoutMedecin() {
  return <MainLayoutShell SidebarComponent={SidebarMedecin} />;
}
