import React, { useState, useRef, useCallback } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<number | null>(null);

  const updatePosition = useCallback((e: React.MouseEvent) => {
    // 1 cm correspond approximativement à 38 pixels. Nous allons le décaler vers la droite.
    const offsetX = 38; 
    // Nous le décalerons également légèrement vers le haut pour qu'il ne couvre pas le curseur.
    const offsetY = -25; 

    setPosition({
        x: e.clientX + offsetX,
        y: e.clientY + offsetY
    });
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    updatePosition(e);
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, updatePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updatePosition(e);
  }, [updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  return (
    <div
      className="inline-block" // Maintient la mise en page sans positionnement relatif
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div 
          className="fixed z-50 w-max max-w-xs px-3 py-2 text-sm font-normal text-white bg-gray-800 dark:bg-gray-900 border border-gray-600 dark:border-gray-600 rounded-lg shadow-sm"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            pointerEvents: 'none', // Empêche l'infobulle d'interférer avec les événements de la souris.
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
