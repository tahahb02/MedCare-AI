import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ label, value, onChange, error, placeholder = 'Mot de passe', ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm transition-colors
            bg-white dark:bg-dark-card
            ${error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-dark-border focus:ring-primary-500'
            }
            focus:outline-none focus:ring-2 focus:border-transparent
            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
