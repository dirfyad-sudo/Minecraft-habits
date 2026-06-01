import React from 'react';

interface PixelCardProps {
  title?: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
  variant?: 'light' | 'dark' | 'nested';
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function PixelCard({ 
  title, 
  subtitle, 
  icon, 
  variant = 'light', 
  children, 
  className = '',
  id
}: PixelCardProps) {
  
  const getVariantClass = () => {
    switch (variant) {
      case 'dark':
        return 'mc-panel-dark text-stone-200';
      case 'nested':
        return 'mc-panel-inner text-stone-300';
      case 'light':
      default:
        return 'mc-panel text-stone-800';
    }
  };

  return (
    <div 
      id={id}
      className={`relative p-5 ${getVariantClass()} rounded-none image-rendering-pixelated ${className}`}
    >
      {/* Title ribbon */}
      {title && (
        <div className="flex items-center gap-3 mb-4 border-b-4 border-dashed border-stone-800/10 pb-2">
          {icon && (
            <div className="w-8 h-8 flex items-center justify-center bg-stone-700/10 text-xl mc-font-pixel border-2 border-stone-800/30">
              {icon}
            </div>
          )}
          <div>
            <h3 className="mc-font-pixel text-2xl font-bold tracking-wide uppercase leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs uppercase opacity-75 font-mono">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Content body */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
