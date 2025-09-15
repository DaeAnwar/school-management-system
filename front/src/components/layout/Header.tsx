import { UserCircle, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-800">
          Welcome, {user?.name || 'Admin'}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 rounded-full text-xs text-white flex items-center justify-center">
            2
          </span>
        </button>
        <div className="flex items-center space-x-2">
          <UserCircle className="h-8 w-8 text-gray-500" />
          <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;