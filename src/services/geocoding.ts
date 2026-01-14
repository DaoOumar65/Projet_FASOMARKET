// Service de géocodage pour convertir adresses en coordonnées
export class GeocodingService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  // Géocoder une adresse pour obtenir lat/lng
  static async geocodeAdresse(adresse: string): Promise<{latitude: number, longitude: number} | null> {
    try {
      if (!this.GOOGLE_MAPS_API_KEY) {
        console.warn('Clé API Google Maps manquante');
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(adresse + ', Burkina Faso')}&key=${this.GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  }

  // Géocoder en lot plusieurs adresses
  static async geocodeAdresses(adresses: string[]): Promise<{[adresse: string]: {latitude: number, longitude: number} | null}> {
    const resultats: {[adresse: string]: {latitude: number, longitude: number} | null} = {};
    
    // Traiter par lots pour éviter les limites de taux
    for (const adresse of adresses) {
      resultats[adresse] = await this.geocodeAdresse(adresse);
      // Délai pour respecter les limites de l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return resultats;
  }

  // Obtenir l'adresse formatée depuis les coordonnées (géocodage inverse)
  static async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      if (!this.GOOGLE_MAPS_API_KEY) {
        return null;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
      return null;
    }
  }

  // Calculer la distance entre deux points (en km)
  static calculerDistance(
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Hook React pour utiliser le géocodage
import { useState, useEffect } from 'react';

export const useGeocode = (adresse: string) => {
  const [coordonnees, setCoordonnes] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adresse) return;

    const geocoder = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const coords = await GeocodingService.geocodeAdresse(adresse);
        setCoordonnes(coords);
      } catch (err) {
        setError('Erreur lors du géocodage');
      } finally {
        setLoading(false);
      }
    };

    geocoder();
  }, [adresse]);

  return { coordonnees, loading, error };
};