import { useState } from 'react';
import ImageGalleryModal from './ImageGalleryModal';

const ActivityCard = ({ activity, onBookClick }) => {
  const [showGallery, setShowGallery] = useState(false);

  const handleCardClick = () => {
    onBookClick(activity);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowGallery(true);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    onBookClick(activity);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <img 
          src={activity.mainImage} 
          alt={activity.name}
          onClick={handleImageClick}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
        />
        <div style={{ padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{activity.name}</h3>
          <p style={{ color: '#e74c3c', margin: '0 0 0.5rem 0', fontSize: '14px' }}>📍 {activity.location}</p>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '0.5rem' }}>
            {activity.description?.substring(0, 80)}...
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e67e22' }}>
              USD {activity.pricePerDay}
            </span>
            <button
              onClick={handleBookClick}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2980b9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3498db';
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && (
        <ImageGalleryModal
          activity={activity}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  );
};

export default ActivityCard;