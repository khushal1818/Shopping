import React, { useContext, useState, useRef, useEffect } from 'react'
import './Navbar.css'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import { useAuth } from '../../Context/AuthContext'

const Navbar = () => {

    const [menu, setmenu] = useState("shop");
    const [menuOpen, setMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const { getTotalCartItems, refreshShop } = useContext(ShopContext);
    const { user, logout } = useAuth();
    const menuRef = useRef();
    const userDropdownRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();

    const isShopRoute = (pathname) => {
        return pathname === '/' || pathname === '/shop';
    };

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // Close menu on route change / link click
    const handleLinkClick = (menuName) => {
        setmenu(menuName);
        closeMenu();
    };

    // Handle logout action
    const handleLogout = async () => {
        setUserDropdownOpen(false);
        closeMenu();
        await logout();
        navigate('/', { replace: true });
    };

    // Handle Vistora navigation and refresh
    const handleVistoraClick = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        closeMenu();

        if (isShopRoute(location.pathname)) {
            // Already on Shop page: refresh content
            if (refreshShop) {
                refreshShop();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Navigating from another page: open Shop page
            setmenu("shop");
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Keep active menu synced with current route
    useEffect(() => {
        const path = location.pathname;
        if (path === '/' || path === '/shop') {
            setmenu("shop");
        } else if (path.startsWith('/mens')) {
            setmenu("mens");
        } else if (path.startsWith('/womens')) {
            setmenu("womens");
        } else if (path.startsWith('/kids')) {
            setmenu("kids");
        } else {
            setmenu("");
        }
    }, [location.pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
    const userFirstName = user?.name ? user.name.trim().split(' ')[0] : 'Account';

    return (
        <div className='navbar' ref={menuRef}>
            <Link 
                to="/" 
                className="nav-logo" 
                onClick={handleVistoraClick}
                aria-label="Vistora"
                data-testid="vistora-logo"
            >
                <img src={logo} alt="Vistora" />
                <p>Vistora</p>
            </Link>

            <div className={`nav-menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <ul className={`nav-menu ${menuOpen ? 'nav-menu-visible' : ''}`}>
                <li onClick={handleVistoraClick}>
                    <Link 
                        style={{ textDecoration: 'none' }} 
                        to='/'
                        onClick={(e) => {
                            if (isShopRoute(location.pathname)) {
                                e.preventDefault();
                                handleVistoraClick(e);
                            }
                        }}
                    >
                        Shop
                    </Link>
                    {menu === "shop" ? <hr /> : <></>}
                </li>
                <li onClick={() => { handleLinkClick("mens") }}><Link style={{ textDecoration: 'none' }} to='/mens'>Men</Link>{menu === "mens" ? <hr /> : <></>}</li>
                <li onClick={() => { handleLinkClick("womens") }}><Link style={{ textDecoration: 'none' }} to='/womens'>Women</Link>{menu === "womens" ? <hr /> : <></>}</li>
                <li onClick={() => { handleLinkClick("kids") }}><Link style={{ textDecoration: 'none' }} to='/kids'>Kids</Link>{menu === "kids" ? <hr /> : <></>}</li>
                
                {/* Mobile-only profile items when logged in */}
                {user && (
                    <li className="mobile-only-nav-item" onClick={closeMenu}>
                        <Link style={{ textDecoration: 'none' }} to='/profile'>My Profile ({userFirstName})</Link>
                    </li>
                )}
                {user && (
                    <li className="mobile-only-nav-item" onClick={handleLogout}>
                        <span style={{ color: '#ff4141', cursor: 'pointer', fontSize: '18px' }}>Logout</span>
                    </li>
                )}
            </ul>

            <div className="nav-login-cart">
                {user ? (
                    <div className="nav-user-container" ref={userDropdownRef}>
                        <button 
                            className="nav-user-btn"
                            onClick={() => setUserDropdownOpen(prev => !prev)}
                            aria-expanded={userDropdownOpen}
                            aria-haspopup="true"
                            aria-label="User Account Menu"
                        >
                            <span className="nav-user-avatar">{userInitial}</span>
                            <span className="nav-user-name">{userFirstName}</span>
                            <span className={`nav-user-chevron ${userDropdownOpen ? 'rotated' : ''}`}>▼</span>
                        </button>

                        {userDropdownOpen && (
                            <div className="nav-user-dropdown" role="menu">
                                <div className="dropdown-user-header">
                                    <p className="dropdown-name">{user.name}</p>
                                    <p className="dropdown-email">{user.email}</p>
                                </div>
                                <hr className="dropdown-separator" />
                                <Link 
                                    to="/profile" 
                                    className="dropdown-link" 
                                    onClick={() => setUserDropdownOpen(false)}
                                    role="menuitem"
                                >
                                    <span className="dropdown-icon">👤</span> My Profile & Orders
                                </Link>
                                <button 
                                    className="dropdown-link logout-action"
                                    onClick={handleLogout}
                                    role="menuitem"
                                >
                                    <span className="dropdown-icon">🚪</span> Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to='/login'><button>Login</button></Link>
                )}

                <Link to='/cart'><img src={cart_icon} alt="Cart" /></Link>
                <div className="nav-cart-count">{getTotalCartItems()}</div>
            </div>
        </div>
    )
}

export default Navbar