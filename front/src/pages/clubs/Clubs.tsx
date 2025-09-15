import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import api from '../../utils/api';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

interface Club {
  _id: string;
  name: string;
  description?: string;
  memberCount: number;
}

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get('/api/clubs');
      setClubs(res.data.data);
    } catch (err) {
      setError('Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter clubs locally since it's a small dataset
    fetchClubs();
  };

  const confirmDelete = (club: Club) => {
    setClubToDelete(club);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!clubToDelete) return;
    
    try {
      await api.delete(`/api/clubs/${clubToDelete._id}`);
      setClubs(clubs.filter(c => c._id !== clubToDelete._id));
      setShowDeleteModal(false);
      setClubToDelete(null);
      setSuccess('Club deleted successfully');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete club');
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (club.description && 
      club.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Club Management</h1>
        <Link to="/clubs/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-1" />
          Add Club
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
              placeholder="Search clubs..."
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
      ) : filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <div key={club._id} className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {club.name}
                  </h3>
                  <div className="flex space-x-2">
                    <Link
                      to={`/clubs/edit/${club._id}`}
                      className="p-1 text-gray-500 hover:text-secondary-600"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => confirmDelete(club)}
                      className="p-1 text-gray-500 hover:text-danger-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {club.description && (
                  <p className="text-gray-600 mb-4">{club.description}</p>
                )}
                
                <div className="flex items-center text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No clubs found"
          description={
            searchTerm
              ? "Try adjusting your search query"
              : "Get started by adding your first club"
          }
          linkTo="/clubs/new"
          linkText="Add Club"
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
            Are you sure you want to delete {clubToDelete?.name}?
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

export default Clubs;