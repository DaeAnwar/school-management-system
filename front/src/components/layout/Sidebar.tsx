import { Link, useLocation } from 'react-router-dom';
import { 
  School, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Flag, 
  Bus, 
  Receipt, 
  BookOpen,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
    { path: '/students', icon: <Users className="h-5 w-5" />, label: 'Students' },
    { path: '/classes', icon: <GraduationCap className="h-5 w-5" />, label: 'Classes' },
    { path: '/clubs', icon: <Flag className="h-5 w-5" />, label: 'Clubs' },
    { path: '/transport', icon: <Bus className="h-5 w-5" />, label: 'Transport' },
    { path: '/fees', icon: <Receipt className="h-5 w-5" />, label: 'Fees' },
    { path: '/fee-types', icon: <BookOpen className="h-5 w-5" />, label: 'Fee Types' },
  ];

  return (
    <aside className="sidebar">
      <div className="p-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <School className="h-8 w-8 text-primary-600" />
          <span className="font-semibold text-xl text-gray-800">SchoolMS</span>
        </Link>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;