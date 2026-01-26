import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, User } from 'lucide-react';

interface Avis {
  id: string;
  note: number;
  commentaire: string;
  dateCreation: string;
  client: { nomComplet: string };
}

export default function AvisProduit() {
  const { id } = useParams();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [formData, setFormData] = useState({ note: 5, commentaire: '' });
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    fetchAvis();
    checkCanReview();
  }, [id]);

  const fetchAvis = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/public/produits/${id}/avis`);
      if (response.ok) {
        setAvis(await response.json());
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const checkCanReview = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await fetch(`http://localhost:8081/api/client/produits/${id}/peut-evaluer`, {
        headers: { 'X-User-Id': userId }
      });
      if (response.ok) {
        const data = await response.json();
        setCanReview(data.peutEvaluer);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/client/produits/${id}/avis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || ''
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchAvis();
        setFormData({ note: 5, commentaire: '' });
        setCanReview(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const renderStars = (note: number, interactive = false, onChange?: (n: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-5 h-5 ${n <= note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${
              interactive ? 'cursor-pointer' : ''
            }`}
            onClick={() => interactive && onChange?.(n)}
          />
        ))}
      </div>
    );
  };

  const moyenneNote = avis.length > 0
    ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
    : '0';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Avis et Évaluations</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-5xl font-bold">{moyenneNote}</p>
            {renderStars(Math.round(Number(moyenneNote)))}
            <p className="text-gray-600 text-sm mt-2">{avis.length} avis</p>
          </div>
        </div>

        {canReview && (
          <form onSubmit={handleSubmit} className="border-t pt-4 mt-4">
            <h3 className="font-bold mb-3">Laisser un avis</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Note</label>
              {renderStars(formData.note, true, (n) => setFormData({ ...formData, note: n }))}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Commentaire</label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Publier l'avis
            </button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {avis.map((avis) => (
          <div key={avis.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{avis.client.nomComplet}</p>
                    {renderStars(avis.note)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(avis.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <p className="text-gray-700">{avis.commentaire}</p>
              </div>
            </div>
          </div>
        ))}

        {avis.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucun avis pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
