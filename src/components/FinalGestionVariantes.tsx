import React, { useState, useEffect } from 'react';
import { finalVariantesService, FinalVariante, ConnectionStatus } from '../services/finalVariantesService';

interface Props {
  produitId: string;
}

const FinalGestionVariantes: React.FC<Props> = ({ produitId }) => {
  const [variantes, setVariantes] = useState<FinalVariante[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    mode: 'degraded',
    lastCheck: new Date()
  });
  const [nouvelleVariante, setNouvelleVariante] = useState({
    couleur: '',
    taille: '',
    stock: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chargerVariantes();
    const interval = setInterval(updateConnectionStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [produitId]);

  const chargerVariantes = async () => {
    setLoading(true);
    try {
      const data = await finalVariantesService.getVariantes(produitId);
      setVariantes(data);
      setConnectionStatus(finalVariantesService.getConnectionStatus());
    } catch (error) {
      console.error('Erreur chargement variantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConnectionStatus = () => {
    setConnectionStatus(finalVariantesService.getConnectionStatus());
  };

  const ajouterVariante = async () => {
    if (!nouvelleVariante.couleur || !nouvelleVariante.taille) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const variante = await finalVariantesService.creerVariante(produitId, nouvelleVariante);
      setVariantes(prev => [...prev, variante]);
      setNouvelleVariante({ couleur: '', taille: '', stock: 0 });
      setConnectionStatus(finalVariantesService.getConnectionStatus());
    } catch (error) {
      console.error('Erreur ajout variante:', error);
    }
  };

  const StatusIndicator = () => (
    <div className={`status-indicator ${connectionStatus.mode}`}>
      <div className={`status-dot ${connectionStatus.isConnected ? 'connected' : 'disconnected'}`}></div>
      <span>
        {connectionStatus.mode === 'connected' ? 'Connecté' : 'Mode dégradé'}
      </span>
      <small>({connectionStatus.lastCheck.toLocaleTimeString()})</small>
    </div>
  );

  return (
    <div className="final-gestion-variantes">
      <div className="header">
        <h3>Gestion des Variantes</h3>
        <StatusIndicator />
      </div>

      {/* Formulaire d'ajout */}
      <div className="ajout-variante">
        <h4>Ajouter une variante</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder="Couleur"
            value={nouvelleVariante.couleur}
            onChange={(e) => setNouvelleVariante(prev => ({ ...prev, couleur: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Taille"
            value={nouvelleVariante.taille}
            onChange={(e) => setNouvelleVariante(prev => ({ ...prev, taille: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Stock"
            value={nouvelleVariante.stock}
            onChange={(e) => setNouvelleVariante(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
          />
          <button onClick={ajouterVariante} disabled={loading}>
            Ajouter
          </button>
        </div>
      </div>

      {/* Liste des variantes */}
      <div className="liste-variantes">
        <h4>Variantes existantes</h4>
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : variantes.length === 0 ? (
          <div className="empty">Aucune variante trouvée</div>
        ) : (
          <div className="variantes-grid">
            {variantes.map((variante) => (
              <div key={variante.id} className="variante-card">
                <div className="variante-info">
                  <span className="couleur">{variante.couleur}</span>
                  <span className="taille">{variante.taille}</span>
                </div>
                <div className="stock">
                  Stock: {variante.stock || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .final-gestion-variantes {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
        }

        .status-indicator.connected {
          background: #e8f5e8;
          color: #2d5a2d;
        }

        .status-indicator.degraded {
          background: #fff3cd;
          color: #856404;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.connected {
          background: #28a745;
        }

        .status-dot.disconnected {
          background: #ffc107;
        }

        .ajout-variante {
          margin-bottom: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .form-row {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .form-row input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-row button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .form-row button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .variantes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }

        .variante-card {
          padding: 15px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          background: #f8f9fa;
        }

        .variante-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .couleur {
          font-weight: bold;
          color: #495057;
        }

        .taille {
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .stock {
          font-size: 14px;
          color: #6c757d;
        }

        .loading, .empty {
          text-align: center;
          padding: 20px;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default FinalGestionVariantes;