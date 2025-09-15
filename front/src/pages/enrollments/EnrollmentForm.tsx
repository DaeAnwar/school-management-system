import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

interface Class {
  _id: string;
  name: string;
}

interface Club {
  _id: string;
  name: string;
}

const EnrollmentForm = () => {
  const navigate = useNavigate();
  const { id: studentId } = useParams<{ id: string }>();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [schoolYears, setSchoolYears] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    student: '',
    schoolYear: '',
    class: '',
    clubs: [] as string[],
    hasTransport: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() + 1 >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, classRes, clubRes, yearRes] = await Promise.all([
          api.get('/api/students'),
          api.get('/api/classes'),
          api.get('/api/clubs'),
          api.get('/api/fees/school-years')
        ]);

        setStudents(studentRes.data.data);
        setClasses(classRes.data.data);
        setClubs(clubRes.data.data);
        const years = yearRes.data.data || [];
        setSchoolYears(years);

        const currentYear = getCurrentSchoolYear();

        setFormData(prev => ({
          ...prev,
          schoolYear: currentYear
        }));

        if (studentId) {
          const enrollmentRes = await api.get('/api/enrollments/single', {
            params: {
              student: studentId,
              schoolYear: currentYear
            }
          });

          const enrollment = enrollmentRes.data.data;

          setFormData({
            student: enrollment.student._id,
            schoolYear: enrollment.schoolYear,
            class: enrollment.class?._id || '',
            clubs: enrollment.clubs.map((c: any) => c._id),
            hasTransport: enrollment.hasTransport
          });
        }
      } catch {
        setError('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/api/enrollments', formData);
      setSuccess('Enrollment saved successfully!');
      setTimeout(() => navigate('/students'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {studentId ? 'Edit Enrollment' : 'Assign Student Enrollment'}
      </h1>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label">Student</label>
          <select
            className="form-input"
            value={formData.student}
            onChange={e => setFormData({ ...formData, student: e.target.value })}
            required
            disabled={!!studentId}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.firstName} {s.lastName} ({s.studentId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">School Year</label>
          <select
            className="form-input"
            value={formData.schoolYear}
            onChange={e => setFormData({ ...formData, schoolYear: e.target.value })}
            required
            disabled={!!studentId}
          >
            <option value="">Select Year</option>
            {schoolYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Class</label>
          <select
            className="form-input"
            value={formData.class}
            onChange={e => setFormData({ ...formData, class: e.target.value })}
          >
            <option value="">No Class Assigned</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Clubs</label>
          <select
            className="form-input"
            multiple
            value={formData.clubs}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData(prev => ({ ...prev, clubs: selected }));
            }}
          >
            {clubs.map((club) => (
              <option key={club._id} value={club._id}>{club.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Uses Transport</label>
          <input
            type="checkbox"
            className="ml-2"
            checked={formData.hasTransport}
            onChange={e => setFormData({ ...formData, hasTransport: e.target.checked })}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Enrollment'}
        </button>
      </form>
    </div>
  );
};

export default EnrollmentForm;
