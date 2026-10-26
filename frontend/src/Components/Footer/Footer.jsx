import React, { useContext } from 'react'
import './Footer.css'
import footer_logo from '../Assets/logo_big.png'
import instagram_icon from '../Assets/instagram_icon.png'
import pintester_icon from '../Assets/pintester_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'

const Footer = () => {
  const { refreshShop } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleVistoraClick = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const isShopRoute = location.pathname === '/' || location.pathname === '/shop';
    if (isShopRoute) {
      if (refreshShop) {
        refreshShop();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className='footer'>
        <div className="footer-brand-section">
            <Link 
                to="/" 
                className="footer-logo" 
                onClick={handleVistoraClick}
                aria-label="Vistora"
                style={{ textDecoration: 'none' }}
            >
                <img src={footer_logo} alt="Vistora" />
                <p>Vistora</p>
            </Link>
            <p className="footer-tagline">Style for Everyone.</p>
        </div>
        <ul className='footer-links'>
            <li>Company</li>
            <li>Products</li>
            <li>Offices</li>
            <li>About</li>
            <li>Contact</li>
        </ul>
        <div className="footer-social-icon">
            <div className="footer-icons-container">
                <img src={instagram_icon} alt="" />
            </div>
            <div className="footer-icons-container">
                <img src={pintester_icon} alt="" />
            </div>
            <div className="footer-icons-container">
                <img src={whatsapp_icon} alt="" />
            </div>
        </div>
        <div className="footer-copyright">
            <hr />
            <p>Copyright @ 2026 - All Right Reserved.</p>
        </div>
    </div>
  )
}

export default Footer