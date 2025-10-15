import React from 'react';
import { Switch } from '../ui/switch';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const [dark, setDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggle = (checked) => {
    setDark(checked);
    const next = checked ? 'dark' : 'light';
    const r = document.documentElement;
    if (checked) {
      r.classList.add('dark');
    } else {
      r.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
  };

  return (
    <div className="flex items-center gap-2" data-testid="theme-toggle-wrapper">
      <Sun className="w-4 h-4" />
      <Switch 
        checked={dark} 
        onCheckedChange={toggle} 
        data-testid="theme-toggle-switch" 
      />
      <Moon className="w-4 h-4" />
    </div>
  );
};