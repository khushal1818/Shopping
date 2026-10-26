
import React, { useState, useContext } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../Context/ShopContext';

const ProductDisplay = ({ product }) => {
    const [selectedSize, setSelectedSize] = useState('');

    const context = useContext(ShopContext);
    const addToCart = context?.addToCart;

    if (!product) return null;

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        if (addToCart) {
            addToCart(product.id);
        }
    };

    return (
        <div className="productdisplay">
            <div className="productdisplay-left">
                <div className="productdisplay-im-list">
                    {[1, 2, 3, 4].map((item) => (
                        <img
                            key={item}
                            src={product.image}
                            alt={product.name}
                        />
                    ))}
                </div>

                <div className="productdisplay-img">
                    <img
                        className="productdisplay-main-img"
                        src={product.image}
                        alt={product.name}
                    />
                </div>
            </div>

            <div className="productdisplay-right">
                <h1>{product.name}</h1>

                <div className="product-right-star">
                    {[1, 2, 3, 4].map((item) => (
                        <img key={item} src={star_icon} alt="Star" />
                    ))}
                    <img src={star_dull_icon} alt="Star" />
                    <p>(122)</p>
                </div>

                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-old">
                        ${product.old_price}
                    </div>
                    <div className="productdisplay-right-price-new">
                        ${product.new_price}
                    </div>
                </div>

                <p className="productdisplay-description">
                    A lightweight, usually knitted, pullover shirt,
                    close-fitting and with a round neckline and short
                    sleeves, worn as an undershirt or outer garment.
                </p>

                <div className="productdisplay-right-size">
                    <h3>Select Size</h3>

                    <div className="productdisplay-sizes">
                        {sizes.map((size) => (
                            <button
                                type="button"
                                key={size}
                                className={
                                    selectedSize === size ? 'selected' : ''
                                }
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    className="productdisplay-cart"
                    onClick={handleAddToCart}
                >
                    ADD TO CART
                </button>

                <p className="productdisplay-category">
                    <span>Category:</span> {product.category}
                </p>

                <p className="productdisplay-category">
                    <span>Tags:</span> Modern, Latest
                </p>
            </div>
        </div>
    );
};

export default ProductDisplay;
