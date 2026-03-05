export interface AppNotification {
  id: string;
  type: 'commande' | 'stock' | 'validation' | 'paiement' | 'message' | 'system';
  titre: string;
  message: string;
  userId: string;
  userRole: 'CLIENT' | 'VENDEUR' | 'ADMIN';
  data?: any;
  lu: boolean;
  dateCreation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface NotificationStats {
  total: number;
  nonLues: number;
  parType: Record<string, number>;
}