import { useEffect } from 'react';
import { useAuthStore } from '../store';

export const useAuthInit = () => {
  const { updateUser } = useAuthStore();

  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          console.log('Initialisation auth avec utilisateur:', user);
          // Ne pas faire de login automatique, juste restaurer l'état
          useAuthStore.setState({ user, isAuthenticated: true });
        } catch (error) {
          console.error('Erreur lors de l\'initialisation:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      }
    };

    initAuth();
  }, []);
};
