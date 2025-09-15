import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  GraduationCap, 
  Flag, 
  Bus, 
  Phone, 
  Home, 
  QrCode,
  Receipt
} from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import QRCode from 'react-qr-code';

interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  class: {
    _id: string;
    name: string;
  };
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  address1: string;
  address2?: string;
  otherContact?: string;
  hasTransport: boolean;
  clubs: {
    _id: string;
    name: string;
  }[];
  profilePhoto: string;
  enrollmentDate: string;
  fees: Fee[];
}

interface Fee {
  _id: string;
  feeType: {
    type: string;
    month: number;
    year: number;
  };
  amountDue: number;
  amountPaid: number;
  paymentDate: string;
  status: 'Paid' | 'Partial' | 'Unpaid';
}

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
   const getCurrentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const fetchStudent = async () => {
  try {
    const res = await api.get(`/api/students/${id}`);
    const studentData = res.data.data;

    // Fetch enrollment for current year
    const enrollmentRes = await api.get('/api/enrollments/single', {
      params: {
        student: id,
        schoolYear: getCurrentSchoolYear()
      }
    });

    const enrollment = enrollmentRes.data.data;

    // Override student fields from enrollment
    studentData.class = enrollment.class;
    studentData.clubs = enrollment.clubs;
    studentData.hasTransport = enrollment.hasTransport;

    setStudent(studentData);
  } catch (err) {
    setError('Failed to fetch student details');
  } finally {
    setLoading(false);
  }
};

fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/students/${id}`);
      navigate('/students', { state: { success: 'Student deleted successfully' } });
    } catch (err) {
      setError('Failed to delete student');
      setShowDeleteModal(false);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={error}
        onClose={() => setError('')}
      />
    );
  }

  if (!student) {
    return (
      <Alert
        type="error"
        message="Student not found"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/students" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">
          Student Details
        </h1>
        <div className="flex space-x-3">
  <button
    onClick={() => setShowQrModal(true)}
    className="btn btn-outline flex items-center"
  >
    <QrCode className="h-4 w-4 mr-1" />
    Show QR
  </button>

  <Link
    to={`/students/edit/${student._id}`}
    className="btn btn-secondary flex items-center"
  >
    <Edit className="h-4 w-4 mr-1" />
    Edit
  </Link>

  <Link
    to={`/enrollments/edit/${student._id}`}
    className="btn btn-outline flex items-center"
  >
    <GraduationCap className="h-4 w-4 mr-1" />
    Manage Enrollment
  </Link>

  <button
    onClick={() => setShowDeleteModal(true)}
    className="btn btn-danger flex items-center"
  >
    <Trash2 className="h-4 w-4 mr-1" />
    Delete
  </button>
</div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Card */}
        <div className="card p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 mb-4">
              {student.profilePhoto && student.profilePhoto !== 'default.jpg' ? (
                <img
                  src={`/uploads/${student.profilePhoto}`}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-bold">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-gray-500 mt-1">
              ID: {student.studentId}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Gender</span>
                <p className="text-gray-800">{student.gender}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 text-gray-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Date of Birth</span>
                <p className="text-gray-800">
                  {new Date(student.dateOfBirth).toLocaleDateString()} ({student.age} years)
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 text-gray-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Class</span>
                <p className="text-gray-800">{student.class?.name || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 text-gray-400">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Clubs</span>
                {student.clubs && student.clubs.length > 0 ? (
                  <p className="text-gray-800">
                    {student.clubs.map(club => club.name).join(', ')}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">No clubs</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 text-gray-400">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Transport</span>
                <p className="text-gray-800">
                  {student.hasTransport ? (
                    <span className="badge badge-success">Using Transport</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-600">Not Using</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 text-gray-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Enrollment Date</span>
                <p className="text-gray-800">
                  {new Date(student.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Contact Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Father</h4>
              <div className="flex items-center mb-2">
                <div className="w-8 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <p className="text-gray-800">{student.fatherName}</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <p className="text-gray-800">{student.fatherPhone}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Mother</h4>
              <div className="flex items-center mb-2">
                <div className="w-8 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <p className="text-gray-800">{student.motherName}</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <p className="text-gray-800">{student.motherPhone}</p>
              </div>
            </div>
            
            {student.otherContact && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Other Contact</h4>
                <div className="flex items-center">
                  <div className="w-8 text-gray-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <p className="text-gray-800">{student.otherContact}</p>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Address</h4>
              <div className="flex">
                <div className="w-8 text-gray-400">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-gray-800">{student.address1}</p>
                  {student.address2 && (
                    <p className="text-gray-800">{student.address2}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fees Information */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Fee Information
            </h3>
            <Link 
              to="/fees/new" 
              state={{ studentId: student._id }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Add Fee
            </Link>
          </div>
          
          {student.fees && student.fees.length > 0 ? (
            <div className="space-y-4">
              {student.fees.map(fee => (
                <div 
                  key={fee._id} 
                  className="border border-gray-200 rounded-md p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">
                      {fee.feeType.type} - {getMonthName(fee.feeType.month)} {fee.feeType.year}
                    </h4>
                    <span className={`badge ${
                      fee.status === 'Paid' 
                        ? 'badge-success' 
                        : fee.status === 'Partial' 
                          ? 'badge-warning' 
                          : 'badge-danger'
                    }`}>
                      {fee.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Amount Due:</span>
                      <span className="ml-1 font-medium">${fee.amountDue.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount Paid:</span>
                      <span className="ml-1 font-medium">${fee.amountPaid.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Date:</span>
                      <span className="ml-1">
                        {new Date(fee.paymentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <Link
                        to={`/fees/edit/${fee._id}`}
                        className="text-secondary-600 hover:text-secondary-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No fees recorded</p>
              <Link 
                to="/fees/new" 
                state={{ studentId: student._id }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-block mt-2"
              >
                Add Fee
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={`QR Code - ${student.firstName} ${student.lastName}`}
        size="sm"
      >
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              value={student.studentId}
              size={200}
              level="H"
            />
          </div>
          <p className="mt-4 text-center text-gray-700">
            Student ID: {student.studentId}
          </p>
          <div className="mt-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div>
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete {student.firstName} {student.lastName}?
            This action cannot be undone and will also remove all associated fees.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDetails;