import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Star, MapPin } from 'lucide-react';

interface FiltresAvances {
  recherche: string;
  prixMin: number;
  prixMax: number;
  categories: string[];
  marques: string[];
  disponibilite: 'tous' | 'en_stock' | 'rupture';
  localisation: string;
  noteMin: number;
  tri: 'pertinence' | 'prix_asc' | 'prix_desc' | 'popularite' | 'note' | 'recent';
}

interface Props {
  onFiltresChange: (filtres: FiltresAvances) => void;
  categories: Array<{id: string, nom: string}>;
  marques: string[];
  localisations: string[];
}

const RechercheAvancee: React.FC<Props> = ({ onFiltresChange, categories, marques, localisations }) => {
  const [filtres, setFiltres] = useState<FiltresAvances>({
    recherche: '',
    prixMin: 0,
    prixMax: 1000000,
    categories: [],
    marques: [],
    disponibilite: 'tous',
    localisation: '',
    noteMin: 0,
    tri: 'pertinence'
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onFiltresChange(filtres);
  }, [filtres, onFiltresChange]);

  const updateFiltre = (key: keyof FiltresAvances, value: any) => {
    setFiltres(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategorie = (categorieId: string) => {
    setFiltres(prev => ({
      ...prev,
      categories: prev.categories.includes(categorieId)
        ? prev.categories.filter(id => id !== categorieId)
        : [...prev.categories, categorieId]
    }));
  };

  const toggleMarque = (marque: string) => {
    setFiltres(prev => ({
      ...prev,
      marques: prev.marques.includes(marque)
        ? prev.marques.filter(m => m !== marque)
        : [...prev.marques, marque]
    }));
  };

  const resetFiltres = () => {
    setFiltres({
      recherche: '',
      prixMin: 0,
      prixMax: 1000000,
      categories: [],
      marques: [],
      disponibilite: 'tous',
      localisation: '',
      noteMin: 0,
      tri: 'pertinence'
    });
  };

  const nombreFiltresActifs = () => {
    let count = 0;
    if (filtres.recherche) count++;
    if (filtres.prixMin > 0 || filtres.prixMax < 1000000) count++;
    if (filtres.categories.length > 0) count++;
    if (filtres.marques.length > 0) count++;
    if (filtres.disponibilite !== 'tous') count++;
    if (filtres.localisation) count++;
    if (filtres.noteMin > 0) count++;
    return count;
  };

  return (
    <div className="recherche-avancee">
      {/* Barre de recherche principale */}
      <div className="search-bar">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={filtres.recherche}
            onChange={(e) => updateFiltre('recherche', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="search-controls">
          <select
            value={filtres.tri}
            onChange={(e) => updateFiltre('tri', e.target.value)}
            className="sort-select"
          >
            <option value="pertinence">Pertinence</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
            <option value="popularite">Popularité</option>
            <option value="note">Mieux notés</option>
            <option value="recent">Plus récents</option>
          </select>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-button ${nombreFiltresActifs() > 0 ? 'active' : ''}`}
          >
            <Filter size={16} />
            Filtres
            {nombreFiltresActifs() > 0 && (
              <span className="filter-count">{nombreFiltresActifs()}</span>
            )}
            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
          </button>
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filtres avancés</h3>
            <div className="filters-actions">
              <button onClick={resetFiltres} className="reset-button">
                Réinitialiser
              </button>
              <button onClick={() => setShowFilters(false)} className="close-button">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="filters-content">
            {/* Prix */}
            <div className="filter-group">
              <h4>Prix (FCFA)</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filtres.prixMin || ''}
                  onChange={(e) => updateFiltre('prixMin', parseInt(e.target.value) || 0)}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filtres.prixMax === 1000000 ? '' : filtres.prixMax}
                  onChange={(e) => updateFiltre('prixMax', parseInt(e.target.value) || 1000000)}
                  className="price-input"
                />
              </div>
            </div>

            {/* Catégories */}
            <div className="filter-group">
              <h4>Catégories</h4>
              <div className="checkbox-list">
                {categories.map(cat => (
                  <label key={cat.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filtres.categories.includes(cat.id)}
                      onChange={() => toggleCategorie(cat.id)}
                    />
                    <span>{cat.nom}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Marques */}
            <div className="filter-group">
              <h4>Marques</h4>
              <div className="checkbox-list">
                {marques.map(marque => (
                  <label key={marque} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filtres.marques.includes(marque)}
                      onChange={() => toggleMarque(marque)}
                    />
                    <span>{marque}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Disponibilité */}
            <div className="filter-group">
              <h4>Disponibilité</h4>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="disponibilite"
                    value="tous"
                    checked={filtres.disponibilite === 'tous'}
                    onChange={(e) => updateFiltre('disponibilite', e.target.value)}
                  />
                  <span>Tous les produits</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="disponibilite"
                    value="en_stock"
                    checked={filtres.disponibilite === 'en_stock'}
                    onChange={(e) => updateFiltre('disponibilite', e.target.value)}
                  />
                  <span>En stock uniquement</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="disponibilite"
                    value="rupture"
                    checked={filtres.disponibilite === 'rupture'}
                    onChange={(e) => updateFiltre('disponibilite', e.target.value)}
                  />
                  <span>En rupture</span>
                </label>
              </div>
            </div>

            {/* Localisation */}
            <div className="filter-group">
              <h4>Localisation</h4>
              <div className="select-container">
                <MapPin size={16} className="select-icon" />
                <select
                  value={filtres.localisation}
                  onChange={(e) => updateFiltre('localisation', e.target.value)}
                  className="location-select"
                >
                  <option value="">Toutes les villes</option>
                  {localisations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note minimum */}
            <div className="filter-group">
              <h4>Note minimum</h4>
              <div className="rating-filter">
                {[1, 2, 3, 4, 5].map(note => (
                  <button
                    key={note}
                    onClick={() => updateFiltre('noteMin', filtres.noteMin === note ? 0 : note)}
                    className={`rating-button ${filtres.noteMin >= note ? 'active' : ''}`}
                  >
                    <Star size={16} fill={filtres.noteMin >= note ? '#fbbf24' : 'none'} />
                    <span>{note}+</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .recherche-avancee {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .search-bar {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .search-input-container {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          border-color: #2563eb;
        }

        .search-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .sort-select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          position: relative;
        }

        .filter-button.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
        }

        .filter-count {
          background: #2563eb;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .rotated {
          transform: rotate(180deg);
        }

        .filters-panel {
          margin-top: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px 8px 0 0;
        }

        .filters-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .filters-actions {
          display: flex;
          gap: 8px;
        }

        .reset-button {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
        }

        .close-button {
          padding: 6px;
          border: none;
          border-radius: 6px;
          background: #f3f4f6;
          cursor: pointer;
        }

        .filters-content {
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .filter-group h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .checkbox-list, .radio-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-item, .radio-item {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .select-container {
          position: relative;
        }

        .select-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .location-select {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }

        .rating-filter {
          display: flex;
          gap: 8px;
        }

        .rating-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .rating-button.active {
          border-color: #fbbf24;
          background: #fef3c7;
          color: #92400e;
        }
      `}</style>
    </div>
  );
};

export default RechercheAvancee;