import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const Connexion: React.FC = () => {
  const [formData, setFormData] = useState({
    telephone: '',
    motDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.telephone, formData.motDePasse);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        animation: 'float 6s ease-in-out infinite'
      }} />

      {/* Floating Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        opacity: 0.1,
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        opacity: 0.08,
        animation: 'float 10s ease-in-out infinite reverse'
      }} />

      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.8s ease-out',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#2563eb',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>F</span>
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2563eb'
              }}>
                FasoMarket
              </span>
            </div>
          </Link>
          
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '6px'
          }}>
            Connexion
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Field */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Numéro de téléphone
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={20}
                color="#9ca3af"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
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
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#f9fafb'
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#2563eb';
                  target.style.backgroundColor = 'white';
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#e5e7eb';
                  target.style.backgroundColor = '#f9fafb';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={20}
                color="#9ca3af"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
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
                  transition: 'all 0.3s ease',
                  backgroundColor: '#f9fafb'
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#2563eb';
                  target.style.backgroundColor = 'white';
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = '#e5e7eb';
                  target.style.backgroundColor = '#f9fafb';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'none';
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
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
              >
                {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: 'right' }}>
            <Link
              to="/mot-de-passe-oublie"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#1d4ed8'}
              onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#2563eb'}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
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
              gap: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              if (!loading) {
                target.style.backgroundColor = '#1d4ed8';
                target.style.transform = 'translateY(-2px)';
                target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              if (!loading) {
                target.style.backgroundColor = '#2563eb';
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = 'none';
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
                Se connecter
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          gap: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>ou</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        </div>

        {/* Register Links */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
            Pas encore de compte ?
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/inscription/client"
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#f8fafc',
                color: '#374151',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.backgroundColor = '#f1f5f9';
                target.style.borderColor = '#cbd5e1';
                target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLAnchorElement;
                target.style.backgroundColor = '#f8fafc';
                target.style.borderColor = '#e5e7eb';
                target.style.transform = 'translateY(0)';
              }}
            >
              Inscription
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to="/"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#374151'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#6b7280'}
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Connexion;