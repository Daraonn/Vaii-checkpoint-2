"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import "./edit.css";

export default function EditBook() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/admin/books/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to fetch book");
        }
        const data = await res.json();
        setBook(data.book);
        // Set existing image preview
        if (data.book.image) {
          setImagePreview(data.book.image);
        }
        // Preselect genres
        if (data.book.genres) {
          setSelectedGenres(data.book.genres.map((bg) => bg.genre.genre_id));
        }
      } catch (err) {
        console.error(err);
        setMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  // Fetch all genres
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

  const uploadImage = async (file) => {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMsg("Please upload a valid image file");
      return null;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMsg("Image size should be less than 5MB");
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
      setMsg("Failed to upload image: " + err.message);
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
        setImagePreview(imageUrl);
      }
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setBook((prev) => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
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

  if (loading) return <p>Loading...</p>;
  if (!book) return <p style={{ color: "red" }}>{msg || "Book not found"}</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...book, genres: selectedGenres }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update book");

      setMsg("Book updated successfully!");
      router.push("/admin/books");
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

  return (
    <div className="edit-book-container">
      <div>
        {/* Header */}
        <button className="back-button" onClick={() => router.push("/admin/books")}>
          
          Back to Books
        </button>

        <h1>Edit Book</h1>
        <p className="subtitle">Update book information and details</p>

        {/* Success/Error Message */}
        {msg && (
          <div className={msg.includes("successfully") ? "success-message" : "error-message"}>
            <span>{msg}</span>
          </div>
        )}

        <div className="edit-book-grid">
          {/* Left Column - Image Upload */}
          <div className="card image-upload-card">
            <h2>Book Cover</h2>

            {!imagePreview ? (
              <div
                className={`image-drop-zone ${isDragging ? "dragging" : ""}`}
                onDrop={handleImageDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <p>Uploading...</p>
                ) : (
                  <>
                    
                    <p>Drop image here</p>
                    <p>or click to browse</p>
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
                  ✕
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

          {/* Right Column - Form Fields */}
          <div>
            {/* Basic Information */}
            <div className="card form-section">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label className="form-label">Book Title *</label>
                <input
                  name="name"
                  value={book.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input
                    name="author"
                    value={book.author}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Author name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <div className="price-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      value={book.price}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">ISBN *</label>
                  <input
                    name="ISBN"
                    value={book.ISBN}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="ISBN"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Language *</label>
                  <input
                    name="language"
                    value={book.language}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Language"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input
                    name="year"
                    type="number"
                    value={book.year}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="2024"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card form-section">
              <h2>Description</h2>
              <textarea
                name="about"
                value={book.about}
                onChange={handleChange}
                rows={6}
                className="form-textarea"
                placeholder="Enter book description..."
                required
              />
              <p className="character-count">{book.about.length} characters</p>
            </div>

            {/* Genres */}
            <div className="card form-section">
              <h2>Genres</h2>
              <div className="genres-container">
                {genres.map((genre) => (
                  <button
                    key={genre.genre_id}
                    type="button"
                    onClick={() => handleGenreToggle(genre.genre_id)}
                    className={`genre-tag ${selectedGenres.includes(genre.genre_id) ? "selected" : ""}`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push("/admin/books")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isUploading}
                className="btn btn-primary"
              >
                {isUploading ? "Uploading..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}