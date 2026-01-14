// Type pour le dashboard client
export interface DashboardData {
  statistiques: {
    nombreCommandes: number;
    articlesPanier: number;
    notificationsNonLues: number;
    commandesEnCours: number;
    totalDepense: number;
  };
  commandesRecentes: Commande[];
  notifications: Notification[];
}