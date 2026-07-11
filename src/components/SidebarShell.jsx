import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../context/SidebarContext';

export default function SidebarShell({ children }) {
  const { collapsed, isMobile, mobileOpen, closeMobile } = useSidebar();

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMobile} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-dark-card z-50 flex flex-col shadow-2xl md:hidden">
              {children}
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside initial={{ width: collapsed ? 72 : 256 }} animate={{ width: collapsed ? 72 : 256 }} transition={{ duration: 0.2 }} className="h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col fixed left-0 top-0 z-40 hidden md:flex">
      {children}
    </motion.aside>
  );
}
