import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/common';

interface MemberRouteProps {
    children: React.ReactNode;
}

/**
 * Route guard that ensures only members (not admins) can access certain routes
 * Redirects admins to their dashboard
 * Redirects unauthenticated users to login
 */
export function MemberRoute({ children }: MemberRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <Spinner />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin (has admin role)
    const isAdmin = user.roles?.some(role =>
        role.name === 'admin' || role.name === 'super_admin'
    );

    // If user is admin, redirect to admin dashboard
    if (isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    // User is a regular member, allow access
    return <>{children}</>;
}
