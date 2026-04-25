import { useState, useEffect, useCallback } from 'react';

const HeroCarousel = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, images.length]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      nextSlide();
    }
    if (touchStart - touchEnd < -50) {
      // Swipe right
      prevSlide();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleImageClick = () => {
    if (onImageClick && images[currentIndex]) {
      onImageClick(images[currentIndex]);
    }
  };

  const handleButtonClick = (e, image) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(image);
    }
  };

  return (
    <div 
      className="hero-carousel"
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(300px, 50vw, 500px)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backgroundColor: '#1a1a2e'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{
        display: 'flex',
        transition: 'transform 0.5s ease-in-out',
        transform: `translateX(-${currentIndex * 100}%)`,
        height: '100%'
      }}>
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => handleImageClick()}
            style={{
              minWidth: '100%',
              height: '100%',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              backgroundColor: '#1a1a2e'
            }}
          >
            <img
              src={image.url}
              alt={image.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              padding: 'clamp(15px, 5vw, 30px) clamp(15px, 4vw, 20px)',
              textAlign: 'center'
            }}>
              <h2 className="hero-carousel-title" style={{ 
                margin: 0, 
                fontSize: 'clamp(18px, 5vw, 24px)',
                textShadow: '1px 1px 2px black'
              }}>
                {image.title}
              </h2>
              <p className="hero-carousel-description" style={{ 
                margin: '5px 0 0', 
                fontSize: 'clamp(12px, 3vw, 14px)',
                textShadow: '1px 1px 2px black',
                display: 'block'
              }}>
                {image.description}
              </p>
              <button 
                className="hero-carousel-button"
                onClick={(e) => handleButtonClick(e, image)}
                style={{
                  marginTop: 'clamp(8px, 3vw, 12px)',
                  padding: 'clamp(6px, 2vw, 8px) clamp(16px, 4vw, 20px)',
                  backgroundColor: '#e67e22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  minHeight: '36px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d35400'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#e67e22'}
              >
                Book Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="hero-carousel-nav"
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: 'clamp(10px, 3vw, 16px)',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 'clamp(32px, 6vw, 40px)',
          height: 'clamp(32px, 6vw, 40px)',
          fontSize: 'clamp(16px, 4vw, 20px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}
      >
        ❮
      </button>

      <button
        className="hero-carousel-nav"
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: 'clamp(10px, 3vw, 16px)',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 'clamp(32px, 6vw, 40px)',
          height: 'clamp(32px, 6vw, 40px)',
          fontSize: 'clamp(16px, 4vw, 20px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}
      >
        ❯
      </button>

      <div style={{
        position: 'absolute',
        bottom: 'clamp(10px, 2vw, 15px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'clamp(8px, 2vw, 10px)',
        zIndex: 10
      }}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: 'clamp(8px, 2vw, 10px)',
              height: 'clamp(8px, 2vw, 10px)',
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? '#e67e22' : 'rgba(255,255,255,0.6)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              minHeight: 'auto'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;