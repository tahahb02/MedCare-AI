import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => {
      const mobile = !e.matches;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    mq.addEventListener('change', handler);
    handler(mq);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setMobileOpen(p => !p);
    else setCollapsed(p => !p);
  }, [isMobile]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile, toggleSidebar, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
