import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Bus, Phone } from 'lucide-react';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

interface Transport {
  _id: string;
  vehicleName: string;
  route: string;
  driverName: string;
  driverPhone: string;
  usersCount: number;
}

const Transports = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transportToDelete, setTransportToDelete] = useState<Transport | null>(null);

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      const res = await api.get('/api/transport');
      setTransports(res.data.data);
    } catch (err) {
      setError('Failed to fetch transport options');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter transports locally since it's a small dataset
    fetchTransports();
  };

  const confirmDelete = (transport: Transport) => {
    setTransportToDelete(transport);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!transportToDelete) return;
    
    try {
      await api.delete(`/api/transport/${transportToDelete._id}`);
      setTransports(transports.filter(t => t._id !== transportToDelete._id));
      setShowDeleteModal(false);
      setTransportToDelete(null);
      setSuccess('Transport option deleted successfully');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete transport option');
    }
  };

  const filteredTransports = transports.filter(transport =>
    transport.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transport Management</h1>
        <Link to="/transport/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-1" />
          Add Transport
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
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search vehicles, routes or drivers..."
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
      ) : filteredTransports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransports.map(transport => (
            <div key={transport._id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Bus className="h-5 w-5 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {transport.vehicleName}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/transport/edit/${transport._id}`}
                      className="p-1 text-gray-500 hover:text-secondary-600"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => confirmDelete(transport)}
                      className="p-1 text-gray-500 hover:text-danger-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Route</label>
                    <p className="text-gray-700">{transport.route}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Driver</label>
                    <div className="flex items-center">
                      <span className="text-gray-700 mr-2">{transport.driverName}</span>
                      <a
                        href={`tel:${transport.driverPhone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Students Using</label>
                    <p className="text-gray-700">
                      {transport.usersCount} {transport.usersCount === 1 ? 'student' : 'students'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No transport options found"
          description={
            searchTerm
              ? "Try adjusting your search query"
              : "Get started by adding your first transport option"
          }
          linkTo="/transport/new"
          linkText="Add Transport"
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div>
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete {transportToDelete?.vehicleName}?
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

export default Transports;