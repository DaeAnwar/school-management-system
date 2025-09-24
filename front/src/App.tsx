import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import EnrollmentForm from './pages/enrollments/EnrollmentForm';

// Auth Pages
import Login from './pages/auth/Login';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Student Pages
import Students from './pages/students/Students';
import StudentDetails from './pages/students/StudentDetails';
import StudentForm from './pages/students/StudentForm';

// Class Pages
import Classes from './pages/classes/Classes';
import ClassForm from './pages/classes/ClassForm';

// Club Pages
import Clubs from './pages/clubs/Clubs';
import ClubForm from './pages/clubs/ClubForm';

// Transport Pages
import Transports from './pages/transport/Transports';
import TransportForm from './pages/transport/TransportForm';

// Fee Pages
import Fees from './pages/fees/Fees';


// Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Dashboard Routes */}
      <Route
      
        path="/"
        element={
          
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
          
        }
        
      >
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Student Routes */}
        <Route path="students" element={<Students />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="students/edit/:id" element={<StudentForm />} />
         {/* ✅ Enrollment Routes */}
  <Route path="enrollments/:id" element={<EnrollmentForm />} />
  <Route path="enrollments/edit/:id" element={<EnrollmentForm />} />

        {/* Class Routes */}
        <Route path="classes" element={<Classes />} />
        <Route path="classes/new" element={<ClassForm />} />
        <Route path="classes/edit/:id" element={<ClassForm />} />
        
        {/* Club Routes */}
        <Route path="clubs" element={<Clubs />} />
        <Route path="clubs/new" element={<ClubForm />} />
        <Route path="clubs/edit/:id" element={<ClubForm />} />
        
        {/* Transport Routes */}
        <Route path="transport" element={<Transports />} />
        <Route path="transport/new" element={<TransportForm />} />
        <Route path="transport/edit/:id" element={<TransportForm />} />
        
        {/* Fee Routes */}
        <Route path="fees" element={<Fees />} />

      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;