import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link to="/login" className="btn-ghost">
          Log in
        </Link>
        <Link to="/register" className="btn-primary">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-ink"
      >
        {user.name.trim().charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-[9rem] truncate text-sm font-medium md:inline">{user.name}</span>
      <button
        onClick={() => {
          logout();
          toast.success('You have been logged out.');
          navigate('/login');
        }}
        className="btn-ghost h-9 w-9 !p-0"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
