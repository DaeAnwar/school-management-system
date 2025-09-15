import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert = ({ 
  type, 
  message, 
  onClose, 
  autoClose = false, 
  duration = 5000 
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const alertStyles = {
    success: 'bg-success-50 text-success-800 border-success-200',
    error: 'bg-danger-50 text-danger-800 border-danger-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    info: 'bg-secondary-50 text-secondary-800 border-secondary-200',
  };

  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-success-500" />,
    error: <AlertCircle className="h-5 w-5 text-danger-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    info: <Info className="h-5 w-5 text-secondary-500" />,
  };

  return (
    <div
      className={`flex items-center p-4 mb-4 rounded-lg border ${alertStyles[type]}`}
      role="alert"
    >
      <div className="mr-3">
        {iconMap[type]}
      </div>
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      {onClose && (
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;