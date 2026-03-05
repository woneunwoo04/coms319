import { useEffect, useState } from "react";

export default function About() {
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/authors.json")
      .then(res => res.json())
      .then(data => setAuthors(data.authors))
      .catch(err => {
        console.error("Error loading authors:", err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>Unable to load authors</h4>
          <p>Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Meet the Team</h2>

      <div className="row">
        {authors.map(a => (
          <div className="col-md-6 text-center mb-4" key={a.id}>
            <img
              src={a.image}
              alt={a.alt}
              style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
            />
            <h4 className="mt-3">{a.name}</h4>
            <a href={`mailto:${a.email}`}>{a.email}</a>
            <p className="mt-2">{a.bio}</p>
            <p className="fw-bold">{a.course}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
