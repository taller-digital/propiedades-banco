import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FileText, Wrench, FolderOpen, Bell,
  ChevronDown, Shield, Users, Eye, Menu, X,
} from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { alerts } from '@/data/mockData';
import type { UserRole } from '@/data/mockData';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'operaciones', 'jefatura'] },
  { title: 'Inmuebles', path: '/inmuebles', icon: Building2, roles: ['admin', 'operaciones', 'jefatura'] },
  { title: 'Contratos', path: '/contratos', icon: FileText, roles: ['admin', 'jefatura'] },
  { title: 'Mantenimiento', path: '/mantenimiento', icon: Wrench, roles: ['admin', 'operaciones'] },
  { title: 'Documentos', path: '/documentos', icon: FolderOpen, roles: ['admin'] },
  { title: 'Alertas', path: '/alertas', icon: Bell, roles: ['admin', 'operaciones', 'jefatura'] },
];

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  operaciones: 'Operaciones',
  jefatura: 'Jefatura',
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  operaciones: <Users className="h-4 w-4" />,
  jefatura: <Eye className="h-4 w-4" />,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { role, setRole } = useRole();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-sidebar text-sidebar-foreground
        transform transition-transform duration-300
        lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-sidebar-primary" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Gestión Activos</h1>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Inmobiliarios</p>
            </div>
          </div>
          <button className="lg:hidden text-sidebar-foreground/60" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredNav.map(item => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary -ml-px'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.title}</span>
                    {item.path === '/alertas' && unreadAlerts > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadAlerts}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role Switcher */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="relative">
            <button onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors duration-150">
              {roleIcons[role]}
              <div className="flex-1 text-left">
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Rol activo</p>
                <p className="text-sm font-medium">{roleLabels[role]}</p>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50">
                {(Object.keys(roleLabels) as UserRole[]).map(r => (
                  <button key={r} onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors
                      ${r === role ? 'bg-primary/10 text-primary font-medium' : 'text-card-foreground hover:bg-muted'}`}>
                    {roleIcons[r]}
                    <span>{roleLabels[r]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold text-foreground">
              {navItems.find(n => location.pathname === n.path || (n.path !== '/' && location.pathname.startsWith(n.path)))?.title ?? 'Gestión de Activos'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/alertas" className="relative p-2 rounded hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                  {unreadAlerts}
                </span>
              )}
            </Link>
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {roleLabels[role][0]}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}