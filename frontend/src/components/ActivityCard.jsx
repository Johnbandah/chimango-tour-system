import { useState, useEffect } from 'react';
import axios from 'axios';
import ImageGalleryModal from './ImageGalleryModal';
import StarRating from './StarRating';
import { API_URL } from '../config';

const ActivityCard = ({ activity, onBookClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalReviews: 0 });
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const hasMultipleImages = (activity.images && activity.images.length > 0) || activity.mainImage;

  useEffect(() => {
    fetchRating();
    checkWishlistStatus();
  }, [activity._id]);

  const fetchRating = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/activity/${activity._id}`);
      setRatingData({ 
        averageRating: res.data.averageRating, 
        totalReviews: res.data.totalReviews 
      });
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const checkWishlistStatus = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      try {
        const res = await axios.get(`${API_URL}/api/wishlist/check/${user.id}/${activity._id}`);
        setInWishlist(res.data.inWishlist);
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      alert('Please login to save to wishlist');
      window.location.href = '/login';
      return;
    }
    
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${user.id}/${activity._id}`);
        setInWishlist(false);
        alert('Removed from wishlist');
      } else {
        await axios.post(`${API_URL}/api/wishlist`, {
          userId: user.id,
          activityId: activity._id
        });
        setInWishlist(true);
        alert('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setShowGallery(true);
    }
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (onBookClick) {
      onBookClick(activity);
    }
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          onClick={handleImageClick}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '200px',
            cursor: hasMultipleImages ? 'pointer' : 'default'
          }}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {inWishlist ? '❤️' : '🤍'}
            </button>
          </div>
          <img
            src={activity.mainImage}
            alt={activity.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.5s ease'
            }}
          />
          
          {hasMultipleImages && (
            <>
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                📷 {(activity.images?.length || 0) + 1} photos
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease',
                color: 'white',
                fontWeight: 'bold'
              }}>
                View Gallery
              </div>
            </>
          )}
        </div>
        
        <div style={{ padding: '16px', flex: 1 }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#2c3e50' }}>{activity.name}</h3>
          
          <div style={{ marginBottom: '8px' }}>
            <StarRating rating={ratingData.averageRating} totalReviews={ratingData.totalReviews} />
          </div>
          
          <p style={{ color: '#e74c3c', margin: '0 0 8px 0', fontSize: '14px' }}>📍 {activity.location}</p>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
            {activity.description.length > 100 ? activity.description.substring(0, 100) + '...' : activity.description}
          </p>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '12px', color: '#888' }}>
            <span>⏱️ {activity.durationHours} hours</span>
            <span>👥 Min {activity.minPeople}</span>
            <span>🎯 {activity.difficulty}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '12px' }}>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22' }}>
                USD {activity.pricePerDay.toLocaleString()}
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}> / day</span>
              <br />
              <span style={{ fontSize: '11px', color: '#999' }}>
                + USD {activity.pricePerPerson.toLocaleString()} per person
              </span>
            </div>
            <button
              onClick={handleBookClick}
              style={{
                backgroundColor: '#e67e22',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#d35400';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#e67e22';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

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