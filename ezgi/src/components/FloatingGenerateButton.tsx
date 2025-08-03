import React, { useState, useRef, useEffect } from 'react';

interface FloatingGenerateButtonProps {
  onGenerate: (type: 'melody' | 'chords' | 'both' | 'clear') => Promise<void> | void;
  isLoading?: boolean;
}

const FloatingGenerateButton: React.FC<FloatingGenerateButtonProps> = ({ 
  onGenerate, 
  isLoading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = async (type: 'melody' | 'chords' | 'both' | 'clear') => {
    if (isLoading) return; // Prevent multiple concurrent generations
    
    await onGenerate(type);
    setIsOpen(false);
  };

  return (
    <div className="floating-generate-container" ref={dropdownRef}>
      {/* Dropdown Menu */}
      {isOpen && !isLoading && (
        <div className="generate-dropdown">
          <div className="dropdown-arrow"></div>
          <button 
            className="dropdown-option"
            onClick={() => handleOptionClick('melody')}
          >
            <div className="option-icon">🎵</div>
            <div className="option-content">
              <div className="option-title">Melodi Oluştur</div>
              <div className="option-desc">Melodik notalar oluştur</div>
            </div>
          </button>
          
          <button 
            className="dropdown-option"
            onClick={() => handleOptionClick('chords')}
          >
            <div className="option-icon">🎹</div>
            <div className="option-content">
              <div className="option-title">Akor Oluştur</div>
              <div className="option-desc">Akor dizileri oluştur</div>
            </div>
          </button>
          
          <button 
            className="dropdown-option"
            onClick={() => handleOptionClick('both')}
          >
            <div className="option-icon">✨</div>
            <div className="option-content">
              <div className="option-title">İkisini de Oluştur</div>
              <div className="option-desc">Melodi + akor oluştur</div>
            </div>
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-option clear-option"
            onClick={() => handleOptionClick('clear')}
          >
            <div className="option-icon">🗑️</div>
            <div className="option-content">
              <div className="option-title">Tüm Notları Temizle</div>
              <div className="option-desc">Mevcut tüm notları kaldır</div>
            </div>
          </button>
        </div>
      )}
      
      {/* Main Generate Button */}
      <button 
        className={`floating-generate-btn ${isLoading ? 'loading' : ''}`}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        title={isLoading ? "Oluşturuluyor..." : "Müzik Oluştur"}
        disabled={isLoading}
      >
        <div className="generate-btn-content">
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              <span>Oluşturuluyor...</span>
            </>
          ) : (
            <>
              <svg width="28" height="28" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 0l2 7L29 8l-7 2L20 17l-2-7L11 8l7-2L20 0zm15 22l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5 1.5-4.5zm-25 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/>
              </svg>
              <span>Oluştur</span>
              <svg 
                className={`dropdown-arrow-icon ${isOpen ? 'open' : ''}`}
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="currentColor"
              >
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default FloatingGenerateButton;
