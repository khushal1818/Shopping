import React from "react";
import "./DescriptionBox.css";

const DescriptionBox = () => {
  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviwes (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>
          Vistora is an online fashion platform that brings you premium styles,
          casual wear, and everyday essentials. It serves as a modern marketplace
          offering curated collections for women, men, and kids with the promise of
          &ldquo;Style for Everyone.&rdquo; Enjoy seamless browsing, secure shopping,
          and fast delivery.
        </p>
        <p>
          Each Vistora product is showcased with detailed descriptions, high-resolution
          images, competitive prices, and available size options to help you find the
          perfect fit.
        </p>
      </div>
    </div>
  );
};

export default DescriptionBox;
