import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Users, Store, TrendingUp, Star, ArrowRight, Heart, ShoppingCart, Play, Shield, Truck, Headphones, Award, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { api } from '../services/api';
import { usePanierStore } from '../store';
import toast from 'react-hot-toast';

interface Stats {
  totalProduits: number;
  totalBoutiques: number;
  totalUtilisateurs: number;
  totalCommandes: number;
}

interface Produit {
  id: number;
  nom: string;
  prix: number;
  image: string;
  boutique: string;
  note: number;
  nombreVentes: number;
}

interface Boutique {
  id: number;
  nom: string;
  logo: string;
  description: string;
  nombreProduits: number;
  note: number;
}

interface Categorie {
  id: number;
  nom: string;
  image: string;
  nombreProduits: number;
}

const Accueil: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalProduits: 0, totalBoutiques: 0, totalUtilisateurs: 0, totalCommandes: 0 });
  const [produitsPopulaires, setProduitsPopulaires] = useState<Produit[]>([]);
  const [boutiquesVedettes, setBoutiquesVedettes] = useState<Boutique[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [produitsParCategorie, setProduitsParCategorie] = useState<{[key: string]: any[]}>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = usePanierStore();
  const navigate = useNavigate();

  useEffect(() => {
    const chargerStatistiques = async () => {
      try {
        // Charger les statistiques depuis l'API
        const [produitsRes, boutiquesRes] = await Promise.all([
          fetch('http://localhost:8081/api/public/produits').then(r => r.json()).catch(() => []),
          fetch('http://localhost:8081/api/public/boutiques').then(r => r.json()).catch(() => [])
        ]);
        
        setStats({
          totalProduits: Array.isArray(produitsRes) ? produitsRes.length : 0,
          totalBoutiques: Array.isArray(boutiquesRes) ? boutiquesRes.length : 0,
          totalUtilisateurs: 5, // Valeur fixe car endpoint admin inaccessible
          totalCommandes: 1 // Valeur fixe car endpoint admin inaccessible
        });
        
      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
        // Fallback vers des données par défaut
        setStats({ totalProduits: 3, totalBoutiques: 1, totalUtilisateurs: 5, totalCommandes: 1 });
      } finally {
        setLoading(false);
      }
    };
    
    const chargerCategories = async () => {
      try {
        const produitsRes = await fetch('http://localhost:8081/api/public/produits').then(r => r.json()).catch(() => []);
        
        if (Array.isArray(produitsRes) && produitsRes.length > 0) {
          // Compter les produits par catégorie et les grouper
          const categoriesCount = {};
          const produitsGroupes = {};
          
          produitsRes.forEach((produit: any) => {
            const cat = produit.category || produit.categorie || 'Autre';
            categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
            
            if (!produitsGroupes[cat]) {
              produitsGroupes[cat] = [];
            }
            produitsGroupes[cat].push({
              id: produit.id,
              nom: produit.nom || produit.name || 'Produit sans nom',
              prix: produit.prix || produit.price || 0,
              image: Array.isArray(produit.images) ? produit.images[0] : 
                     (typeof produit.images === 'string' ? produit.images.split(',')[0] : 
                      produit.image || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop`)
            });
          });
          
          // Convertir en format attendu avec de meilleures images
          const categoriesArray = Object.entries(categoriesCount).map(([nom, count], index) => ({
            id: index + 1,
            nom,
            image: `https://images.unsplash.com/photo-${1560472354 + index * 1000}?w=400&h=300&fit=crop`,
            nombreProduits: count as number
          }));
          
          setCategories(categoriesArray);
          setProduitsParCategorie(produitsGroupes);
        } else {
          // Fallback avec 3 catégories par défaut
          setCategories([
            { id: 1, nom: 'Mode', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', nombreProduits: 3 },
            { id: 2, nom: 'Électronique', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', nombreProduits: 0 },
            { id: 3, nom: 'Alimentation', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop', nombreProduits: 0 }
          ]);
        }
      } catch (error) {
        console.error('Erreur chargement catégories:', error);
        setCategories([
          { id: 1, nom: 'Mode', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', nombreProduits: 3 }
        ]);
      }
    };
    
    chargerStatistiques();
    chargerCategories();
    // Données de démonstration pour les produits et boutiques
    setProduitsPopulaires([
      { id: 1, nom: "Smartphone Samsung Galaxy A54", prix: 180000, image: "/placeholder-product.jpg", boutique: "TechStore BF", note: 4.5, nombreVentes: 156 },
      { id: 2, nom: "Robe Traditionnelle Faso Dan Fani", prix: 25000, image: "/placeholder-product.jpg", boutique: "Fashion Ouaga", note: 4.8, nombreVentes: 89 },
      { id: 3, nom: "Ordinateur Portable HP", prix: 350000, image: "/placeholder-product.jpg", boutique: "Informatique Plus", note: 4.3, nombreVentes: 67 },
      { id: 4, nom: "Chaussures Nike Air Max", prix: 45000, image: "/placeholder-product.jpg", boutique: "Sport Center", note: 4.6, nombreVentes: 134 }
    ]);

    setBoutiquesVedettes([
      { id: 1, nom: "Fashion Ouaga", logo: "/placeholder-shop.jpg", description: "Vêtements et accessoires de mode pour toute la famille", nombreProduits: 245, note: 4.8 },
      { id: 2, nom: "TechStore BF", logo: "/placeholder-shop.jpg", description: "Électronique et high-tech au meilleur prix", nombreProduits: 189, note: 4.7 },
      { id: 3, nom: "Marché Central", logo: "/placeholder-shop.jpg", description: "Produits alimentaires frais et de qualité", nombreProduits: 567, note: 4.9 }
    ]);
  }, []);

  const addToCart = (produit: Produit) => {
    addItem({
      id: produit.id.toString(),
      produit: {
        id: produit.id.toString(),
        nom: produit.nom,
        prix: produit.prix,
        images: [produit.image],
        boutique: { nom: produit.boutique } as any,
        disponible: true,
        quantiteStock: 10,
        categorie: '',
        description: ''
      },
      quantite: 1
    });
    toast.success('Produit ajouté au panier');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = value;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section avec fond harmonisé */}
      <section style={{
        backgroundColor: '#0f172a',
        padding: '120px 0 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Image de fond */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/src/assets/influencer-filming-fashion-vlog.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ 
              fontSize: '3.5rem', 
              fontWeight: '800', 
              marginBottom: '24px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              Marketplace du Burkina Faso
            </div>
            <p style={{ 
              fontSize: '1.25rem', 
              marginBottom: '20px', 
              color: '#e2e8f0',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              Découvrez des milliers de produits locaux et soutenez nos commerçants avec une expérience d'achat moderne et sécurisée
            </p>
            
            {/* Barre de recherche moderne */}
            <div style={{ 
              maxWidth: '580px', 
              margin: '0 auto 50px',
              position: 'relative'
            }}>
              <form onSubmit={handleSearch} style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits, boutiques..."
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '16px',
                    color: '#0f172a',
                    fontWeight: '400'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '14px 28px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                >
                  <Search size={18} />
                  Rechercher
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/boutiques"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Store size={20} />
                Explorer les boutiques
              </Link>
              
              <Link
                to="/categories"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Search size={20} />
                Voir les catégories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Minimaliste */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            {[
              { icon: ShoppingBag, label: 'Produits', value: stats.totalProduits, color: '#0f172a' },
              { icon: Store, label: 'Boutiques', value: stats.totalBoutiques, color: '#0f172a' },
              { icon: Users, label: 'Utilisateurs', value: stats.totalUtilisateurs, color: '#0f172a' },
              { icon: TrendingUp, label: 'Commandes', value: stats.totalCommandes, color: '#0f172a' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <stat.icon size={28} color={stat.color} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                  <AnimatedCounter value={stat.value} />
                </div>
                <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Avantages */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#111827', marginBottom: '20px' }}>
              Pourquoi choisir FasoMarket ?
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Une expérience d'achat unique avec des avantages exclusifs
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {[
              { icon: Shield, title: 'Sécurité garantie', desc: 'Paiements sécurisés et protection des données', color: '#10b981' },
              { icon: Truck, title: 'Livraison rapide', desc: 'Livraison dans tout le Burkina Faso en 24-48h', color: '#3b82f6' },
              { icon: Headphones, title: 'Support 24/7', desc: 'Une équipe dédiée pour vous accompagner', color: '#f59e0b' },
              { icon: Award, title: 'Qualité certifiée', desc: 'Produits vérifiés et boutiques de confiance', color: '#ef4444' }
            ].map((avantage, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '35px 25px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = avantage.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: `${avantage.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <avantage.icon size={32} color={avantage.color} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                  {avantage.title}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  {avantage.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories avec design moderne */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Découvrir
            </div>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: '800', 
              color: '#0f172a', 
              marginBottom: '16px',
              lineHeight: '1.1'
            }}>
              Catégories <span style={{ color: '#2563eb' }}>Tendances</span>
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
              Explorez les univers qui font vibrer notre communauté
            </p>
          </div>

          {categories.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '40px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {categories.slice(0, 3).map((categorie, index) => (
                <div key={categorie.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0'
                }}>
                  {/* En-tête de catégorie */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '25px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        🛍️
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#0f172a',
                          margin: '0 0 5px 0'
                        }}>
                          {categorie.nom}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: 0
                        }}>
                          {categorie.nombreProduits} produit{categorie.nombreProduits > 1 ? 's' : ''} disponible{categorie.nombreProduits > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/produits?categorie=${categorie.nom}`}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f1f5f9',
                        color: '#2563eb',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f1f5f9';
                        e.target.style.color = '#2563eb';
                      }}
                    >
                      Voir tout →
                    </Link>
                  </div>
                  
                  {/* Carousel de produits */}
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    overflowX: 'auto',
                    paddingBottom: '10px'
                  }}>
                    {/* Afficher les vrais produits de cette catégorie depuis l'API */}
                    {(produitsParCategorie[categorie.nom] || []).slice(0, 4).map((produit, idx) => (
                      <Link
                        key={produit.id}
                        to={`/produit/${produit.id}`}
                        style={{
                          minWidth: '180px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          height: '120px',
                          backgroundImage: `url(${produit.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          {!produit.image && '📦'}
                        </div>
                        <div style={{ padding: '12px' }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#0f172a',
                            margin: '0 0 5px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {produit.nom}
                          </h4>
                          <p style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#2563eb',
                            margin: 0
                          }}>
                            {produit.prix.toLocaleString()} FCFA
                          </p>
                        </div>
                      </Link>
                    ))}
                    
                    {/* Message si aucun produit */}
                    {(!produitsParCategorie[categorie.nom] || produitsParCategorie[categorie.nom].length === 0) && (
                      <div style={{
                        minWidth: '180px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Aucun produit disponible
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer Professionnel */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '60px 0 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* À propos */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#667eea',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>F</span>
                </div>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>FasoMarket</span>
              </div>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '20px' }}>
                La première marketplace du Burkina Faso. Connectant acheteurs et vendeurs pour une expérience d'achat unique et sécurisée.
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#374151',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#667eea';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#374151';
                      e.target.style.color = '#9ca3af';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Liens rapides
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Boutiques', 'Catégories', 'Produits populaires', 'Nouveautés', 'Promotions'].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    style={{
                      color: '#9ca3af',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#667eea'}
                    onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Support
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Centre d\'aide', 'Contact', 'Conditions d\'utilisation', 'Politique de confidentialité', 'FAQ'].map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    style={{
                      color: '#9ca3af',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#667eea'}
                    onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Contact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={18} color="#667eea" />
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                    Ouagadougou, Burkina Faso
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={18} color="#667eea" />
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                    +226 XX XX XX XX
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={18} color="#667eea" />
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                    contact@fasomarket.bf
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              © 2024 FasoMarket. Tous droits réservés. Fait avec ❤️ au Burkina Faso
            </p>
          </div>
        </div>
      </footer>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Accueil;
