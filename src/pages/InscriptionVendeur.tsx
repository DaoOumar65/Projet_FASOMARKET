import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Phone, ArrowRight, CheckCircle, ShoppingBag } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const InscriptionVendeur: React.FC = () => {
  const [formData, setFormData] = useState({
    nomComplet: '',
    telephone: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.motDePasse.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await authService.registerVendor({
        nomComplet: formData.nomComplet,
        telephone: formData.telephone,
        email: formData.email,
        motDePasse: formData.motDePasse
      });

      toast.success('Inscription réussie ! Votre compte est en attente de validation.');
      navigate('/connexion');
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          toast.error(errorMessages.join(', '));
        } else if (errorData.includes && errorData.includes('constraint')) {
          toast.error('Erreur de configuration du serveur. Contactez l\'administrateur.');
        } else {
          toast.error(errorData.message || 'Données invalides. Vérifiez vos informations.');
        }
      } else if (error.response?.status === 500) {
        toast.error('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limiter les mots de passe à 8 caractères
    if ((name === 'motDePasse' || name === 'confirmMotDePasse') && value.length > 8) {
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.nomComplet || !formData.telephone || !formData.email) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast.error('Veuillez entrer une adresse email valide');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px 0' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#2563eb',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>F</span>
              </div>
              <span style={{
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                FasoMarket
              </span>
            </div>
          </Link>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            <ShoppingBag size={16} />
            Compte Vendeur
          </div>
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Devenir vendeur
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Rejoignez notre marketplace et développez votre business
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px',
          padding: '0 20px'
        }}>
          {[1, 2].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= stepNumber ? '#2563eb' : '#e5e7eb',
                color: step >= stepNumber ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                {step > stepNumber ? <CheckCircle size={20} /> : stepNumber}
              </div>
              {stepNumber < 2 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: step > stepNumber ? '#2563eb' : '#e5e7eb',
                  margin: '0 16px',
                  transition: 'background-color 0.3s ease'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '32px',
          padding: '0 20px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span style={{ color: step >= 1 ? '#2563eb' : '#6b7280', fontWeight: step === 1 ? '600' : '400' }}>
            Informations personnelles
          </span>
          <span style={{ color: step >= 2 ? '#2563eb' : '#6b7280', fontWeight: step === 2 ? '600' : '400' }}>
            Sécurité
          </span>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Vos informations personnelles
                </h2>

                {/* Nom Complet */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Nom complet *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    <input
                      type="text"
                      name="nomComplet"
                      value={formData.nomComplet}
                      onChange={handleChange}
                      placeholder="Votre nom complet"
                      required
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#2563eb'}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Numéro de téléphone *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="Votre numéro de téléphone"
                      required
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#2563eb'}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Adresse email *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#2563eb'}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Sécurisez votre compte
                </h2>

                {/* Mot de passe */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Mot de passe *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="motDePasse"
                      value={formData.motDePasse}
                      onChange={handleChange}
                      placeholder="Votre mot de passe"
                      required
                      maxLength={8}
                      style={{
                        width: '100%',
                        padding: '16px 48px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#2563eb'}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '4px'
                    }}>
                      Maximum 8 caractères
                    </div>
                  </div>
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Confirmer le mot de passe *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmMotDePasse"
                      value={formData.confirmMotDePasse}
                      onChange={handleChange}
                      placeholder="Confirmez votre mot de passe"
                      required
                      maxLength={8}
                      style={{
                        width: '100%',
                        padding: '16px 48px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#2563eb'}
                      onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb'
            }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                >
                  Précédent
                </button>
              ) : (
                <div></div>
              )}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                >
                  Suivant
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                  }}
                >
                  {loading ? 'Inscription...' : 'Créer mon compte'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Vous avez déjà un compte ?{' '}
            <Link
              to="/connexion"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onMouseOver={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'}
              onMouseOut={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}
            >
              Se connecter
            </Link>
          </p>
          
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
              Vous voulez juste acheter ?
            </p>
            <Link
              to="/inscription/client"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                padding: '8px 16px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#bfdbfe';
                (e.target as HTMLAnchorElement).style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#dbeafe';
                (e.target as HTMLAnchorElement).style.transform = 'translateY(0)';
              }}
            >
              🛍️ Créer un compte client
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionVendeur;
