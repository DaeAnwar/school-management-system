import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2, 
  QrCode
} from 'lucide-react';
import api from '../../utils/api';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
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
  hasTransport: boolean;
  clubs: {
    _id: string;
    name: string;
  }[];
  profilePhoto: string;
  enrollmentDate: string;
}

interface Class {
  _id: string;
  name: string;
}

interface Club {
  _id: string;
  name: string;
}

const Students = () => {

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
const [schoolYears, setSchoolYears] = useState<string[]>([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [transportFilter, setTransportFilter] = useState('');
  
  // QR code modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
const getCurrentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

useEffect(() => {
  setSelectedSchoolYear(getCurrentSchoolYear());
}, []);
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Build query parameters
        
        const params: any = { page: currentPage, limit: 15 };
        if (selectedSchoolYear) params.schoolYear = selectedSchoolYear;

        if (searchTerm) params.search = searchTerm;
        if (selectedClass) params.class = selectedClass;
        if (selectedClub) params.clubs = selectedClub;
        if (transportFilter) params.hasTransport = transportFilter === 'yes';
        
        const res = await api.get('/api/students', { params });
        
        setStudents(res.data.data);
        setTotalPages(Math.ceil(res.data.total / 15));
        setTotalStudents(res.data.total);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch students');
        setLoading(false);
      }
    };

    const fetchFilters = async () => {
      try {
       const [classesRes, clubsRes, yearsRes] = await Promise.all([
  api.get('/api/classes'),
  api.get('/api/clubs'),
  api.get('/api/fees/school-years')
]);

setClasses(classesRes.data.data);
setClubs(clubsRes.data.data);
setSchoolYears(yearsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch filter data', err);
      }
    };

    fetchStudents();
    fetchFilters();
  }, [currentPage, searchTerm, selectedClass, selectedClub, transportFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page with new search
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      await api.delete(`/api/students/${studentToDelete._id}`);
      setStudents(students.filter(s => s._id !== studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
      setSuccess('Student deleted successfully');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedClub('');
    setTransportFilter('');
    setCurrentPage(1);
  };

  const showQRCode = (student: Student) => {
    setSelectedStudent(student);
    setShowQrModal(true);
  };

  const confirmDelete = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
        <Link to="/students/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-1" />
          Add Student
        </Link>
      </div>
      
      {success && (
        <Alert 
          type="success" 
          message={success} 
          onClose={() => setSuccess('')} 
          autoClose 
        />
      )}
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')} 
        />
      )}
      
      <div className="card mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
  <label htmlFor="year-filter" className="form-label">School Year</label>
  <select
    id="year-filter"
    className="form-input"
    value={selectedSchoolYear}
    onChange={(e) => {
      setSelectedSchoolYear(e.target.value);
      setCurrentPage(1);
    }}
  >
    <option value="">All Years</option>
    {schoolYears.map((year) => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>
</div>
            <div>
              <label htmlFor="class-filter" className="form-label">Class</label>
              <select
                id="class-filter"
                className="form-input"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="club-filter" className="form-label">Club</label>
              <select
                id="club-filter"
                className="form-input"
                value={selectedClub}
                onChange={(e) => {
                  setSelectedClub(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Clubs</option>
                {clubs.map(club => (
                  <option key={club._id} value={club._id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="transport-filter" className="form-label">Transport</label>
              <select
                id="transport-filter"
                className="form-input"
                value={transportFilter}
                onChange={(e) => {
                  setTransportFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All</option>
                <option value="yes">Using Transport</option>
                <option value="no">Not Using Transport</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="search" className="form-label">Search</label>
              <form onSubmit={handleSearch} className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or ID..."
                  className="form-input pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={resetFilters}
              className="text-gray-600 text-sm hover:text-primary-600"
            >
              Reset filters
            </button>
            
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-500">
                Showing {students.length} of {totalStudents} students
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : students.length > 0 ? (
        <>
          <div className="overflow-x-auto card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Class</th>
                  <th>Transport</th>
                  <th>Enrolled On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>{student.studentId}</td>
                    <td>
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        {student.profilePhoto && student.profilePhoto !== 'default.jpg' ? (
                          <img
                            src={`/uploads/${student.profilePhoto}`}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-xs font-bold">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                   <td>
  <div className="flex items-center space-x-2">
    <Link 
      to={`/students/${student._id}`}
      className="font-medium text-primary-600 hover:underline"
    >
      {student.firstName} {student.lastName}
    </Link>

    {!student.class && (
      <span
        title="No class assigned"
        className="inline-block px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full"
      >
        Incomplete
      </span>
    )}
  </div>
</td>
                    <td>{student.gender}</td>
                    <td>{student.age}</td>
                    <td>{student.class?.name || 'N/A'}</td>
                    <td>
                      {student.hasTransport ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-600">No</span>
                      )}
                    </td>
                    <td>
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <Link
                          to={`/students/${student._id}`}
                          className="p-1 text-gray-500 hover:text-primary-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/students/edit/${student._id}`}
                          className="p-1 text-gray-500 hover:text-secondary-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => showQRCode(student)}
                          className="p-1 text-gray-500 hover:text-accent-600"
                          title="Show QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(student)}
                          className="p-1 text-gray-500 hover:text-danger-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <button className="btn btn-outline flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No students found"
          description={
            searchTerm || selectedClass || selectedClub || transportFilter
              ? "Try adjusting your filters or search query"
              : "Get started by adding your first student"
          }
          linkTo="/students/new"
          linkText="Add Student"
        />
      )}
      
      {/* QR Code Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={`QR Code - ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
        size="sm"
      >
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg">
            {selectedStudent && (
              <QRCode
                value={selectedStudent.studentId}
                size={200}
                level="H"
              />
            )}
          </div>
          <p className="mt-4 text-center text-gray-700">
            Student ID: {selectedStudent?.studentId}
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
            Are you sure you want to delete {studentToDelete?.firstName} {studentToDelete?.lastName}?
            This action cannot be undone.
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

export default Students;