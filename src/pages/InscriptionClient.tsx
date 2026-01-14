import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const InscriptionClient: React.FC = () => {
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    adresse: '',
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
      await authService.registerClient({
        nomComplet: formData.nomComplet,
        telephone: formData.telephone,
        email: formData.email,
        motDePasse: formData.motDePasse,
        role: 'CLIENT'
      });

      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/connexion');
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          toast.error(errorMessages.join(', '));
        } else {
          toast.error(errorData.message || 'Données invalides. Vérifiez vos informations.');
        }
      } else if (error.response?.status === 500) {
        toast.error('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.nomComplet || !formData.email || !formData.telephone) {
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
                color: '#2563eb'
              }}>
                FasoMarket
              </span>
            </div>
          </Link>
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Créer un compte client
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Rejoignez notre communauté d'acheteurs
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
                  Informations personnelles
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
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
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
                    <Mail size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
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
                      placeholder="+226 XX XX XX XX"
                      required
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Adresse (optionnel)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={20} color="#9ca3af" style={{
                      position: 'absolute',
                      left: '16px',
                      top: '16px'
                    }} />
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      placeholder="Votre adresse"
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1d4ed8';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Continuer
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Sécurité du compte
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
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '16px 48px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
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
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Minimum 6 caractères
                  </p>
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
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '16px 48px 16px 48px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
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
                        cursor: 'pointer'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{
                      flex: 1,
                      padding: '16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  >
                    Retour
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: '16px',
                      backgroundColor: loading ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#1d4ed8';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {loading ? (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : (
                      <>
                        Créer mon compte
                        <CheckCircle size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Déjà un compte ?{' '}
            <Link
              to="/connexion"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Vendor Registration Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
            Vous voulez vendre sur FasoMarket ?
          </p>
          <Link
            to="/inscription/vendeur"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#16a34a',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              padding: '8px 16px',
              backgroundColor: '#dcfce7',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#bbf7d0';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#dcfce7';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🏪 Devenir vendeur
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default InscriptionClient;