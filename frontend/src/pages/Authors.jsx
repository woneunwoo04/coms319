import React from "react";
import "../styles/styles-member1.css";

function Authors() {
  return (
    <div className="authors-page">
      <div className="page-header">
        <h1>About the Authors</h1>
        <p className="page-subtitle">Meet the team behind Cafe Delight</p>
      </div>

      <div className="authors-container">
        <div className="author-card">
          <div className="author-avatar">
            <img src="/assets/images/Carolina.png" alt="Carolina Benitez" />
          </div>
          <h2>Carolina Benitez</h2>
          <p className="author-email">cbenitez@iastate.edu</p>

        </div>

        <div className="author-card">
          <div className="author-avatar">
            <img src="/assets/images/Eunwoo.PNG" alt="Eunwoo Won" />
          </div>
          <h2>Eunwoo Won</h2>
          <p className="author-email">eunwoo07@iastate.edu</p>

        </div>
      </div>

      <div className="project-info">
        <h2>About Cafe Delight</h2>
        <p>
          Cafe Delight is a catalog of coffee and dessert products offered by our cafe. 
          It helps customers browse different drinks and desserts, read their descriptions, 
          and learn about prices and ingredients.
        </p>
        <p>
          The project was built using React, HTML, CSS, and JavaScript, with product data 
          dynamically loaded from a JSON file.
        </p>
      </div>
    </div>
  )
}

export default Authors
