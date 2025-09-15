import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';

const ClubForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (id) {
      const fetchClub = async () => {
        try {
          const res = await api.get(`/api/clubs/${id}`);
          const clubData = res.data.data;
          
          setFormData({
            name: clubData.name,
            description: clubData.description || ''
          });
        } catch (err) {
          setError('Failed to load club data');
        }
      };

      fetchClub();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (id) {
        await api.put(`/api/clubs/${id}`, formData);
        setSuccess('Club updated successfully');
      } else {
        await api.post('/api/clubs', formData);
        setSuccess('Club created successfully');
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/clubs');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to save club'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/clubs')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Edit Club' : 'Add New Club'}
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
              <label htmlFor="name" className="form-label">
                Club Name
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
              <label htmlFor="description" className="form-label">
                Description (Optional)
              </label>
              <textarea
                id="description"
                className="form-input h-32"
                value={formData.description}
                onChange={(e) => setFormData({
                  ...formData,
                  description: e.target.value
                })}
                placeholder="Enter club description..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/clubs')}
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
            {loading ? 'Saving...' : 'Save Club'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClubForm;