import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react';
import { vendorService } from '../services/api';
import toast from 'react-hot-toast';

export default function CreerBoutique() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    email: '',
    horairesOuverture: '',
    categorie: '',
    numeroCnib: '',
    fichierIfu: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!formData.nom.trim()) {
      toast.error('Le nom de la boutique est obligatoire');
      return;
    }
    if (!formData.telephone.trim()) {
      toast.error('Le téléphone est obligatoire');
      return;
    }
    if (!formData.adresse.trim()) {
      toast.error('L\'adresse est obligatoire');
      return;
    }
    if (!formData.numeroCnib.trim()) {
      toast.error('Le numéro CNIB est obligatoire');
      return;
    }
    if (!/^B[0-9]{8}$/.test(formData.numeroCnib)) {
      toast.error('Format CNIB invalide (ex: B12345678)');
      return;
    }
    if (!formData.fichierIfu) {
      toast.error('Le fichier IFU est obligatoire');
      return;
    }
    
    setLoading(true);

    try {
      let fichierIfuPath = '';
      
      // 1. Upload du fichier IFU d'abord
      if (formData.fichierIfu) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.fichierIfu);
        
        const uploadResponse = await fetch('http://localhost:8081/api/files/upload-ifu', {
          method: 'POST',
          headers: {
            'X-User-Id': localStorage.getItem('userId') || '',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: uploadFormData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Erreur lors de l\'upload du fichier IFU');
        }
        
        const uploadResult = await uploadResponse.json();
        fichierIfuPath = uploadResult.filePath;
      }
      
      // 2. Créer la boutique avec le chemin du fichier
      const boutiqueData = {
        nom: formData.nom,
        description: formData.description,
        adresse: formData.adresse,
        telephone: formData.telephone,
        email: formData.email,
        horairesOuverture: formData.horairesOuverture,
        categorie: formData.categorie,
        numeroCnib: formData.numeroCnib,
        fichierIfu: fichierIfuPath
      };
      
      console.log('Données boutique envoyées:', boutiqueData);
      const result = await vendorService.creerBoutiqueWithPath(boutiqueData);
      toast.success('Boutique créée avec succès ! En attente de validation.');
      navigate('/vendeur/dashboard');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/connexion');
      } else if (error.response?.status === 400) {
        console.error('Erreur 400 - Réponse complète:', error.response);
        console.error('Données de la réponse:', error.response?.data);
        console.error('Erreurs spécifiques:', JSON.stringify(error.response?.data?.errors, null, 2));
        
        const errorData = error.response?.data;
        let message = 'Données invalides';
        
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.errors) {
          console.log('Erreurs de validation détaillées:', errorData.errors);
          const errorMessages = [];
          for (const [field, fieldErrors] of Object.entries(errorData.errors)) {
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(...fieldErrors.map(err => `${field}: ${err}`));
            } else {
              errorMessages.push(`${field}: ${fieldErrors}`);
            }
          }
          message = errorMessages.length > 0 ? errorMessages.join(', ') : 'Erreurs de validation inconnues';
        }
        
        toast.error(`${message}`);
      } else {
        toast.error('Erreur lors de la création de la boutique');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limiter CNIB à 9 caractères
    if (name === 'numeroCnib' && value.length > 9) {
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format de fichier non supporté. Utilisez JPG, PNG ou PDF.');
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 5MB).');
        return;
      }
      setFormData({ ...formData, fichierIfu: file });
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.nom || !formData.description || !formData.adresse || !formData.telephone) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }
      // Validation format téléphone burkinabé
      if (!/^\+226[0-9]{8}$/.test(formData.telephone)) {
        toast.error('Format téléphone invalide. Utilisez +226XXXXXXXX');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              marginBottom: '32px'
            }}
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#2563eb',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Store size={32} style={{ color: 'white' }} />
          </div>
          
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Créer ma boutique
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Configurez votre espace de vente en quelques étapes
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
          fontSize: '14px'
        }}>
          <span style={{ color: step >= 1 ? '#2563eb' : '#6b7280', fontWeight: step === 1 ? '600' : '400' }}>
            Informations boutique
          </span>
          <span style={{ color: step >= 2 ? '#2563eb' : '#6b7280', fontWeight: step === 2 ? '600' : '400' }}>
            Documents légaux
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
                  Informations de votre boutique
                </h2>

                {/* Nom */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Nom de la boutique *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Boutique Mode Africaine"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Décrivez votre boutique et vos produits..."
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    required
                    placeholder="Secteur 15, Ouagadougou"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                      placeholder="+226XXXXXXXX"
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@boutique.com"
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                    marginTop: '16px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Continuer
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Shield size={24} style={{ color: '#2563eb' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                    Documents légaux
                  </h2>
                </div>
                
                {/* CNIB */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Numéro CNIB *
                  </label>
                  <input
                    type="text"
                    name="numeroCnib"
                    value={formData.numeroCnib}
                    onChange={handleChange}
                    required
                    placeholder="B12345678"
                    maxLength={9}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Format: B suivi de 8 chiffres
                  </p>
                </div>
                
                {/* IFU */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Fichier IFU *
                  </label>
                  <div style={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.3s ease'
                  }}>
                    <FileText size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="fichier-ifu"
                    />
                    <label
                      htmlFor="fichier-ifu"
                      style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                    >
                      Choisir un fichier
                    </label>
                    {formData.fichierIfu && (
                      <p style={{ fontSize: '14px', color: '#16a34a', marginTop: '12px', fontWeight: '500' }}>
                        ✓ {formData.fichierIfu.name}
                      </p>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      JPG, PNG ou PDF (max 5MB)
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
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
                      if (!loading) e.target.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.target.style.backgroundColor = '#2563eb';
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Création...
                      </>
                    ) : (
                      <>
                        <Store size={20} />
                        Créer ma boutique
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Info */}
        <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px', marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: 0, fontWeight: '500' }}>
            🔒 Vos informations sont sécurisées et seront validées par notre équipe sous 24-48h
          </p>
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
}
