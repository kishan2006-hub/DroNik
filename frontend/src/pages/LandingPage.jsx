import React, { useState, useEffect } from 'react';
import NikImage from '../assets/Nik_Image.jpeg';
import NikScanner from '../assets/Nik_Scanner12.jpeg';
import NikWorkshop from '../assets/Nik_Workshop.jpeg';
import NikVideo from '../assets/Nik_Video.mp4';
import { API_BASE_URL, TOTAL_SEATS } from '../config';

function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', state: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [bookings, setBookings] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showQRInModal, setShowQRInModal] = useState(false);
  const [screenshot, setScreenshot] = useState(null);


  const slots = [
    { dates: '15–16 June' },
    { dates: '19–20 June' }
  ];

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`);
      const data = await response.json();
      if (response.ok) setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookClick = (slotDates) => {
    setSelectedSlot(slotDates);
    setShowModal(true);
  };

  const getRemainingSeats = (slotDates) => {
    const count = bookings.filter(b => b.slot === slotDates).length;
    return TOTAL_SEATS - count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('name', formData.name);
    formDataToSubmit.append('phone', formData.phone);
    formDataToSubmit.append('state', formData.state);
    formDataToSubmit.append('city', formData.city);
    formDataToSubmit.append('slot', selectedSlot);
    if (screenshot) {
      formDataToSubmit.append('screenshot', screenshot);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        body: formDataToSubmit
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('SUCCESS');
        fetchBookings(); // Refresh seats
        
        const message = `Hello! I want to book a slot for the FPV Drone Workshop.\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*City:* ${formData.city}\n*State:* ${formData.state}\n*Slot:* ${selectedSlot}\n\n*Payment Screenshot:* Uploaded (Verify on Dashboard)`;
        const whatsappUrl = `https://wa.me/917069722631?text=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
          window.location.href = whatsappUrl;
          setShowModal(false);
          setStatus('');
          setFormData({ name: '', phone: '', state: '', city: '' });
          setScreenshot(null);
          setShowQRInModal(false);
        }, 1500);
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* HERO */}
      <div className="hero">
        <div className="container">
          <h1>FPV DRONE WORKSHOP</h1>
          <p>LEARN • FLY • SHOOT • DJI AVATA 360 EDIT</p>
          <a href="#slots" className="btn">BOOK YOUR SLOT</a>
        </div>
      </div>

      {/* MID IMAGE */}
      <div className="mid-image-container container">
        <img src={NikImage} alt="Workshop" className="mid-image" />
      </div>

      {/* SLOTS */}
      <section id="slots" className="container">
        <h2 className="section-title">Choose Your Slot</h2>
        <div className="slots-grid">
          {slots.map((slot, index) => {
            const remaining = getRemainingSeats(slot.dates);
            const isFull = remaining <= 0;
            return (
              <div key={index} className={`slot-card ${isFull ? 'full' : ''}`}>
                <h3>{slot.dates}</h3>
                <p style={{ color: isFull ? '#ff4444' : 'var(--text-muted)' }}>
                  {isFull ? 'SOLD OUT' : `${remaining} Seats Available`}
                </p>
                <button 
                  className="btn" 
                  disabled={isFull}
                  onClick={() => handleBookClick(slot.dates)}
                  style={{ 
                    background: isFull ? '#333' : 'var(--primary)',
                    boxShadow: isFull ? 'none' : '0 10px 30px rgba(255, 106, 0, 0.3)',
                    cursor: isFull ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isFull ? 'FULLY BOOKED' : 'Book Now'}
                </button>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
          New slots will be added based on demand.
        </p>
      </section>

      {/* WHAT YOU GET */}
      <section className="container">
        <h2 className="section-title">What You Get</h2>
        <div className="features-list">
          {['Stay', 'Food', 'Pickup', 'Simulator', 'Flying', 'Helipad Practice', 'Shooting', 'DJI AVATA 360 EDIT'].map(f => (
            <span key={f} className="feature-tag">{f}</span>
          ))}
        </div>
      </section>

      {/* LOCATION */}
      <section className="container" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Location</h2>
        <div className="pricing-box" style={{ border: '1px solid #333' }}>
          <h3>Navsari, Gujarat</h3>
          <p style={{ color: '#888', marginTop: '10px' }}>Pickup & drop from city included</p>
        </div>
      </section>

      {/* PRICING */}
      <section className="container">
        <h2 className="section-title">Pricing</h2>
        <div className="pricing-box">
          <h3>Full Workshop</h3>
          <div className="price">₹10,000</div>
          <p>Book with ₹2,000 advance</p>
          <button className="btn" style={{ marginTop: '30px' }} onClick={() => setShowScanner(true)}>Secure Seat</button>
        </div>
      </section>

      {/* PREVIOUS WORKSHOP */}
      <section className="container workshop-section">
        <h2 className="section-title">Previous Workshop</h2>
        <div className="workshop-gallery">
          <div className="gallery-item">
            <img src={NikWorkshop} alt="Previous Workshop" className="gallery-img" />
          </div>
          <div className="gallery-item">
            <video autoPlay muted loop playsInline controls className="gallery-video">
              <source src={NikVideo} type="video/mp4" />
              Your browser do   es not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* SCANNER MODAL */}
      {showScanner && (
        <div className="modal-overlay" onClick={() => setShowScanner(false)}>
          <div className="modal-content scanner-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Scan to Pay Advance</h2>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
              <img src={NikScanner} alt="Payment Scanner" style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Pay ₹2,000 to secure your seat. Take a screenshot of the payment and share it on WhatsApp (+91 70697 22631).
            </p>
            <button className="btn" style={{ width: '100%' }} onClick={() => setShowScanner(false)}>Close</button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {status === 'SUCCESS' ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#4caf50' }}>Success!</h2>
                <p>We'll contact you shortly.</p>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: '20px' }}>Booking for {selectedSlot}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* QR SECTION */}
                  <div style={{ marginBottom: '20px' }}>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ width: '100%', background: showQRInModal ? '#333' : 'var(--primary)', marginBottom: '15px', fontSize: '0.9rem' }}
                      onClick={() => setShowQRInModal(!showQRInModal)}
                    >
                      {showQRInModal ? 'Hide Payment QR' : 'Step 1: Pay Advance (View QR)'}
                    </button>
                    
                    {showQRInModal && (
                      <div style={{ background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', textAlign: 'center' }}>
                        <img src={NikScanner} alt="QR" style={{ width: '100%', maxWidth: '250px', borderRadius: '10px' }} />
                        <p style={{ color: '#000', fontSize: '0.8rem', marginTop: '10px', fontWeight: 'bold' }}>
                          Scan & Pay ₹2,000
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Step 2: Upload Payment Screenshot</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={(e) => setScreenshot(e.target.files[0])}
                      style={{ padding: '10px' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                      Please upload the screenshot of your ₹2,000 payment.
                    </p>
                  </div>

                  <div className="modal-buttons">
                    <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>
                      {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                    <button type="button" className="btn" style={{ background: '#333', boxShadow: 'none', flex: 1 }} onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="main-footer">
        <p>© 2026 FPV Drone Workshop. Ready to fly?</p>
      </footer>
    </div>
  );
}

export default LandingPage;
