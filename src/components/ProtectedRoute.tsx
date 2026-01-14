import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'CLIENT' | 'VENDOR' | 'ADMIN';
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  // Si un rôle spécifique est requis mais l'utilisateur n'a pas le bon rôle
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers le dashboard approprié selon le rôle de l'utilisateur
    switch (user?.role) {
      case 'CLIENT':
        return <Navigate to="/dashboard" replace />;
      case 'VENDOR':
        return <Navigate to="/vendeur/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
