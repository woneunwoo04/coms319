import React, { useState, useEffect } from "react";
import { api } from "../api/api";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFaqs() {
      setLoading(true);
      setError("");
      try {
        const data = await api("/faq");
        setFaqs(data);
      } catch (err) {
        console.error("❌ FAQ load failed:", err);
        setError("We couldn’t load FAQs. Please try again later.");
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4 text-3xl font-bold text-[#3c2f2f]">
        Frequently Asked Questions ☕
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : faqs.length === 0 ? (
        <p className="text-center text-gray-500">No FAQs yet.</p>
      ) : (
        <div className="accordion" id="faqAccordion">
          {faqs.map((faq, index) => (
            <div className="accordion-item" key={index}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className={`accordion-button ${
                    index === 0 ? "" : "collapsed"
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={`collapse${index}`}
                >
                  {faq.question}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse ${
                  index === 0 ? "show" : ""
                }`}
                aria-labelledby={`heading${index}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body text-gray-700">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


