import React, { useState, useEffect } from 'react';

const MobileWarning: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || !isVisible) {
    return null;
  }

  return (
    <div className="mobile-warning-overlay">
      <div className="mobile-warning-modal">
        <div className="mobile-warning-header">
          <h2>📱 Mobil Versiyon</h2>
          <button 
            className="close-button"
            onClick={() => setIsVisible(false)}
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        
        <div className="mobile-warning-content">
          <div className="warning-icon">⚠️</div>
          <h3>Mobil versiyon yakında geliyor!</h3>
          <p>
            Bu müzik editörü şu anda masaüstü deneyimi için optimize edilmiştir. 
            En iyi deneyim için lütfen bir bilgisayar veya tablet kullanın.
          </p>
          <p className="coming-soon">
            📲 Mobil uyumlu versiyon çok yakında!
          </p>
        </div>
        
        <div className="mobile-warning-actions">
          <button 
            className="continue-anyway-btn"
            onClick={() => setIsVisible(false)}
          >
            Yine de Devam Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWarning;
