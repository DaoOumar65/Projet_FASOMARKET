import { CheckCircle, Store, Upload, FileText, Package, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuideVendeurProps {
  statutCompte: 'PENDING' | 'VALIDATED' | 'REJECTED';
  boutique?: any;
}

export default function GuideVendeur({ statutCompte, boutique }: GuideVendeurProps) {
  const etapes = [
    {
      numero: 1,
      titre: "Préparez vos informations de boutique",
      description: "Rassemblez toutes les informations nécessaires avant de commencer",
      icone: <Store size={24} />,
      details: [
        "Nom commercial de votre boutique (unique et mémorable)",
        "Description détaillée de vos activités (minimum 50 caractères)",
        "Adresse physique complète de votre boutique",
        "Numéro de téléphone professionnel",
        "Adresse email professionnelle",
        "Catégorie d'activité (Mode, Électronique, Alimentation, etc.)"
      ],
      completed: !!boutique,
      action: "Créer ma boutique",
      link: "/vendeur/boutique"
    },
    {
      numero: 2,
      titre: "Rassemblez vos documents légaux",
      description: "Documents obligatoires pour la validation de votre boutique",
      icone: <FileText size={24} />,
      details: [
        "IFU (Identifiant Fiscal Unique) - Document officiel des impôts",
        "CNIB ou Passeport - Pièce d'identité valide",
        "Justificatif d'adresse - Facture d'eau/électricité récente",
        "Photo de profil professionnelle - Format JPG/PNG, max 2MB",
        "Logo de votre boutique (optionnel) - Format carré recommandé"
      ],
      completed: boutique?.documentsUploaded || false,
      action: "Gérer documents",
      link: "/vendeur/parametres"
    },
    {
      numero: 3,
      titre: "Processus de validation",
      description: "Ce qui se passe après soumission de votre dossier",
      icone: <Clock size={24} />,
      details: [
        "Vérification automatique des informations fournies",
        "Contrôle manuel par notre équipe (24-48h ouvrables)",
        "Vérification de l'authenticité des documents",
        "Validation de l'adresse et des coordonnées",
        "Notification par email du résultat",
        "Activation automatique de votre boutique si approuvée"
      ],
      completed: boutique?.statut === 'VALIDATED',
      action: "En cours de validation",
      link: null
    },
    {
      numero: 4,
      titre: "Optimisez votre catalogue produits",
      description: "Conseils pour créer un catalogue attractif et vendeur",
      icone: <Package size={24} />,
      details: [
        "Photos de qualité - Éclairage naturel, fond neutre",
        "Descriptions détaillées - Caractéristiques, dimensions, matériaux",
        "Prix compétitifs - Étudiez la concurrence",
        "Stock précis - Mettez à jour régulièrement",
        "Catégorisation correcte - Facilitez la recherche",
        "Mots-clés pertinents - Améliorez la visibilité"
      ],
      completed: false,
      action: "Ajouter produits",
      link: "/vendeur/produits"
    }
  ];

  if (statutCompte === 'VALIDATED' && boutique) {
    return (
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <CheckCircle size={32} style={{ color: '#16a34a' }} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#166534', margin: 0 }}>
              Félicitations ! Votre boutique est active
            </h2>
            <p style={{ color: '#15803d', margin: 0, fontSize: '14px' }}>
              Vous pouvez maintenant vendre vos produits sur FasoMarket
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      marginBottom: '32px'
    }}>
      {/* En-tête */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Décoration */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        
        <div style={{
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          backdropFilter: 'blur(10px)'
        }}>
          <Store size={50} style={{ color: 'white' }} />
        </div>
        
        {statutCompte === 'VALIDATED' ? (
          <>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <CheckCircle size={20} />
              Compte validé avec succès
            </div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Créez votre boutique
            </h1>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9,
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Votre compte vendeur est validé. Suivez notre guide pour lancer votre boutique en quelques étapes simples.
            </p>
          </>
        ) : (
          <>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              <Clock size={20} />
              Validation en cours
            </div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Préparez votre boutique
            </h1>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9,
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Pendant que nous validons votre compte, préparez tous les éléments nécessaires pour votre boutique.
            </p>
          </>
        )}
      </div>

      {/* Étapes */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '6px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '3px'
          }} />
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#111827',
            margin: 0
          }}>
            Guide de création
          </h2>
        </div>
        
        <div style={{ display: 'grid', gap: '24px' }}>
          {etapes.map((etape, index) => (
            <div
              key={etape.numero}
              style={{
                background: etape.completed 
                  ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: `2px solid ${etape.completed ? '#22c55e' : '#e2e8f0'}`,
                borderRadius: '20px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: etape.completed 
                  ? '0 8px 25px rgba(34, 197, 94, 0.15)'
                  : '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = etape.completed 
                  ? '0 12px 35px rgba(34, 197, 94, 0.2)'
                  : '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = etape.completed 
                  ? '0 8px 25px rgba(34, 197, 94, 0.15)'
                  : '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            >
              {/* En-tête de l'étape */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '32px',
                background: etape.completed 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: etape.completed 
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: etape.completed 
                    ? '0 8px 20px rgba(34, 197, 94, 0.3)'
                    : '0 8px 20px rgba(102, 126, 234, 0.3)'
                }}>
                  {etape.completed ? <CheckCircle size={32} /> : etape.icone}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: etape.completed ? '#16a34a' : '#667eea',
                      backgroundColor: etape.completed ? '#dcfce7' : '#e0e7ff',
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}>
                      ÉTAPE {etape.numero}
                    </span>
                    {etape.completed && (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px'
                      }}>
                        ✓ TERMINÉ
                      </span>
                    )}
                  </div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {etape.titre}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {etape.description}
                  </p>
                </div>

                {etape.link && !etape.completed && (
                  <Link
                    to={etape.link}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    {etape.action}
                    <ArrowRight size={20} />
                  </Link>
                )}
              </div>

              {/* Détails de l'étape */}
              <div style={{ padding: '0 24px 24px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  📝 Ce dont vous avez besoin :
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#4b5563'
                }}>
                  {etape.details.map((detail, idx) => (
                    <li key={idx} style={{
                      marginBottom: '8px',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations importantes */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '12px' }}>
          📋 Documents requis
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
          <li style={{ marginBottom: '4px' }}>Numéro IFU (Identifiant Fiscal Unique)</li>
          <li style={{ marginBottom: '4px' }}>CNIB ou Passeport</li>
          <li style={{ marginBottom: '4px' }}>Justificatif d'adresse</li>
          <li>Photo de profil professionnelle</li>
        </ul>
      </div>
    </div>
  );
}