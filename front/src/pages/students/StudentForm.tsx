import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';

interface Class {
  _id: string;
  name: string;
}

interface Club {
  _id: string;
  name: string;
}

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: new Date(),
    class: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    address1: '',
    address2: '',
    otherContact: '',
    clubs: [] as string[],
    hasTransport: false,
    profilePhoto: 'default.jpg'
  });

  // Options for dropdowns
  const [classes, setClasses] = useState<Class[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  
  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [classesRes, clubsRes] = await Promise.all([
          api.get('/api/classes'),
          api.get('/api/clubs')
        ]);
        
        setClasses(classesRes.data.data);
        setClubs(clubsRes.data.data);
      } catch (err) {
        setError('Failed to load form options');
      }
    };

    fetchOptions();

    // If editing, fetch student data
    if (id) {
      const fetchStudent = async () => {
        try {
          const res = await api.get(`/api/students/${id}`);
          const student = res.data.data;
          
          setFormData({
            ...student,
            dateOfBirth: new Date(student.dateOfBirth),
            clubs: student.clubs.map((club: any) => club._id)
          });
          
          if (student.profilePhoto !== 'default.jpg') {
            setPreviewUrl(`/uploads/${student.profilePhoto}`);
          }
        } catch (err) {
          setError('Failed to load student data');
        }
      };

      fetchStudent();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let photoFilename = formData.profilePhoto;
      
      // Handle file upload if new photo selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('photo', selectedFile);
        
        const uploadRes = await api.post('/api/uploads/photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        photoFilename = uploadRes.data.data;
      }
      
      const studentData = {
        ...formData,
        profilePhoto: photoFilename
      };
      
      if (id) {
        await api.put(`/api/students/${id}`, studentData);
        setSuccess('Student updated successfully');
      } else {
        await api.post('/api/students', studentData);
        setSuccess('Student created successfully');
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/students');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to save student'
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

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/students')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Edit Student' : 'Add New Student'}
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => setFormData({
                  ...formData,
                  firstName: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => setFormData({
                  ...formData,
                  lastName: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="form-label">
                Gender
              </label>
              <select
                id="gender"
                className="form-input"
                value={formData.gender}
                onChange={(e) => setFormData({
                  ...formData,
                  gender: e.target.value
                })}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateOfBirth" className="form-label">
                Date of Birth
              </label>
              <DatePicker
                selected={formData.dateOfBirth}
                onChange={(date: Date) => setFormData({
                  ...formData,
                  dateOfBirth: date
                })}
                className="form-input w-full"
                dateFormat="MMMM d, yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                required
              />
            </div>
            
            <div>
              <label htmlFor="class" className="form-label">
                Class
              </label>
              <select
                id="class"
                className="form-input"
                value={formData.class}
                onChange={(e) => setFormData({
                  ...formData,
                  class: e.target.value
                })}
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Clubs</label>
              <div className="space-y-2">
                {clubs.map(club => (
                  <label key={club._id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary-600"
                      checked={formData.clubs.includes(club._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            clubs: [...formData.clubs, club._id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            clubs: formData.clubs.filter(id => id !== club._id)
                          });
                        }
                      }}
                    />
                    <span className="ml-2">{club.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="form-label flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary-600"
                  checked={formData.hasTransport}
                  onChange={(e) => setFormData({
                    ...formData,
                    hasTransport: e.target.checked
                  })}
                />
                <span className="ml-2">Uses School Transport</span>
              </label>
            </div>
            
            <div>
              <label className="form-label">Profile Photo</label>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-bold">
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fatherName" className="form-label">
                Father's Name
              </label>
              <input
                type="text"
                id="fatherName"
                className="form-input"
                value={formData.fatherName}
                onChange={(e) => setFormData({
                  ...formData,
                  fatherName: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="fatherPhone" className="form-label">
                Father's Phone
              </label>
              <input
                type="tel"
                id="fatherPhone"
                className="form-input"
                value={formData.fatherPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  fatherPhone: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="motherName" className="form-label">
                Mother's Name
              </label>
              <input
                type="text"
                id="motherName"
                className="form-input"
                value={formData.motherName}
                onChange={(e) => setFormData({
                  ...formData,
                  motherName: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="motherPhone" className="form-label">
                Mother's Phone
              </label>
              <input
                type="tel"
                id="motherPhone"
                className="form-input"
                value={formData.motherPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  motherPhone: e.target.value
                })}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address1" className="form-label">
                Address Line 1
              </label>
              <input
                type="text"
                id="address1"
                className="form-input"
                value={formData.address1}
                onChange={(e) => setFormData({
                  ...formData,
                  address1: e.target.value
                })}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address2" className="form-label">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                id="address2"
                className="form-input"
                value={formData.address2}
                onChange={(e) => setFormData({
                  ...formData,
                  address2: e.target.value
                })}
              />
            </div>
            
            <div>
              <label htmlFor="otherContact" className="form-label">
                Other Contact (Optional)
              </label>
              <input
                type="tel"
                id="otherContact"
                className="form-input"
                value={formData.otherContact}
                onChange={(e) => setFormData({
                  ...formData,
                  otherContact: e.target.value
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/students')}
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
            {loading ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;