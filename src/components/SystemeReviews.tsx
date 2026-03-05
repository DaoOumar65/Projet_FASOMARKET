import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, User, Calendar } from 'lucide-react';
import { reviewsService, Review, NouvelAvis } from '../services/reviewsService';
import toast from 'react-hot-toast';

interface Props {
  produitId: string;
  vendeurId?: string;
  boutiqueId?: string;
  type: 'produit' | 'vendeur' | 'boutique';
  peutCommenter?: boolean;
}

const SystemeReviews: React.FC<Props> = ({ 
  produitId, 
  vendeurId, 
  boutiqueId, 
  type, 
  peutCommenter = false 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistiques, setStatistiques] = useState({
    moyenne: 0,
    total: 0,
    repartition: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nouvelAvis, setNouvelAvis] = useState<NouvelAvis>({
    note: 5,
    titre: '',
    commentaire: '',
    recommande: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    chargerReviews();
  }, [produitId, vendeurId, boutiqueId]);

  const chargerReviews = async () => {
    setLoading(true);
    try {
      const targetId = produitId || vendeurId || boutiqueId || '';
      const [reviewsData, stats] = await Promise.all([
        reviewsService.getReviews(targetId, type),
        reviewsService.getStatistiques(targetId, type)
      ]);
      setReviews(reviewsData);
      setStatistiques(stats);
    } catch (error) {
      console.error('Erreur chargement reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const soumettreAvis = async () => {
    if (!nouvelAvis.titre.trim() || !nouvelAvis.commentaire.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    try {
      const targetId = produitId || vendeurId || boutiqueId || '';
      await reviewsService.ajouterReview(targetId, type, nouvelAvis);
      toast.success('Avis ajouté avec succès');
      setShowForm(false);
      setNouvelAvis({ note: 5, titre: '', commentaire: '', recommande: true });
      chargerReviews();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const signalerAvis = async (reviewId: string) => {
    try {
      await reviewsService.signalerReview(reviewId);
      toast.success('Avis signalé pour modération');
    } catch (error) {
      toast.error('Erreur lors du signalement');
    }
  };

  const voterAvis = async (reviewId: string, utile: boolean) => {
    try {
      await reviewsService.voterReview(reviewId, utile);
      chargerReviews();
    } catch (error) {
      toast.error('Erreur lors du vote');
    }
  };

  const renderStars = (note: number, size = 16, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={size}
            fill={star <= note ? '#fbbf24' : 'none'}
            color={star <= note ? '#fbbf24' : '#d1d5db'}
            className={interactive ? 'star-interactive' : ''}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  const renderRepartition = () => {
    const total = statistiques.total;
    return (
      <div className="repartition">
        {[5, 4, 3, 2, 1].map(note => {
          const count = statistiques.repartition[note as keyof typeof statistiques.repartition];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={note} className="repartition-row">
              <span className="note-label">{note}</span>
              <Star size={12} fill="#fbbf24" color="#fbbf24" />
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="count">({count})</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="spinner"></div>
        <p>Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div className="systeme-reviews">
      {/* En-tête avec statistiques */}
      <div className="reviews-header">
        <div className="stats-summary">
          <div className="moyenne-container">
            <span className="moyenne">{statistiques.moyenne.toFixed(1)}</span>
            {renderStars(Math.round(statistiques.moyenne), 20)}
            <span className="total-avis">({statistiques.total} avis)</span>
          </div>
          {renderRepartition()}
        </div>
        
        {peutCommenter && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn-ajouter-avis"
          >
            Donner mon avis
          </button>
        )}
      </div>

      {/* Formulaire d'ajout d'avis */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>Donner votre avis</h3>
              <button onClick={() => setShowForm(false)} className="btn-close">×</button>
            </div>
            
            <div className="form-content">
              <div className="form-group">
                <label>Note</label>
                {renderStars(nouvelAvis.note, 24, true, (star) => 
                  setNouvelAvis(prev => ({ ...prev, note: star }))
                )}
              </div>
              
              <div className="form-group">
                <label>Titre de votre avis</label>
                <input
                  type="text"
                  value={nouvelAvis.titre}
                  onChange={(e) => setNouvelAvis(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Résumez votre expérience..."
                  maxLength={100}
                />
              </div>
              
              <div className="form-group">
                <label>Votre commentaire</label>
                <textarea
                  value={nouvelAvis.commentaire}
                  onChange={(e) => setNouvelAvis(prev => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Partagez votre expérience détaillée..."
                  rows={4}
                  maxLength={500}
                />
                <small>{nouvelAvis.commentaire.length}/500 caractères</small>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={nouvelAvis.recommande}
                    onChange={(e) => setNouvelAvis(prev => ({ ...prev, recommande: e.target.checked }))}
                  />
                  Je recommande ce {type === 'produit' ? 'produit' : type === 'vendeur' ? 'vendeur' : 'boutique'}
                </label>
              </div>
              
              <div className="form-actions">
                <button onClick={() => setShowForm(false)} className="btn-annuler">
                  Annuler
                </button>
                <button 
                  onClick={soumettreAvis}
                  disabled={submitting}
                  className="btn-publier"
                >
                  {submitting ? 'Publication...' : 'Publier l\'avis'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des avis */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>Aucun avis pour le moment</p>
            {peutCommenter && (
              <button onClick={() => setShowForm(true)} className="btn-premier-avis">
                Soyez le premier à donner votre avis
              </button>
            )}
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="user-info">
                  <div className="avatar">
                    <User size={20} />
                  </div>
                  <div className="user-details">
                    <span className="username">{review.utilisateur.nom}</span>
                    <div className="review-meta">
                      {renderStars(review.note, 14)}
                      <span className="date">
                        <Calendar size={12} />
                        {new Date(review.dateCreation).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="review-actions">
                  <button 
                    onClick={() => signalerAvis(review.id)}
                    className="btn-signaler"
                    title="Signaler cet avis"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>
              
              <div className="review-content">
                <h4 className="review-titre">{review.titre}</h4>
                <p className="review-commentaire">{review.commentaire}</p>
                
                {review.recommande && (
                  <div className="recommandation">
                    <ThumbsUp size={14} />
                    <span>Recommande ce {type}</span>
                  </div>
                )}
                
                {review.reponseVendeur && (
                  <div className="reponse-vendeur">
                    <strong>Réponse du vendeur :</strong>
                    <p>{review.reponseVendeur}</p>
                  </div>
                )}
              </div>
              
              <div className="review-footer">
                <div className="votes">
                  <button 
                    onClick={() => voterAvis(review.id, true)}
                    className="btn-vote"
                  >
                    <ThumbsUp size={14} />
                    <span>Utile ({review.votesUtiles})</span>
                  </button>
                  <button 
                    onClick={() => voterAvis(review.id, false)}
                    className="btn-vote"
                  >
                    <ThumbsDown size={14} />
                    <span>Pas utile ({review.votesInutiles})</span>
                  </button>
                </div>
                
                {review.modere && (
                  <div className="moderation-badge">
                    Avis modéré
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .systeme-reviews {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
        }

        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .stats-summary {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .moyenne-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .moyenne {
          font-size: 48px;
          font-weight: bold;
          color: #111827;
        }

        .total-avis {
          font-size: 14px;
          color: #6b7280;
        }

        .repartition {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .repartition-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .note-label {
          width: 8px;
          text-align: center;
        }

        .progress-bar {
          width: 100px;
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #fbbf24;
          transition: width 0.3s ease;
        }

        .count {
          color: #6b7280;
          min-width: 24px;
        }

        .btn-ajouter-avis {
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        .form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .form-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }

        .form-content {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
        }

        .form-group small {
          color: #6b7280;
          font-size: 12px;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-annuler {
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
        }

        .btn-publier {
          padding: 10px 20px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-publier:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .stars-container {
          display: flex;
          gap: 2px;
        }

        .star-interactive {
          cursor: pointer;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .no-reviews {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .btn-premier-avis {
          margin-top: 16px;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .review-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .user-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .username {
          font-weight: 500;
          color: #111827;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .btn-signaler {
          padding: 6px;
          border: none;
          background: #f3f4f6;
          border-radius: 4px;
          cursor: pointer;
          color: #6b7280;
        }

        .review-titre {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .review-commentaire {
          margin: 0 0 12px 0;
          line-height: 1.6;
          color: #374151;
        }

        .recommandation {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #16a34a;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .reponse-vendeur {
          background: #f9fafb;
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
          border-left: 3px solid #2563eb;
        }

        .reponse-vendeur strong {
          color: #2563eb;
        }

        .reponse-vendeur p {
          margin: 8px 0 0 0;
          color: #374151;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .votes {
          display: flex;
          gap: 12px;
        }

        .btn-vote {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          color: #6b7280;
        }

        .btn-vote:hover {
          background: #f9fafb;
        }

        .moderation-badge {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .reviews-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SystemeReviews;