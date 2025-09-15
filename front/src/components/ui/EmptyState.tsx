import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  linkTo?: string;
  linkText?: string;
}

const EmptyState = ({ 
  title, 
  description, 
  linkTo,
  linkText 
}: EmptyStateProps) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      
      {linkTo && linkText && (
        <Link 
          to={linkTo} 
          className="btn btn-primary"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;