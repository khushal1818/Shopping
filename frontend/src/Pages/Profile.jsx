import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import './CSS/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setProfileData(data.profile);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const displayName = profileData?.name || user?.name || 'Vistora Customer';
  const displayEmail = profileData?.email || user?.email || 'N/A';
  const memberDate = profileData?.memberSince
    ? new Date(profileData.memberSince).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  if (loadingProfile) {
    return (
      <div className="profile-page">
        <div className="profile-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto', borderColor: '#ffcdd2', borderTopColor: '#ff4141' }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-title">
            <h2>{displayName}</h2>
            <p className="profile-email">{displayEmail}</p>
            <span className="profile-badge">Verified Customer</span>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <h3>Account Information</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{displayName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">{displayEmail}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Membership Status</span>
                <span className="info-value">Active Member</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">{memberDate}</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Recent Orders</h3>
            <div className="orders-empty">
              <div className="empty-icon">🛍️</div>
              <p>No recent orders found.</p>
              <button className="shop-now-btn" onClick={() => navigate('/')}>
                Start Shopping
              </button>
            </div>
          </div>

          <div className="profile-actions">
            <button className="profile-logout-btn" onClick={handleLogout}>
              Log Out of Vistora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
