import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  Clock,
  Users,
  Briefcase,
  Layers,
  BarChart3,
  UserCircle,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'user';

  const userNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Book Appointment', path: '/book', icon: CalendarPlus },
    { name: 'My Appointments', path: '/my-appointments', icon: CalendarCheck },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const staffNav = [
    { name: 'Staff Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Appointment Requests', path: '/my-appointments', icon: Clock },
    { name: 'My Schedule', path: '/schedule', icon: CalendarCheck },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Staff', path: '/admin/staff', icon: Briefcase },
    { name: 'Manage Services', path: '/admin/services', icon: Layers },
    { name: 'Manage Appointments', path: '/admin/appointments', icon: CalendarCheck },
    { name: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'staff' ? staffNav : userNav;

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Role Badge Indicator */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Workspace Role</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30">
            {role}
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Quick Platform Info Footprint */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center">
        <p className="text-[11px] font-medium text-slate-400">Schedulo Platform v1.0</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Enterprise Scheduling</p>
      </div>
    </aside>
  );
};
