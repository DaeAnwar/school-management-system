import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

interface Class {
  _id: string;
  name: string;
  teachers: string[];
  scheduleImage?: string;
  studentCount: number;
    schoolYear?: string; // ✅ Add this line

}

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Schedule image modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
const [schoolYears, setSchoolYears] = useState<string[]>([]);
const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

const getCurrentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};
 useEffect(() => {
  const fetchFilters = async () => {
    try {
      const yearsRes = await api.get('/api/fees/school-years');
      const years = yearsRes.data.data || [];
      setSchoolYears(years);

      const current = getCurrentSchoolYear();
      setSelectedSchoolYear(current); // ✅ This will trigger the next useEffect
    } catch (err) {
      console.error('Failed to load school years');
    }
  };

  fetchFilters();
}, []);

useEffect(() => {
  if (selectedSchoolYear) {
    fetchClasses();
  }
}, [selectedSchoolYear]);


 const fetchClasses = async () => {
  try {
    const params: any = {};
    if (selectedSchoolYear) {
      params.schoolYear = selectedSchoolYear;
    }

    const res = await api.get('/api/classes', { params });
    setClasses(res.data.data);
  } catch (err) {
    setError('Failed to fetch classes');
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter classes locally since it's a small dataset
    fetchClasses();
  };

  const showSchedule = (scheduleImage: string) => {
    setSelectedSchedule(scheduleImage);
    setShowScheduleModal(true);
  };

  const confirmDelete = (cls: Class) => {
    setClassToDelete(cls);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!classToDelete) return;
    
    try {
      await api.delete(`/api/classes/${classToDelete._id}`);
      setClasses(classes.filter(c => c._id !== classToDelete._id));
      setShowDeleteModal(false);
      setClassToDelete(null);
      setSuccess('Class deleted successfully');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete class');
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teachers.some(teacher => 
      teacher.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
        <Link to="/classes/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-1" />
          Add Class
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
<div className="mb-4">
  <label htmlFor="school-year-filter" className="form-label">School Year</label>
  <select
    id="school-year-filter"
    className="form-input"
    value={selectedSchoolYear}
    onChange={(e) => setSelectedSchoolYear(e.target.value)}
  >
    <option value="">All Years</option>
    {schoolYears.map((year) => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>
</div>
      <div className="card mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search classes or teachers..."
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(cls => (
            <div key={cls._id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {cls.name}
                  </h3>
                  <div className="flex space-x-2">
                    {cls.scheduleImage && (
                      <button
                        onClick={() => showSchedule(cls.scheduleImage!)}
                        className="p-1 text-gray-500 hover:text-primary-600"
                        title="View Schedule"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      to={`/classes/edit/${cls._id}`}
                      className="p-1 text-gray-500 hover:text-secondary-600"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => confirmDelete(cls)}
                      className="p-1 text-gray-500 hover:text-danger-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Teachers</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {cls.teachers.map((teacher, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                        >
                          {teacher}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Students</label>
                    <p className="text-gray-700">{cls.studentCount} enrolled</p>
                  </div>
                  <div>
  <label className="text-sm text-gray-500">School Year</label>
  <p className="text-gray-700">{cls.schoolYear || 'N/A'}</p>
</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No classes found"
          description={
            searchTerm
              ? "Try adjusting your search query"
              : "Get started by adding your first class"
          }
          linkTo="/classes/new"
          linkText="Add Class"
        />
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Class Schedule"
        size="lg"
      >
        <div className="flex justify-center">
          <img
            src={`/uploads/${selectedSchedule}`}
            alt="Class Schedule"
            className="max-w-full rounded-lg"
          />
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
            Are you sure you want to delete {classToDelete?.name}?
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

export default Classes;