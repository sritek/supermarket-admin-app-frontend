import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Boxes,
  UserCog,
  LogOut,
} from 'lucide-react';
import { ROLES } from '@/utils/constants';
import useAuthStore from '@/store/authStore';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.EMPLOYEE] },
  { path: '/products', label: 'Products', icon: Package, roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER] },
  { path: '/inventory', label: 'Inventory', icon: Boxes, roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER] },
  { path: '/orders', label: 'Orders', icon: ShoppingCart, roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.EMPLOYEE] },
  { path: '/employees', label: 'Employees', icon: UserCog, roles: [ROLES.ADMIN] },
  { path: '/users', label: 'Customers', icon: Users, roles: [ROLES.ADMIN] },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: [ROLES.ADMIN] },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Supermarket Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

