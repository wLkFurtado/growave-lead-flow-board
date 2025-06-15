
import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface AppLogoProps {
  logoUrl?: string;
}

export const AppLogo = ({ logoUrl = "/lovable-uploads/1fd9c182-3972-410a-8f61-cc365fe0c0df.png" }: AppLogoProps) => {
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    console.error(`Falha ao carregar o logo de ${logoUrl}. Usando fallback.`);
    setHasError(true);
  };

  return (
    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 overflow-hidden bg-white/10 backdrop-blur-sm border border-slate-600/30">
      {!hasError ? (
        <img
          src={logoUrl}
          alt="Logo da empresa"
          className="w-10 h-10 object-contain"
          onError={handleImageError}
        />
      ) : (
        <div className="w-10 h-10 bg-gradient-to-br from-[#00FF88] to-[#39FF14] rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg">
          L
        </div>
      )}
    </div>
  );
};
