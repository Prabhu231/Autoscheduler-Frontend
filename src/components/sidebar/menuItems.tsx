import { 
    Package, 
    Settings 
} from 'lucide-react'

export const menuItems = [
    {
      title: 'Schedule a task',
      icon: <Package size={20} />,
      href: '/schedule',
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      href: '/settings',
    }
  ];