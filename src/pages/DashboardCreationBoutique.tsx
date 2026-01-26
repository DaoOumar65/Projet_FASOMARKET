import { useNavigate } from 'react-router-dom';
import { CheckCircle, Store, ArrowRight, BookOpen, Sparkles, FileText, Clock, Package } from 'lucide-react';

export default function DashboardCreationBoutique() {
  const navigate = useNavigate();

  const openGuide = () => {
    navigate('/vendeur/guide', { replace: true });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Décorations d'arrière-plan */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        backgroundColor: 'rgba(37, 99, 235, 0.03)',
        borderRadius: '50%'
      }} />
      
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)', 
        padding: '60px 50px',
        maxWidth: '700px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Icône de succès animée */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <CheckCircle size={60} style={{ color: 'white' }} />
        </div>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          color: '#166534',
          borderRadius: '50px',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '24px'
        }}>
          <Sparkles size={16} />
          COMPTE VALIDÉ
        </div>
        
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Félicitations !
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '20px', 
          marginBottom: '48px',
          lineHeight: '1.6',
          maxWidth: '500px',
          margin: '0 auto 48px'
        }}>
          Votre compte vendeur est validé. Il est temps de créer votre boutique et commencer à vendre !
        </p>
        
        {/* Étapes modernes */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
          padding: '32px', 
          borderRadius: '20px', 
          marginBottom: '40px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '4px',
              height: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '2px'
            }} />
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#111827',
              margin: 0
            }}>
              Prochaines étapes
            </h3>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { icon: <Store size={20} />, text: 'Créer votre boutique avec nom et description' },
              { icon: <FileText size={20} />, text: 'Télécharger vos documents légaux (IFU, CNIB)' },
              { icon: <Clock size={20} />, text: 'Validation administrative (24-48h)' },
              { icon: <Package size={20} />, text: 'Ajouter vos premiers produits' }
            ].map((etape, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  {etape.icon}
                </div>
                <span style={{ 
                  fontSize: '16px', 
                  color: '#374151',
                  fontWeight: '500',
                  flex: 1,
                  textAlign: 'left'
                }}>
                  {etape.text}
                </span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#e0e7ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Boutons d'action modernes */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/vendeur/creer-boutique')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 32px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
            }}
          >
            <Store size={20} />
            Créer ma boutique
            <ArrowRight size={20} />
          </button>
          
          <button
            onClick={openGuide}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 32px',
              backgroundColor: 'white',
              color: '#2563eb',
              border: '2px solid #2563eb',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <BookOpen size={20} />
            Guide complet
          </button>
        </div>
        
        {/* Message d'encouragement */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          border: '1px solid #f59e0b'
        }}>
          <p style={{
            color: '#92400e',
            fontSize: '14px',
            margin: 0,
            fontWeight: '500'
          }}>
            <strong>Conseil :</strong> Préparez vos photos de produits et descriptions pendant que nous validons votre boutique !
          </p>
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
}
