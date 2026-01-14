import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import '../styles/animations.css';

interface CommandeProduit {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  image?: string;
  vendeurId?: string;
}

interface CommandeVendeur {
  id: string;
  statut: string;
  dateCommande: string;
  adresseLivraison: string;
  telephone?: string;
  produits?: CommandeProduit[];
  total?: number;
}

const VendeurCommandes: React.FC = () => {
  console.log('=== VendeurCommandes component loaded ===');
  console.log('localStorage userId:', localStorage.getItem('userId'));
  console.log('localStorage userRole:', localStorage.getItem('userRole'));
  console.log('localStorage token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
  
  const [commandes, setCommandes] = useState<CommandeVendeur[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    confirmees: 0,
    livrees: 0,
    chiffreAffaires: 0
  });

  useEffect(() => {
    console.log('=== useEffect triggered ===');
    chargerCommandes();
  }, []);

  const chargerCommandes = async () => {
    try {
      setLoading(true);
      const vendeurId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      console.log('Chargement commandes vendeur:', vendeurId);
      console.log('Token:', token ? 'Présent' : 'Absent');
      
      const response = await axios.get('http://localhost:8081/api/vendeur/commandes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': vendeurId
        }
      });
      
      console.log('Réponse API commandes:', response.data);
      
      const commandesAPI = response.data || [];
      
      // Mapper les données API vers le format attendu
      const commandesMappees = commandesAPI.map((cmd: any) => ({
        id: cmd.id,
        statut: cmd.status,
        dateCommande: cmd.createdAt,
        adresseLivraison: cmd.deliveryAddress,
        telephone: cmd.deliveryPhone,
        total: cmd.totalAmount,
        produits: cmd.orderItems?.map((item: any) => ({
          id: item.product?.id,
          nom: item.product?.nom,
          prix: item.unitPrice,
          quantite: item.quantity,
          image: item.product?.images?.[0],
          vendeurId: item.product?.boutique?.vendeurId
        })) || []
      }));
      
      // Calculer les statistiques
      const statsCalculees = {
        total: commandesMappees.length,
        enAttente: commandesMappees.filter((c: any) => c.statut === 'PENDING').length,
        confirmees: commandesMappees.filter((c: any) => c.statut === 'CONFIRMED' || c.statut === 'PAID').length,
        livrees: commandesMappees.filter((c: any) => c.statut === 'DELIVERED').length,
        chiffreAffaires: commandesMappees.reduce((total: number, commande: any) => {
          return total + (commande.total || 0);
        }, 0)
      };
      
      console.log('Statistiques calculées:', statsCalculees);
      console.log('Commandes mappées:', commandesMappees);
      
      setStats(statsCalculees);
      setCommandes(commandesMappees);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des commandes:', error);
      console.error('Détails erreur:', error.response?.data);
      // Fallback vers localStorage si API échoue
      console.log('Fallback vers localStorage...');
      chargerCommandesLocal();
    } finally {
      setLoading(false);
    }
  };

  const chargerCommandesLocal = () => {
    console.log('Chargement depuis localStorage...');
    const toutesCommandes = JSON.parse(localStorage.getItem('commandes') || '[]');
    const vendeurId = localStorage.getItem('userId') || '1';
    
    console.log('Toutes commandes localStorage:', toutesCommandes);
    console.log('Vendeur ID:', vendeurId);
    
    const commandesVendeur = toutesCommandes.filter((commande: CommandeVendeur) =>
      commande.produits?.some(p => p.vendeurId === vendeurId)
    );
    
    console.log('Commandes filtrées pour vendeur:', commandesVendeur);
    
    const statsCalculees = {
      total: commandesVendeur.length,
      enAttente: commandesVendeur.filter(c => c.statut === 'PENDING' || c.statut === 'en_attente').length,
      confirmees: commandesVendeur.filter(c => c.statut === 'CONFIRMED' || c.statut === 'confirmee' || c.statut === 'PAID' || c.statut === 'en_preparation').length,
      livrees: commandesVendeur.filter(c => c.statut === 'DELIVERED' || c.statut === 'livree').length,
      chiffreAffaires: commandesVendeur.reduce((total, commande) => {
        const montantVendeur = commande.produits
          ?.filter(p => p.vendeurId === vendeurId)
          .reduce((sum, p) => sum + (p.prix * p.quantite), 0) || 0;
        return total + montantVendeur;
      }, 0)
    };
    
    setStats(statsCalculees);
    setCommandes(commandesVendeur);
  };

  const changerStatut = async (commandeId: string, nouveauStatut: string) => {
    try {
      const token = localStorage.getItem('token');
      const vendeurId = localStorage.getItem('userId');
      
      let endpoint = '';
      switch (nouveauStatut) {
        case 'CONFIRMED':
          endpoint = `http://localhost:8081/api/vendeur/commandes/${commandeId}/confirmer`;
          break;
        case 'SHIPPED':
          endpoint = `http://localhost:8081/api/vendeur/commandes/${commandeId}/expedier`;
          break;
        case 'DELIVERED':
          endpoint = `http://localhost:8081/api/vendeur/commandes/${commandeId}/livrer`;
          break;
        default:
          endpoint = `http://localhost:8081/api/vendeur/commandes/${commandeId}/statut?statut=${nouveauStatut}`;
      }
      
      await axios.put(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': vendeurId
        }
      });
      
      chargerCommandes();
      
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      const toutesCommandes = JSON.parse(localStorage.getItem('commandes') || '[]');
      const commandeIndex = toutesCommandes.findIndex((c: CommandeVendeur) => c.id === commandeId);
      
      if (commandeIndex !== -1) {
        toutesCommandes[commandeIndex].statut = nouveauStatut;
        localStorage.setItem('commandes', JSON.stringify(toutesCommandes));
        chargerCommandesLocal();
      }
    }
  };

  const commandesFiltrees = filtreStatut === 'tous' 
    ? commandes 
    : commandes.filter(c => c.statut === filtreStatut);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#3b82f6';
      case 'PAID': return '#8b5cf6';
      case 'SHIPPED': return '#10b981';
      case 'DELIVERED': return '#059669';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#dbeafe',
            padding: '12px',
            borderRadius: '8px',
            marginRight: '16px'
          }}>
            <Package size={24} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total commandes</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{stats.total}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '12px',
            borderRadius: '8px',
            marginRight: '16px'
          }}>
            <Clock size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>En attente</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{stats.enAttente}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#dcfce7',
            padding: '12px',
            borderRadius: '8px',
            marginRight: '16px'
          }}>
            <CheckCircle size={24} style={{ color: '#059669' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Livrées</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{stats.livrees}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#e9d5ff',
            padding: '12px',
            borderRadius: '8px',
            marginRight: '16px'
          }}>
            <TrendingUp size={24} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Chiffre d'affaires</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{stats.chiffreAffaires.toFixed(0)}€</p>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#0f172a',
          margin: 0
        }}>
          Mes Commandes
        </h1>
        
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="tous">Toutes les commandes</option>
          <option value="PENDING">En attente</option>
          <option value="CONFIRMED">Confirmées</option>
          <option value="PAID">Payées</option>
          <option value="SHIPPED">Expédiées</option>
          <option value="DELIVERED">Livrées</option>
          <option value="CANCELLED">Annulées</option>
        </select>
      </div>

      {commandesFiltrees.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            Aucune commande trouvée
          </p>
          <p>Les commandes contenant vos produits apparaîtront ici</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {commandesFiltrees.map((commande) => (
            <div
              key={commande.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#0f172a',
                    margin: '0 0 5px 0'
                  }}>
                    Commande #{commande.id?.slice(-8)}
                  </h3>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    margin: 0
                  }}>
                    {new Date(commande.dateCommande || Date.now()).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatutColor(commande.statut) + '20',
                    color: getStatutColor(commande.statut)
                  }}>
                    {commande.statut.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  <select
                    value={commande.statut}
                    onChange={(e) => changerStatut(commande.id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="PENDING">En attente</option>
                    <option value="CONFIRMED">Confirmée</option>
                    <option value="PAID">Payée</option>
                    <option value="SHIPPED">Expédiée</option>
                    <option value="DELIVERED">Livrée</option>
                    <option value="CANCELLED">Annulée</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '10px'
                }}>
                  Mes produits dans cette commande:
                </h4>
                
                {commande.produits
                  ?.map((produit, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}
                  >
                    <img
                      src={produit.image || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop`}
                      alt={produit.nom}
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        marginRight: '12px'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        fontWeight: '500', 
                        color: '#0f172a',
                        margin: '0 0 4px 0'
                      }}>
                        {produit.nom}
                      </p>
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Quantité: {produit.quantite} × {produit.prix}€
                      </p>
                    </div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#0f172a'
                    }}>
                      {(produit.quantite * produit.prix).toFixed(2)}€
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                paddingTop: '15px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Adresse de livraison:
                  </h4>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {commande.adresseLivraison}
                  </p>
                </div>
                
                <div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Contact client:
                  </h4>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    margin: 0
                  }}>
                    {commande.telephone || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendeurCommandes;