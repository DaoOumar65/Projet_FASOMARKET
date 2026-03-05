import React, { useState, useEffect } from 'react';
import { Flag, Check, X, Eye, User, Calendar, Star } from 'lucide-react';
import { reviewsService, Review } from '../services/reviewsService';
import toast from 'react-hot-toast';

const ModerationReviews: React.FC = () => {
  const [reviewsAModerer, setReviewsAModerer] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [raisonRejet, setRaisonRejet] = useState('');

  useEffect(() => {
    chargerReviewsAModerer();
  }, []);

  const chargerReviewsAModerer = async () => {
    setLoading(true);
    try {
      const reviews = await reviewsService.getReviewsAModerer();
      setReviewsAModerer(reviews);
    } catch (error) {
      console.error('Erreur chargement reviews à modérer:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const modererReview = async (reviewId: string, action: 'approuver' | 'rejeter', raison?: string) => {
    setActionLoading(reviewId);
    try {
      await reviewsService.modererReview(reviewId, action, raison);
      toast.success(`Avis ${action === 'approuver' ? 'approuvé' : 'rejeté'} avec succès`);
      
      // Retirer de la liste
      setReviewsAModerer(prev => prev.filter(r => r.id !== reviewId));
      setSelectedReview(null);
      setRaisonRejet('');
    } catch (error) {
      toast.error('Erreur lors de la modération');
    } finally {
      setActionLoading(null);
    }
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
      </div>
    );
  };

  const getMotifSignalement = (review: Review) => {
    // Logique pour déterminer le motif probable
    const commentaire = review.commentaire.toLowerCase();
    if (commentaire.includes('arnaque') || commentaire.includes('escroc')) {
      return 'Accusation non fondée';
    }
    if (commentaire.includes('merde') || commentaire.includes('putain')) {
      return 'Langage inapproprié';
    }
    if (review.note === 1 && review.votesInutiles > review.votesUtiles * 2) {
      return 'Avis suspect/faux';
    }
    return 'Contenu inapproprié';
  };

  if (loading) {
    return (
      <div className="moderation-loading">
        <div className="spinner"></div>
        <p>Chargement des avis à modérer...</p>
      </div>
    );
  }

  return (
    <div className="moderation-reviews">
      <div className="moderation-header">
        <h2>Modération des Avis</h2>
        <div className="stats">
          <span className="pending-count">
            {reviewsAModerer.length} avis en attente
          </span>
        </div>
      </div>

      {reviewsAModerer.length === 0 ? (
        <div className="no-reviews">
          <Flag size={48} color="#6b7280" />
          <h3>Aucun avis à modérer</h3>
          <p>Tous les avis signalés ont été traités</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviewsAModerer.map(review => (
            <div key={review.id} className="review-moderation-card">
              <div className="review-header">
                <div className="user-info">
                  <div className="avatar">
                    <User size={20} />
                  </div>
                  <div className="user-details">
                    <span className="username">{review.utilisateur.nom}</span>
                    <div className="review-meta">
                      {renderStars(review.note)}
                      <span className="date">
                        <Calendar size={12} />
                        {new Date(review.dateCreation).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="signalement-info">
                  <div className="motif-badge">
                    <Flag size={12} />
                    {getMotifSignalement(review)}
                  </div>
                </div>
              </div>

              <div className="review-content">
                <h4 className="review-titre">{review.titre}</h4>
                <p className="review-commentaire">{review.commentaire}</p>
                
                <div className="review-stats">
                  <span className="votes-info">
                    👍 {review.votesUtiles} | 👎 {review.votesInutiles}
                  </span>
                  <span className={`recommandation ${review.recommande ? 'positive' : 'negative'}`}>
                    {review.recommande ? '✅ Recommande' : '❌ Ne recommande pas'}
                  </span>
                </div>
              </div>

              <div className="moderation-actions">
                <button
                  onClick={() => setSelectedReview(review)}
                  className="btn-details"
                >
                  <Eye size={16} />
                  Détails
                </button>
                
                <button
                  onClick={() => modererReview(review.id, 'approuver')}
                  disabled={actionLoading === review.id}
                  className="btn-approuver"
                >
                  <Check size={16} />
                  Approuver
                </button>
                
                <button
                  onClick={() => {
                    setSelectedReview(review);
                    setRaisonRejet('');
                  }}
                  disabled={actionLoading === review.id}
                  className="btn-rejeter"
                >
                  <X size={16} />
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails/rejet */}
      {selectedReview && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Modération de l'avis</h3>
              <button 
                onClick={() => {
                  setSelectedReview(null);
                  setRaisonRejet('');
                }}
                className="btn-close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="review-details">
                <div className="detail-row">
                  <strong>Utilisateur:</strong> {selectedReview.utilisateur.nom}
                </div>
                <div className="detail-row">
                  <strong>Note:</strong> {renderStars(selectedReview.note)} ({selectedReview.note}/5)
                </div>
                <div className="detail-row">
                  <strong>Date:</strong> {new Date(selectedReview.dateCreation).toLocaleString()}
                </div>
                <div className="detail-row">
                  <strong>Titre:</strong> {selectedReview.titre}
                </div>
                <div className="detail-row">
                  <strong>Commentaire:</strong>
                  <div className="commentaire-complet">{selectedReview.commentaire}</div>
                </div>
                <div className="detail-row">
                  <strong>Votes:</strong> {selectedReview.votesUtiles} utiles, {selectedReview.votesInutiles} inutiles
                </div>
                <div className="detail-row">
                  <strong>Motif probable:</strong> 
                  <span className="motif">{getMotifSignalement(selectedReview)}</span>
                </div>
              </div>

              <div className="raison-rejet">
                <label>Raison du rejet (optionnel):</label>
                <textarea
                  value={raisonRejet}
                  onChange={(e) => setRaisonRejet(e.target.value)}
                  placeholder="Expliquez pourquoi cet avis est rejeté..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => modererReview(selectedReview.id, 'approuver')}
                disabled={actionLoading === selectedReview.id}
                className="btn-modal-approuver"
              >
                <Check size={16} />
                Approuver l'avis
              </button>
              
              <button
                onClick={() => modererReview(selectedReview.id, 'rejeter', raisonRejet)}
                disabled={actionLoading === selectedReview.id}
                className="btn-modal-rejeter"
              >
                <X size={16} />
                Rejeter l'avis
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .moderation-reviews {
          padding: 24px;
        }

        .moderation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .moderation-header h2 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
          color: #111827;
        }

        .pending-count {
          background: #fef3c7;
          color: #92400e;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
        }

        .no-reviews {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .no-reviews h3 {
          margin: 16px 0 8px 0;
          font-size: 20px;
          color: #374151;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }

        .review-moderation-card {
          background: white;
          border: 2px solid #fbbf24;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.1);
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

        .stars {
          display: flex;
          gap: 2px;
        }

        .date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .motif-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #fee2e2;
          color: #dc2626;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
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
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .review-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 12px;
        }

        .votes-info {
          color: #6b7280;
        }

        .recommandation.positive {
          color: #16a34a;
        }

        .recommandation.negative {
          color: #dc2626;
        }

        .moderation-actions {
          display: flex;
          gap: 8px;
        }

        .btn-details {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-approuver {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: #16a34a;
          color: white;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-rejeter {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: #dc2626;
          color: white;
          cursor: pointer;
          font-size: 12px;
        }

        .modal-overlay {
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

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
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

        .modal-content {
          padding: 20px;
        }

        .review-details {
          margin-bottom: 20px;
        }

        .detail-row {
          margin-bottom: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .detail-row strong {
          min-width: 100px;
          color: #374151;
        }

        .commentaire-complet {
          background: #f9fafb;
          padding: 12px;
          border-radius: 6px;
          border-left: 3px solid #e5e7eb;
          margin-top: 4px;
          line-height: 1.6;
        }

        .motif {
          background: #fee2e2;
          color: #dc2626;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .raison-rejet label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .raison-rejet textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-modal-approuver {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-modal-rejeter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .moderation-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px;
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
      `}</style>
    </div>
  );
};

export default ModerationReviews;