import { Outlet } from 'react-router-dom';
import { School } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex flex-1 bg-primary-600 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <School className="h-20 w-20 text-white mb-6 mx-auto" />
          <h1 className="text-4xl font-bold text-white mb-4">
            School Management System
          </h1>
          <p className="text-primary-100 text-lg">
            A comprehensive solution for managing students, classes, clubs, transportation and fees.
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;