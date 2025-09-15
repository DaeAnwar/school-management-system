import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Flag,
  Bus,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';
import api from '../../utils/api';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalClubs: number;
  transportUsers: number;
  feeStatus: {
    Paid: number;
    Partial: number;
    Unpaid: number;
    totalPaid: number;
  };
  monthlyCollection: number[];
  feeBreakdown: {
    _id: string;
    count: number;
  }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/api/stats/dashboard');
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 p-4 rounded-lg text-danger-700">
        {error}
      </div>
    );
  }

  // Prepare monthly collection data for bar chart
  const monthlyCollectionData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Fee Collection',
        data: stats?.monthlyCollection || [],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare fee breakdown data for doughnut chart
  const feeBreakdownData = {
    labels: ['Paid', 'Partial', 'Unpaid'],
    datasets: [
      {
        data: [
          stats?.feeBreakdown.find(item => item._id === 'Paid')?.count || 0,
          stats?.feeBreakdown.find(item => item._id === 'Partial')?.count || 0,
          stats?.feeBreakdown.find(item => item._id === 'Unpaid')?.count || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats-card bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-primary-700 text-sm font-medium">Total Students</p>
              <h3 className="text-3xl font-bold text-primary-900 mt-1">
                {stats?.totalStudents || 0}
              </h3>
            </div>
            <div className="p-2 bg-primary-600 text-white rounded-lg">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <Link to="/students" className="text-primary-700 text-sm font-medium hover:underline">
            View all students
          </Link>
        </div>

        <div className="stats-card bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary-700 text-sm font-medium">Total Classes</p>
              <h3 className="text-3xl font-bold text-secondary-900 mt-1">
                {stats?.totalClasses || 0}
              </h3>
            </div>
            <div className="p-2 bg-secondary-600 text-white rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
          <Link to="/classes" className="text-secondary-700 text-sm font-medium hover:underline">
            View all classes
          </Link>
        </div>

        <div className="stats-card bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-accent-700 text-sm font-medium">Total Clubs</p>
              <h3 className="text-3xl font-bold text-accent-900 mt-1">
                {stats?.totalClubs || 0}
              </h3>
            </div>
            <div className="p-2 bg-accent-600 text-white rounded-lg">
              <Flag className="h-6 w-6" />
            </div>
          </div>
          <Link to="/clubs" className="text-accent-700 text-sm font-medium hover:underline">
            View all clubs
          </Link>
        </div>

        <div className="stats-card bg-gradient-to-br from-success-50 to-success-100 border border-success-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-success-700 text-sm font-medium">Transport Users</p>
              <h3 className="text-3xl font-bold text-success-900 mt-1">
                {stats?.transportUsers || 0}
              </h3>
            </div>
            <div className="p-2 bg-success-600 text-white rounded-lg">
              <Bus className="h-6 w-6" />
            </div>
          </div>
          <Link to="/transport" className="text-success-700 text-sm font-medium hover:underline">
            View transport details
          </Link>
        </div>
      </div>

      {/* Fee Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stats-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Paid Fees</p>
              <h3 className="text-3xl font-bold text-success-600 mt-1">
                {stats?.feeStatus.Paid || 0}
              </h3>
            </div>
            <div className="p-2 bg-success-100 text-success-700 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Students who have paid their fees in full
          </p>
        </div>

        <div className="stats-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Partial Payments</p>
              <h3 className="text-3xl font-bold text-warning-600 mt-1">
                {stats?.feeStatus.Partial || 0}
              </h3>
            </div>
            <div className="p-2 bg-warning-100 text-warning-700 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Students who have paid partial fees
          </p>
        </div>

        <div className="stats-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Unpaid Fees</p>
              <h3 className="text-3xl font-bold text-danger-600 mt-1">
                {stats?.feeStatus.Unpaid || 0}
              </h3>
            </div>
            <div className="p-2 bg-danger-100 text-danger-700 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Students who haven't paid their fees
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Monthly Fee Collection
            </h3>
            <div className="flex items-center text-primary-600">
              <TrendingUp className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
          <div className="h-80">
            <Bar 
              data={monthlyCollectionData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return '$ ' + context.parsed.y;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Fee Payment Breakdown
            </h3>
          </div>
          <div className="h-80 flex items-center justify-center">
            <Doughnut 
              data={feeBreakdownData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;