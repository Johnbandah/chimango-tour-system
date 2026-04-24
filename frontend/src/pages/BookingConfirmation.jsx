import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const BookingConfirmation = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Location state:', location.state);
    
    if (location.state && location.state.booking) {
      setBooking(location.state.booking);
      setLoading(false);
    } else {
      const savedBooking = sessionStorage.getItem('lastBooking');
      if (savedBooking) {
        setBooking(JSON.parse(savedBooking));
        setLoading(false);
      } else {
        setTimeout(() => {
          navigate('/');
        }, 3000);
        setLoading(false);
      }
    }
  }, [location, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('confirmation-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation - ${booking?.bookingCode || 'Chimango Tour'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #e67e22; padding-bottom: 20px; margin-bottom: 30px; }
            .booking-code { background-color: #e67e22; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total { font-size: 24px; font-weight: bold; color: #e67e22; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="footer">
            <p>Chimango Tour - Discover the beauty of Malawi</p>
            <p>Contact: info@chimangotour.com | +265 123 456 789</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const shareOnWhatsApp = () => {
    const activity = booking.selectedActivities?.[0]?.activity;
    const message = `🎉 Booking Confirmation - Chimango Tour%0A%0A` +
      `Booking Code: ${booking.bookingCode}%0A` +
      `Activity: ${activity?.name}%0A` +
      `Date: ${new Date(booking.selectedActivities[0]?.selectedDate).toLocaleDateString()}%0A` +
      `Days: ${booking.selectedActivities[0]?.numberOfDays}%0A` +
      `People: ${booking.selectedActivities[0]?.numberOfPeople}%0A` +
      `Total: USD ${booking.totalPrice?.toLocaleString()}%0A%0A` +
      `Thank you for choosing Chimango Tour! 🌍`;
    
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <h2>Loading confirmation...</h2>
        <p>Please wait while we prepare your booking details.</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <h2>No Booking Found</h2>
        <p>Redirecting you to the homepage...</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Go to Home
        </button>
      </div>
    );
  }

  const activity = booking.selectedActivities?.[0]?.activity;

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button onClick={handleDownloadPDF} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', margin: '0 5px', fontSize: '14px' }}>📄 Download PDF</button>
          <button onClick={handlePrint} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', margin: '0 5px', fontSize: '14px' }}>🖨️ Print</button>
          <button onClick={shareOnWhatsApp} style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', margin: '0 5px', fontSize: '14px' }}>📱 Share on WhatsApp</button>
          <button onClick={() => navigate('/bookings')} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', margin: '0 5px', fontSize: '14px' }}>📋 My Bookings</button>
        </div>

        <div id="confirmation-content" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div className="header" style={{ textAlign: 'center', borderBottom: '2px solid #e67e22', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ color: '#2c3e50', margin: 0 }}>Booking Confirmed!</h1>
            <p style={{ color: '#666', marginTop: '10px' }}>Thank you for choosing Chimango Tour</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#2ecc71', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: '40px', color: 'white' }}>✓</span>
            </div>
          </div>

          <div className="booking-code" style={{ backgroundColor: '#e67e22', color: 'white', padding: '15px', textAlign: 'center', borderRadius: '8px', margin: '20px 0' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>Your Booking Code</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{booking.bookingCode}</p>
          </div>

          <div className="details">
            <h3 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Booking Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <tbody>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '40%' }}>Activity Name:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{activity?.name || 'Activity'}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Location:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{activity?.location || 'N/A'}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Travel Date:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.selectedActivities[0]?.selectedDate ? new Date(booking.selectedActivities[0].selectedDate).toLocaleDateString() : 'N/A'}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Number of Days:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.selectedActivities[0]?.numberOfDays || 1}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Number of People:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.selectedActivities[0]?.numberOfPeople || 1}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Airport Pickup:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.airportPickup ? 'Yes' : 'No'}</td></tr>
                {booking.airportPickup && (
                  <>
                    <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Flight Number:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.flightNumber || 'N/A'}</td></tr>
                    <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Arrival Time:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.arrivalTime || 'N/A'}</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="details" style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Customer Information</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <tbody>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold', width: '40%' }}>Full Name:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.personalDetails?.fullName || user?.fullName}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Email:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.personalDetails?.email || user?.email}</td></tr>
                <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Phone:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.personalDetails?.phone || 'N/A'}</td></tr>
                {booking.personalDetails?.passportNumber && (
                  <tr><td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Passport Number:</td><td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{booking.personalDetails.passportNumber}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {booking.specialRequests && (
            <div className="details" style={{ marginTop: '20px' }}>
              <h3 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Special Requests</h3>
              <p style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '10px' }}>{booking.specialRequests}</p>
            </div>
          )}

          <div className="total" style={{ textAlign: 'center', margin: '30px 0', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>Total Amount</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>USD {booking.totalPrice?.toLocaleString() || 0}</p>
          </div>

          <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>Important Information</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#155724' }}>
              <li>Please arrive 15 minutes before the scheduled time</li>
              <li>Present this confirmation (digital or printed) at the meeting point</li>
              <li>For airport pickup, look for our representative with a "Chimango Tour" sign</li>
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>For emergencies, call +265 123 456 789</li>
            </ul>
          </div>

          <div className="footer" style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '12px', color: '#666' }}>
            <p>Chimango Tour - Discover the beauty of Malawi</p>
            <p>Email: info@chimangotour.com | Phone: +265 123 456 789</p>
            <p>Booking Date: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;