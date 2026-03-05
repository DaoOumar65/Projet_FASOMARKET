import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, Eye } from 'lucide-react';
import RechercheAvancee from '../components/RechercheAvancee';
import { rechercheService, FiltresRecherche, ResultatRecherche } from '../services/rechercheService';

const ResultatsRecherche: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resultats, setResultats] = useState<ResultatRecherche | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, nom: string}>>([]);
  const [marques, setMarques] = useState<string[]>([]);
  const [localisations, setLocalisations] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const filtresFromUrl = getFiltresFromUrl();
    if (Object.keys(filtresFromUrl).length > 0) {
      effectuerRecherche(filtresFromUrl);
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      const [cats, marqs, locs] = await Promise.all([
        rechercheService.getCategories(),
        rechercheService.getMarques(),
        rechercheService.getLocalisations()
      ]);
      setCategories(cats);
      setMarques(marqs);
      setLocalisations(locs);
    } catch (error) {
      console.error('Erreur chargement données initiales:', error);
    }
  };

  const getFiltresFromUrl = (): FiltresRecherche => {
    const filtres: FiltresRecherche = {};
    
    if (searchParams.get('q')) filtres.recherche = searchParams.get('q')!;
    if (searchParams.get('prixMin')) filtres.prixMin = parseInt(searchParams.get('prixMin')!);
    if (searchParams.get('prixMax')) filtres.prixMax = parseInt(searchParams.get('prixMax')!);
    if (searchParams.get('categories')) filtres.categories = searchParams.get('categories')!.split(',');
    if (searchParams.get('marques')) filtres.marques = searchParams.get('marques')!.split(',');
    if (searchParams.get('disponibilite')) filtres.disponibilite = searchParams.get('disponibilite') as any;
    if (searchParams.get('localisation')) filtres.localisation = searchParams.get('localisation')!;
    if (searchParams.get('noteMin')) filtres.noteMin = parseInt(searchParams.get('noteMin')!);
    if (searchParams.get('tri')) filtres.tri = searchParams.get('tri') as any;
    if (searchParams.get('page')) filtres.page = parseInt(searchParams.get('page')!);
    
    return filtres;
  };

  const updateUrlFromFiltres = (filtres: FiltresRecherche) => {
    const newParams = new URLSearchParams();
    
    if (filtres.recherche) newParams.set('q', filtres.recherche);
    if (filtres.prixMin && filtres.prixMin > 0) newParams.set('prixMin', filtres.prixMin.toString());
    if (filtres.prixMax && filtres.prixMax < 1000000) newParams.set('prixMax', filtres.prixMax.toString());
    if (filtres.categories?.length) newParams.set('categories', filtres.categories.join(','));
    if (filtres.marques?.length) newParams.set('marques', filtres.marques.join(','));
    if (filtres.disponibilite && filtres.disponibilite !== 'tous') newParams.set('disponibilite', filtres.disponibilite);
    if (filtres.localisation) newParams.set('localisation', filtres.localisation);
    if (filtres.noteMin && filtres.noteMin > 0) newParams.set('noteMin', filtres.noteMin.toString());
    if (filtres.tri && filtres.tri !== 'pertinence') newParams.set('tri', filtres.tri);
    if (filtres.page && filtres.page > 0) newParams.set('page', filtres.page.toString());
    
    setSearchParams(newParams);
  };

  const effectuerRecherche = async (filtres: FiltresRecherche) => {
    setLoading(true);
    try {
      const resultats = await rechercheService.rechercher(filtres);
      setResultats(resultats);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltresChange = (filtres: FiltresRecherche) => {
    updateUrlFromFiltres(filtres);
    effectuerRecherche(filtres);
  };

  const renderStars = (note: number) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={14}
            fill={star <= note ? '#fbbf24' : 'none'}
            color={star <= note ? '#fbbf24' : '#d1d5db'}
          />
        ))}
        <span className="note-text">({note})</span>
      </div>
    );
  };

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
  };

  return (
    <div className="resultats-recherche">
      <RechercheAvancee
        onFiltresChange={handleFiltresChange}
        categories={categories}
        marques={marques}
        localisations={localisations}
      />

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Recherche en cours...</p>
        </div>
      ) : resultats ? (
        <div className="resultats-container">
          <div className="resultats-header">
            <h2>
              {resultats.totalElements} résultat{resultats.totalElements > 1 ? 's' : ''} trouvé{resultats.totalElements > 1 ? 's' : ''}
            </h2>
            {searchParams.get('q') && (
              <p>pour "{searchParams.get('q')}"</p>
            )}
          </div>

          <div className="produits-grid">
            {resultats.produits.map(produit => (
              <div key={produit.id} className="produit-card">
                <div className="produit-image">
                  <img
                    src={produit.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                    alt={produit.nom}
                  />
                  {produit.stock === 0 && (
                    <div className="rupture-badge">Rupture de stock</div>
                  )}
                </div>

                <div className="produit-content">
                  <h3 className="produit-nom">{produit.nom}</h3>
                  <p className="produit-description">{produit.description}</p>
                  
                  <div className="produit-meta">
                    {produit.marque && (
                      <span className="marque">{produit.marque}</span>
                    )}
                    {produit.localisation && (
                      <div className="localisation">
                        <MapPin size={12} />
                        <span>{produit.localisation}</span>
                      </div>
                    )}
                  </div>

                  {produit.note && renderStars(produit.note)}

                  <div className="produit-footer">
                    <div className="prix-container">
                      <span className="prix">{formatPrix(produit.prix)}</span>
                      <span className="stock">Stock: {produit.stock}</span>
                    </div>
                    
                    <div className="actions">
                      <button className="btn-voir">
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn-panier"
                        disabled={produit.stock === 0}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {resultats.totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: resultats.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const filtres = getFiltresFromUrl();
                    handleFiltresChange({ ...filtres, page: i });
                  }}
                  className={`page-btn ${i === resultats.currentPage ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="no-search">
          <p>Utilisez la barre de recherche pour trouver des produits</p>
        </div>
      )}

      <style jsx>{`
        .resultats-recherche {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .resultats-header {
          margin-bottom: 24px;
        }

        .resultats-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }

        .resultats-header p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .produits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .produit-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .produit-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .produit-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .produit-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rupture-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #dc2626;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .produit-content {
          padding: 16px;
        }

        .produit-nom {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
        }

        .produit-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .produit-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .marque {
          background: #eff6ff;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .localisation {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 12px;
        }

        .stars {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 12px;
        }

        .note-text {
          margin-left: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .produit-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .prix-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .prix {
          font-size: 18px;
          font-weight: 700;
          color: #2563eb;
        }

        .stock {
          font-size: 12px;
          color: #6b7280;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .btn-voir, .btn-panier {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-voir {
          background: #f3f4f6;
          color: #6b7280;
        }

        .btn-voir:hover {
          background: #e5e7eb;
        }

        .btn-panier {
          background: #2563eb;
          color: white;
        }

        .btn-panier:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-panier:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .page-btn {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .page-btn.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .no-search {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default ResultatsRecherche;