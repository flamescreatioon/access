import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function AuthGuard({ children, allowedRoles }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
