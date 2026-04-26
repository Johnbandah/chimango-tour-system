import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeroCarousel from '../components/HeroCarousel';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { API_URL } from '../config';

const HomePage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const carouselImages = [
    {
      url: '/images/viphya-hike.jpg',
      title: 'Hiking Adventure',
      description: 'Explore the beautiful Viphya Plateau',
      activityName: 'Viphya Plateau Hike'
    },
    {
      url: '/images/livingstonia.jpg',
      title: 'Cultural Experience',
      description: 'Visit Livingstonia Mission',
      activityName: 'Livingstonia Cultural Heritage Tour'
    },
    {
      url: '/images/kayaking.jpg',
      title: 'Kayaking on Lake Malawi',
      description: 'Experience the crystal clear waters',
      activityName: 'Kayaking on Lake Malawi'
    },
    {
      url: '/images/safari.jpg',
      title: 'Wildlife Safari',
      description: 'See elephants and hippos at Liwonde',
      activityName: 'Liwonde National Park Safari'
    },
    {
      url: '/images/likoma-island.jpg',
      title: 'Island Paradise',
      description: 'Visit beautiful Likoma Island',
      activityName: 'Likoma Island Boat Tour'
    },
    {
      url: '/images/mulanje-mountain.jpg',
      title: 'Mountain Trekking',
      description: 'Climb Mulanje Mountain',
      activityName: 'Mulanje Mountain Trek'
    }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/activities`);
      setActivities(res.data.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  // FIXED: This now redirects to the specific activity
  const handleCarouselClick = async (carouselImage) => {
    console.log('Carousel clicked:', carouselImage.activityName);
    
    try {
      // Fetch all activities from database
      const res = await axios.get(`${API_URL}/api/activities`);
      const allActivities = res.data;
      
      // Find the activity that matches the carousel image name (case-insensitive)
      const matchedActivity = allActivities.find(
        activity => activity.name.toLowerCase().trim() === carouselImage.activityName.toLowerCase().trim()
      );
      
      if (matchedActivity) {
        console.log('Found activity:', matchedActivity.name);
        // Navigate directly to the activity detail on activities page
        navigate(`/activities?book=${matchedActivity._id}`);
      } else {
        console.log('No match found, going to activities page');
        navigate('/activities');
      }
    } catch (error) {
      console.error('Error finding activity:', error);
      navigate('/activities');
    }
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  const closeModal = () => {
    setSelectedActivity(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>⏳</div>
          <h2>Loading Activities...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <HeroCarousel images={carouselImages} onImageClick={handleCarouselClick} />

      <div style={{
        backgroundColor: '#e67e22',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px',
        width: '100%'
      }}>
        <h1 style={{ margin: 0, fontSize: '36px' }}>Welcome to Chimango Tour</h1>
        <p style={{ margin: '16px 0 0', fontSize: '18px' }}>Discover the beauty of Malawi with us - Your adventure starts here!</p>
      </div>

      <div style={{ padding: '2rem', width: '100%', backgroundColor: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Popular Activities in Malawi</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Click on any activity to see details and photos
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {activities.map((activity) => (
            <div
              key={activity._id}
              onClick={() => handleActivityClick(activity)}
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
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivityClick(activity);
                    }}
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
          ))}
        </div>
      </div>

      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={closeModal}
          user={user}
        />
      )}
    </div>
  );
};

export default HomePage;