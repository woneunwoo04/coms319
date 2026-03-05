import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCart } from "../context/CartContext";
import { api } from "../api/api";
import toast from "react-hot-toast";

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState("hot");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [reviewStats, setReviewStats] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const { add } = useCart();
  const typeKeyMap = {
    hot: "hot",
    cold: "cold",
    dessert: "dessert",
  };

  const categories = [
    { key: "hot", label: "☕ Hot" },
    { key: "cold", label: "🧊 Cold" },
    { key: "dessert", label: "🍰 Desserts" },
  ];

  const keyMap = {
    hot: "hotDrinks",
    cold: "ColdDrinks",
    dessert: "Desserts",
  };

  const handleAddToCart = async (item, typeKey) => {
    try {
      const match = await api("/products/resolve", {
        method: "POST",
        body: JSON.stringify({ name: item.name, type: typeKey }),
      });
      add(match, 1);
      toast.success(`${match.name} added to cart`);
    } catch (err) {
      toast.error(err.message || "Failed to add item to cart");
    }
  };

  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    if (typeFromUrl && keyMap[typeFromUrl] && typeFromUrl !== category) {
      setCategory(typeFromUrl);
    } else if (!typeFromUrl && category !== "hot") {
      setCategory("hot");
    }
  }, [searchParams, category]);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:8080/api/all-products");
        if (!res.ok) throw new Error("Failed to fetch menu data");
        const data = await res.json();
        const key = keyMap[category];
        setItems(data[key] || []);
      } catch (err) {
        console.error("❌ Menu fetch error:", err);
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [category]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const reviews = await api("/reviews");
        const stats = reviews.reduce((acc, review) => {
          const key = review.product;
          if (!acc[key]) acc[key] = { count: 0, total: 0 };
          acc[key].count += 1;
          acc[key].total += Number(review.rating) || 0;
          return acc;
        }, {});
        const normalized = Object.fromEntries(
          Object.entries(stats).map(([key, val]) => [
            key,
            { count: val.count, average: val.total / val.count },
          ])
        );
        setReviewStats(normalized);
      } catch (err) {
        console.error("❌ Review fetch error:", err);
      }
    }
    fetchReviews();
  }, []);

  const filteredItems = items.filter((item) => {
    const search = searchTerm.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const matchesName = !search || item.name.toLowerCase().includes(search);
    const matchesMin = min === null || item.price >= min;
    const matchesMax = max === null || item.price <= max;
    const matchesSearchCategory = searchCategory === "all" || (item.type || category) === searchCategory;
    return matchesName && matchesMin && matchesMax && matchesSearchCategory;
  });

  return (
    <div style={{ backgroundColor: "#fff8e7", minHeight: "100vh", padding: "40px" }}>
      <h1 className="text-center mb-5" style={{ color: "#6b3e0f", fontWeight: "bold" }}>
        Café Delight Menu
      </h1>

      <div className="container mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-3 mt-1">
          <div className="col-md-3">
            <select
              className="form-control"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              <option value="hot">Hot drinks</option>
              <option value="cold">Cold drinks</option>
              <option value="dessert">Desserts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Buttons */}
      <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCategory(c.key);
              setSearchParams({ type: c.key });
              setOpenIndex(null);
            }}
            className={`btn ${
              category === c.key
                ? "btn-dark text-white"
                : "btn-outline-dark bg-light"
            }`}
            style={{
              borderRadius: "20px",
              fontWeight: "600",
              minWidth: "110px",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status"></div>
          <p className="mt-3">Brewing {category} menu...</p>
        </div>
      )}
      {error && <p className="text-center text-danger">{error}</p>}

      {/* Product Grid */}
      {!loading && !error && (
        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredItems.map((item, i) => (
              <div className="col" key={item.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <img
                    src={item.image || item.image_url}
                    className="card-img-top"
                    alt={item.name}
                    style={{
                      height: "200px",
                      objectFit: "cover",
                      borderTopLeftRadius: "1rem",
                      borderTopRightRadius: "1rem",
                    }}
                  />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold text-dark">{item.name}</h5>
                      <p className="card-text text-muted" style={{ minHeight: "60px" }}>
                        {item.description}
                      </p>
                      <p className="fw-semibold text-dark">${item.price.toFixed(2)}</p>
                      <p className="text-muted mb-2">
                        {reviewStats[item.name]
                          ? `⭐ ${reviewStats[item.name].average.toFixed(1)} (${reviewStats[
                              item.name
                            ].count} review${reviewStats[item.name].count > 1 ? "s" : ""})`
                          : "No reviews yet"}
                      </p>
                    </div>

                    <div>
                      <button
                        className="btn btn-outline-secondary w-100"
                        style={{
                          backgroundColor: "#d4a373",
                          color: "white",
                          border: "none",
                          fontWeight: "500",
                          marginBottom: "10px",
                        }}
                        onClick={() =>
                          setOpenIndex(openIndex === i ? null : i)
                        }
                      >
                        {openIndex === i ? "Hide Ingredients" : "View Ingredients"}
                      </button>
                      <button
                        className="btn btn-dark w-100"
                        onClick={() => handleAddToCart(item, typeKeyMap[category])}
                      >
                        Add to Cart
                      </button>

                      {openIndex === i && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <ul className="mb-0 text-secondary" style={{ fontSize: "0.9rem" }}>
                            {Array.isArray(item.ingredients)
                              ? item.ingredients.map((ing, idx) => (
                                  <li key={idx}>{ing}</li>
                                ))
                              : String(item.ingredients)
                                  .split(",")
                                  .map((ing, idx) => <li key={idx}>{ing.trim()}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

