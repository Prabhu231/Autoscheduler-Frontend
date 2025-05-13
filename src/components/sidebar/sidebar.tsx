'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ChevronRight, 
  ChevronDown, 
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';

import { menuItems } from './menuItems';

const Sidebar = ({ className }: { className: string}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const logoutUser = async () => {
    try {
      await api.post(`/authentication/logout/`);
      localStorage.removeItem('email_app');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('email_app');
    setEmail(storedEmail || 'user@example.com');
    setUsername(storedEmail ? storedEmail.split('@')[0] : 'User');
  }, []);

  const toggleMenu = (title: string) => {
    setActiveMenu(activeMenu === title ? '' : title);
  };

  // Check if a menu item is active based on current path
  const isMenuActive = (href: string) => {
    return pathname === href;
  };

  // Check if a parent menu should be expanded based on child routes
  const shouldExpandParent = (submenu: any[]) => {
    return submenu.some(item => pathname === item.href);
  };

  // Initialize expanded menus based on current path
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu && shouldExpandParent(item.submenu)) {
        setActiveMenu(item.title);
      }
    });
  }, [pathname]);

  // This is a crucial function that toggles the sidebar state
  const handleToggleCollapse = () => {
    setCollapsed(prevState => !prevState);
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r border-purple-100 transition-all duration-300 shadow-sm",
      collapsed ? "w-16" : "w-72",
      className
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
        {!collapsed && (
          <Link href="/" className="flex items-center group">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md flex items-center justify-center text-white font-bold">A</div>
            <span className="ml-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 group-hover:from-purple-800 group-hover:to-indigo-700 transition-colors duration-300">Autoscheduler</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md flex items-center justify-center text-white font-bold">A</div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleToggleCollapse}
          className="text-purple-700 hover:bg-purple-100 rounded-full z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight 
            className={cn(
              "h-5 w-5 transition-transform duration-300", 
              collapsed ? "" : "rotate-180"
            )} 
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "flex items-center w-full p-2.5 rounded-lg transition-all duration-200",
                      activeMenu === item.title ? 
                        "bg-purple-100 text-purple-900 font-medium shadow-sm" : 
                        "text-gray-700 hover:bg-purple-50 hover:text-purple-800"
                    )}
                  >
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn(
                            "flex items-center text-purple-700",
                            collapsed ? "justify-center w-full" : ""
                          )}>
                            {item.icon}
                          </span>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right" className="bg-purple-50 text-purple-900 border-purple-200">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-purple-500 transition-transform duration-300",
                            activeMenu === item.title ? "rotate-180" : ""
                          )}
                        />
                      </>
                    )}
                  </button>
                  
                  {!collapsed && activeMenu === item.title && (
                    <ul className="mt-1 ml-6 space-y-1 animate-fadeIn">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.title}>
                          <Link 
                            href={subItem.href}
                            className={cn(
                              "flex items-center p-2 text-sm rounded-md transition-all duration-200",
                              isMenuActive(subItem.href) ? 
                                "bg-purple-50 text-purple-900 font-medium" : 
                                "text-gray-600 hover:text-purple-800 hover:bg-purple-50"
                            )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isMenuActive(subItem.href) ? "bg-purple-600" : "bg-purple-300"
                            )} />
                            <span className="ml-3">{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center p-2.5 rounded-lg transition-all duration-200",
                    isMenuActive(item.href) ? 
                      "bg-purple-100 text-purple-900 font-medium shadow-sm" : 
                      "text-gray-700 hover:bg-purple-50 hover:text-purple-800"
                  )}
                >
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={cn(
                          "flex items-center text-purple-700",
                          collapsed ? "justify-center w-full" : "",
                          isMenuActive(item.href) ? "text-purple-800" : ""
                        )}>
                          {item.icon}
                        </span>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right" className="bg-purple-50 text-purple-900 border-purple-200">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="mt-auto p-4 border-t border-purple-100 bg-gradient-to-r from-white to-purple-50">
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center">
            <Avatar className={cn(
              "border-2 border-purple-200 bg-purple-50",
              collapsed ? "h-8 w-8" : "h-9 w-9"
            )}>
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{username}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
            )}
          </div>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-full",
                    collapsed ? "mx-auto mt-2" : ""
                  )}
                  onClick={logoutUser}
                  aria-label="Logout"
                >
                  <LogOut size={collapsed ? 20 : 18} />
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-purple-50 text-purple-900 border-purple-200">
                  Logout
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;