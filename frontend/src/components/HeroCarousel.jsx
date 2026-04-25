import { useState, useEffect, useCallback } from 'react';

const HeroCarousel = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '400px',
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      backgroundColor: '#1a1a2e'
    }}>
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
                objectFit: 'contain',
                objectPosition: 'center',
                backgroundColor: '#1a1a2e'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              padding: '30px 20px 20px',
              textAlign: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', textShadow: '1px 1px 2px black' }}>{image.title}</h2>
              <p style={{ margin: '5px 0 0', fontSize: '14px', textShadow: '1px 1px 2px black' }}>{image.description}</p>
              <button 
                onClick={(e) => handleButtonClick(e, image)}
                style={{
                  marginTop: '12px',
                  padding: '8px 20px',
                  backgroundColor: '#e67e22',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
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
        onClick={prevSlide}
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        ❮
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        ❯
      </button>

      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 10
      }}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? '#e67e22' : 'rgba(255,255,255,0.6)',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;