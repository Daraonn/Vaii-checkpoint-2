"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./add.css";

export default function AddBook() {
  const router = useRouter();

  const [book, setBook] = useState({
    name: "",
    author: "",
    price: "",
    ISBN: "",
    image: "",
    about: "",
    language: "",
    year: "",
  });

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'success' or 'error'
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/genres");
        const data = await res.json();
        setGenres(data.genres);
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({
      ...prev,
      [name]: name === "price" || name === "year" ? Number(value) : value,
    }));
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      showMessage("Please upload a valid image file", "error");
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size should be less than 5MB", "error");
      return null;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setIsUploading(false);
      return data.url;
    } catch (err) {
      console.error(err);
      showMessage("Failed to upload image: " + err.message, "error");
      setIsUploading(false);
      return null;
    }
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setBook((prev) => ({ ...prev, image: imageUrl }));
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setBook((prev) => ({ ...prev, image: imageUrl }));
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = () => {
    setBook((prev) => ({ ...prev, image: "" }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showMessage = (text, type) => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 5000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...book, genres: selectedGenres }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add book");

      showMessage("✓ Book added successfully!", "success");
      setBook({
        name: "",
        author: "",
        price: "",
        ISBN: "",
        image: "",
        about: "",
        language: "",
        year: "",
      });
      setSelectedGenres([]);
      setImagePreview(null);
      setCurrentStep(1);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      showMessage("✗ " + err.message, "error");
    }
  };

  const isStep1Valid = book.name && book.author && book.ISBN;
  const isStep2Valid = book.price && book.year && book.language;
  const isStep3Valid = selectedGenres.length > 0;

  return (
    <div className="add-book-page">
      <div className="add-book-container">
        <div className="page-header">
          <h1>Add New Book</h1>
          <p className="page-subtitle">Fill in the details to add a new book to the store</p>
        </div>

        {msg && (
          <div className={`message-banner ${msgType}`}>
            {msg}
          </div>
        )}

        
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Basic Info</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Details</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Genres & Image</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span className="step-label">Review</span>
          </div>
        </div>

        <form onSubmit={submit} className="add-book-form">
          
          {currentStep === 1 && (
            <div className="form-section">
              <h2 className="section-title">📚 Basic Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Book Title *</label>
                  <input
                    name="name"
                    placeholder="Enter book title"
                    value={book.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Author *</label>
                  <input
                    name="author"
                    placeholder="Enter author name"
                    value={book.author}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>ISBN *</label>
                  <input
                    name="ISBN"
                    placeholder="Enter ISBN number"
                    value={book.ISBN}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Valid}
                  className="btn-primary"
                >
                  Next: Details →
                </button>
              </div>
            </div>
          )}

          
          {currentStep === 2 && (
            <div className="form-section">
              <h2 className="section-title">💰 Pricing & Publication Details</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={book.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Publication Year *</label>
                  <input
                    name="year"
                    type="number"
                    placeholder="YYYY"
                    value={book.year}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Language *</label>
                  <input
                    name="language"
                    placeholder="English, Spanish, etc."
                    value={book.language}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="about"
                    placeholder="Write a brief description of the book..."
                    value={book.about}
                    onChange={handleChange}
                    required
                    rows={5}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!isStep2Valid || !book.about}
                  className="btn-primary"
                >
                  Next: Genres & Image →
                </button>
              </div>
            </div>
          )}

          
          {currentStep === 3 && (
            <div className="form-section">
              <h2 className="section-title">🎨 Cover Image & Genres</h2>
              
              <div className="image-upload-section">
                <label className="section-label">Book Cover Image</label>
                
                {!imagePreview ? (
                  <div
                    className={`image-drop-zone ${isDragging ? "dragging" : ""}`}
                    onDrop={handleImageDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="uploading-state">
                        <div className="spinner"></div>
                        <p>Uploading...</p>
                      </div>
                    ) : (
                      <>
                        
                        
                        <h3>Upload Book Cover</h3>
                        <p>Drag & drop an image here, or click to browse</p>
                        <span className="file-requirements">PNG, JPG up to 5MB</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="remove-image-btn"
                    >
                      ✕ Remove Image
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
              </div>

              <div className="genres-section">
                <label className="section-label">
                  Select Genres * 
                  <span className="selected-count">({selectedGenres.length} selected)</span>
                </label>
                <div className="genres-grid">
                  {genres.map((genre) => (
                    <label
                      key={genre.genre_id}
                      className={`genre-chip ${selectedGenres.includes(genre.genre_id) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.genre_id)}
                        onChange={() => handleGenreToggle(genre.genre_id)}
                      />
                      <span>{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  disabled={!isStep3Valid}
                  className="btn-primary"
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          
          {currentStep === 4 && (
            <div className="form-section">
              <h2 className="section-title">✓ Review & Submit</h2>
              
              <div className="review-grid">
                {imagePreview && (
                  <div className="review-image">
                    <img src={imagePreview} alt={book.name} />
                  </div>
                )}
                
                <div className="review-details">
                  <div className="review-item">
                    <span className="review-label">Title:</span>
                    <span className="review-value">{book.name}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">Author:</span>
                    <span className="review-value">{book.author}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">ISBN:</span>
                    <span className="review-value">{book.ISBN}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">Price:</span>
                    <span className="review-value">${book.price}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">Year:</span>
                    <span className="review-value">{book.year}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">Language:</span>
                    <span className="review-value">{book.language}</span>
                  </div>
                  
                  <div className="review-item full-width">
                    <span className="review-label">Description:</span>
                    <span className="review-value" style={{ whiteSpace: "pre-wrap" }}>{book.about}</span>
                  </div>
                  
                  <div className="review-item full-width">
                    <span className="review-label">Genres:</span>
                    <div className="review-genres">
                      {selectedGenres.map((genreId) => {
                        const genre = genres.find((g) => g.genre_id === genreId);
                        return (
                          <span key={genreId} className="review-genre-tag">
                            {genre?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-secondary"
                >
                  ← Back to Edit
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-success"
                >
                  {isUploading ? "Uploading..." : "✓ Add Book to Store"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}