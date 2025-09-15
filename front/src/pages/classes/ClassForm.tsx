import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';

const ClassForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    teachers: [''],
    scheduleImage: '',
    schoolYear: '' // 🆕 NEW
  });
  const [schoolYears, setSchoolYears] = useState<string[]>([]);

const getCurrentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};
  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (id) {
  const fetchClass = async () => {
    try {
      const res = await api.get(`/api/classes/${id}`);
      const classData = res.data.data;

      setFormData({
        name: classData.name,
        teachers: classData.teachers,
        scheduleImage: classData.scheduleImage || '',
        schoolYear: classData.schoolYear || getCurrentSchoolYear()
      });

      if (classData.scheduleImage) {
        setPreviewUrl(`/uploads/${classData.scheduleImage}`);
      }
    } catch (err) {
      setError('Failed to load class data');
    }
  };

  fetchClass();
}
  }, [id]);
useEffect(() => {
  const fetchSchoolYears = async () => {
    try {
      const res = await api.get('/api/fees/school-years');
      const years = res.data.data || [];
      setSchoolYears(years);

      if (!id) {
        setFormData((prev) => ({
          ...prev,
          schoolYear: getCurrentSchoolYear()
        }));
      }
    } catch (err) {
      console.error('Failed to load school years');
    }
  };

  fetchSchoolYears();
}, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let scheduleFilename = formData.scheduleImage;
      
      // Handle file upload if new schedule selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('schedule', selectedFile);
        
        const uploadRes = await api.post('/api/uploads/schedule', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        scheduleFilename = uploadRes.data.data;
      }
      
      const classData = {
        ...formData,
        scheduleImage: scheduleFilename,
        teachers: formData.teachers.filter(teacher => teacher.trim() !== '')
      };
      
      if (id) {
        await api.put(`/api/classes/${id}`, classData);
        setSuccess('Class updated successfully');
      } else {
        await api.post('/api/classes', classData);
        setSuccess('Class created successfully');
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/classes');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to save class'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addTeacherField = () => {
    setFormData({
      ...formData,
      teachers: [...formData.teachers, '']
    });
  };

  const removeTeacherField = (index: number) => {
    const newTeachers = formData.teachers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      teachers: newTeachers
    });
  };

  const updateTeacher = (index: number, value: string) => {
    const newTeachers = [...formData.teachers];
    newTeachers[index] = value;
    setFormData({
      ...formData,
      teachers: newTeachers
    });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/classes')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Edit Class' : 'Add New Class'}
        </h1>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}
      
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <div className="space-y-4">
            <div>
  <label htmlFor="schoolYear" className="form-label">School Year</label>
  <select
    id="schoolYear"
    className="form-input"
    value={formData.schoolYear}
    onChange={(e) =>
      setFormData({ ...formData, schoolYear: e.target.value })
    }
    required
  >
    <option value="">Select Year</option>
    {schoolYears.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>
            <div>
              <label htmlFor="name" className="form-label">
                Class Name
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData,
                  name: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <label className="form-label">Teachers</label>
              <div className="space-y-2">
                {formData.teachers.map((teacher, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="form-input flex-1"
                      value={teacher}
                      onChange={(e) => updateTeacher(index, e.target.value)}
                      placeholder="Teacher name"
                      required
                    />
                    {formData.teachers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeacherField(index)}
                        className="text-gray-400 hover:text-danger-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTeacherField}
                  className="btn btn-outline flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Teacher
                </button>
              </div>
            </div>
            
            <div>
              <label className="form-label">Schedule Image (Optional)</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Schedule preview"
                      className="max-w-lg rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/classes')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            {loading ? 'Saving...' : 'Save Class'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassForm;