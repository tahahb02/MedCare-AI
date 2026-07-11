import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const order = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const icons = { light: Sun, dark: Moon, system: Monitor };
  const Icon = icons[theme] || Monitor;

  return (
    <button onClick={cycle} className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors ${className}`} title={`Thème: ${theme}`}>
      <Icon size={20} className="text-gray-600 dark:text-gray-300" />
    </button>
  );
}
