import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Navbar from './Components/Navbar/Navbar';
import Product from './Pages/Product';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Profile from './Pages/Profile';
import Checkout from './Pages/Checkout';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';

// In-router reload redirect handler that ensures genuine page reloads preserve user session and shop navigation
const ReloadHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once on initial application load; do not interfere with SPA navigation or re-renders
    if (hasChecked.current) return;
    hasChecked.current = true;

    const navEntries = window.performance?.getEntriesByType?.('navigation');
    const isReload = (navEntries && navEntries.length > 0)
      ? navEntries[0].type === 'reload'
      : window.performance?.navigation?.type === 1;

    // Preserve special and protected routes on reload so users stay on their page
    const preserveRoutes = ['/profile', '/checkout', '/cart', '/login', '/signup'];
    if (isReload && location.pathname !== '/' && !preserveRoutes.includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [navigate, location.pathname]);

  return null;
};

const App = () => {
  return (
    <div>
    <BrowserRouter>
      <ReloadHandler />
      <Navbar />

      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/shop" element={<Shop />} />
        <Route
          path="/mens"
          element={<ShopCategory banner={men_banner} category="men" />}
        />
        <Route
          path="/womens"
          element={<ShopCategory banner={women_banner} category="women" />}
        />
        <Route
          path="/kids"
          element={<ShopCategory banner={kid_banner} category="kid" />}
        />
        <Route path="/product/:productId" element={<Product />}>
          <Route path=':productId' element={<Product />} />
        </Route>
        <Route path='/cart' element={<Cart/>} />
        <Route path='/login' element={<LoginSignup/>} />
        <Route path='/signup' element={<LoginSignup/>} />
        <Route 
          path='/profile' 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/checkout' 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Footer />
    </BrowserRouter>
    </div>
  );
};

export default App;
