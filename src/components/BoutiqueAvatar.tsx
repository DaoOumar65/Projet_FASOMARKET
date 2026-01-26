import { Store } from 'lucide-react';

interface BoutiqueAvatarProps {
  image?: string;
  nom: string;
  size?: number;
}

export default function BoutiqueAvatar({ image, nom, size = 64 }: BoutiqueAvatarProps) {
  return (
    <div style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      backgroundColor: '#f3f4f6', 
      borderRadius: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {image ? (
        <img 
          src={image} 
          alt={nom}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Store size={size * 0.5} style={{ color: '#6b7280' }} />
      )}
    </div>
  );
}