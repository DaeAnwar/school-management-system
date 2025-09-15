import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';

const TransportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    vehicleName: '',
    route: '',
    driverName: '',
    driverPhone: ''
  });

  useEffect(() => {
    if (id) {
      const fetchTransport = async () => {
        try {
          const res = await api.get(`/api/transport/${id}`);
          const transportData = res.data.data;
          
          setFormData({
            vehicleName: transportData.vehicleName,
            route: transportData.route,
            driverName: transportData.driverName,
            driverPhone: transportData.driverPhone
          });
        } catch (err) {
          setError('Failed to load transport data');
        }
      };

      fetchTransport();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (id) {
        await api.put(`/api/transport/${id}`, formData);
        setSuccess('Transport option updated successfully');
      } else {
        await api.post('/api/transport', formData);
        setSuccess('Transport option created successfully');
      }
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/transport');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to save transport option'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/transport')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? 'Edit Transport Option' : 'Add New Transport Option'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="vehicleName" className="form-label">
                Vehicle Name
              </label>
              <input
                type="text"
                id="vehicleName"
                className="form-input"
                value={formData.vehicleName}
                onChange={(e) => setFormData({
                  ...formData,
                  vehicleName: e.target.value
                })}
                placeholder="e.g., Bus 01"
                required
              />
            </div>
            
            <div>
              <label htmlFor="route" className="form-label">
                Route
              </label>
              <input
                type="text"
                id="route"
                className="form-input"
                value={formData.route}
                onChange={(e) => setFormData({
                  ...formData,
                  route: e.target.value
                })}
                placeholder="e.g., North Route - Downtown to School"
                required
              />
            </div>
            
            <div>
              <label htmlFor="driverName" className="form-label">
                Driver Name
              </label>
              <input
                type="text"
                id="driverName"
                className="form-input"
                value={formData.driverName}
                onChange={(e) => setFormData({
                  ...formData,
                  driverName: e.target.value
                })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="driverPhone" className="form-label">
                Driver Phone
              </label>
              <input
                type="tel"
                id="driverPhone"
                className="form-input"
                value={formData.driverPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  driverPhone: e.target.value
                })}
                placeholder="e.g., +1234567890"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/transport')}
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
            {loading ? 'Saving...' : 'Save Transport'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransportForm;