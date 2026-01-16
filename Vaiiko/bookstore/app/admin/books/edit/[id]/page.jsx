
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
      <h1>Edit Book</h1>

      {msg && <p style={{ color: msg.includes("successfully") ? "green" : "red" }}>{msg}</p>}

      <form onSubmit={submit} className="edit-book-form">
        <input
          name="name"
          value={book.name}
          onChange={handleChange}
          placeholder="Book Name"
          required
        />
        <input
          name="price"
          type="number"
          value={book.price}
          onChange={handleChange}
          placeholder="Price"
          required
        />
        <input
          name="author"
          value={book.author}
          onChange={handleChange}
          placeholder="Author"
          required
        />
        <input
          name="ISBN"
          value={book.ISBN}
          onChange={handleChange}
          placeholder="ISBN"
          required
        />
        <input
          name="language"
          value={book.language}
          onChange={handleChange}
          placeholder="Language"
          required
        />
        <input
          name="year"
          type="number"
          value={book.year}
          onChange={handleChange}
          placeholder="Publication Year"
          required
        />

        {/* Image Upload Area */}
        <div className="image-upload-section">
          <h4>Book Cover Image</h4>
          
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
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>Drag & drop an image here</p>
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    or click to browse
                  </p>
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
                Remove Image
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

        <textarea
          name="about"
          placeholder="About the book"
          value={book.about}
          onChange={handleChange}
          required
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            minHeight: "100px",
            fontSize: "1rem",
          }}
        />

        {/* Genres panel */}
        <div className="edit-book-genres">
          <h4>Select Genres</h4>
          <div className="genres-panel">
            {genres.map((genre) => (
              <label key={genre.genre_id} className="genre-label">
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre.genre_id)}
                  onChange={() => handleGenreToggle(genre.genre_id)}
                />
                {genre.name}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}