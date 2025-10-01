"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

/**
 * Banner interface for existing banners fetched from API.
 */
interface Banner {
  title: string;
  link: string;
  description: string;
  images: string[];
}

/**
 * NewBanner interface for banners being uploaded.
 */
interface NewBanner {
  title: string;
  link: string;
  description: string;
  file: File;
}

/**
 * SettingsPage Component
 * ----------------------
 * Admin settings page for managing banners.
 * Features:
 * - Fetches and displays existing banners from API
 * - Allows drag & drop upload of new banner images
 * - Collects metadata (title, description, link) for each banner
 * - Uploads banners via API
 */
export default function SettingsPage() {
  // ---------- State Management ----------
  const [isClient, setIsClient] = useState(false);
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBanners, setNewBanners] = useState<NewBanner[]>([]);

  // ---------- Client Detection ----------
  useEffect(() => setIsClient(true), []);

  // ---------- Fetch Existing Banners ----------
  useEffect(() => {
    if (!isClient) return;

    const url = process.env.NEXT_PUBLIC_API_URL ?? null;
    setApiUrl(url);

    if (!url) {
      setError("API URL is undefined. Check your .env.local");
      setLoading(false);
      return;
    }

    fetch(`${url}/api/Banner/get-banners`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.data) {
          setBanners(data.data);
        } else {
          setError("No banner data returned from API.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching banners:", err);
        setError("Error fetching banners. Check console.");
        setLoading(false);
      });
  }, [isClient]);

  // ---------- Handle File Drop ----------
  const onDrop = (acceptedFiles: File[]) => {
    const filesWithMeta = acceptedFiles.map((file) => ({
      file,
      title: "",
      description: "",
      link: "",
    }));
    setNewBanners((prev) => [...prev, ...filesWithMeta]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // ---------- Handle Metadata Input ----------
  type TextFields = "title" | "description" | "link";

  const handleChange = (index: number, field: TextFields, value: string) => {
    setNewBanners((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ---------- Upload New Banners ----------
  // ---------- Upload New Banners ----------









// ---------- Upload New Banners ----------
const uploadBanners = async () => {
  if (!apiUrl || newBanners.length === 0) return;

  try {
    for (const banner of newBanners) { // ✅ FIXED: changed newBanner to newBanners
      let imageUrls: string[] = [];

      // 1. Upload the image file first
      if (banner.file) {
        const fileFormData = new FormData();
        fileFormData.append("File", banner.file);
        fileFormData.append("FileType", "1"); // Adjust based on your file types
        fileFormData.append("RelationId", "0"); // Adjust as needed
        fileFormData.append("BasePath", "banners"); // Optional: specify folder

        console.log("📤 Uploading file:", banner.file.name);

        const fileUploadRes = await fetch(`${apiUrl}/upload-file`, {
          method: "POST",
          body: fileFormData,
          // Don't set Content-Type header - let browser set it with boundary
        });

        const fileUploadText = await fileUploadRes.text();
        console.log("📥 File upload response:", fileUploadText);

        if (fileUploadRes.ok) {
          try {
            const fileData = fileUploadText ? JSON.parse(fileUploadText) : {};
            if (fileData.status && fileData.data) {
              // Get the file URL/path from response
              const fileUrl = fileData.data.filePath || fileData.data.url;
              if (fileUrl) {
                imageUrls.push(fileUrl);
                console.log("✅ File uploaded successfully:", fileUrl);
              }
            }
          } catch (parseError) {
            console.warn("File upload response was not JSON:", fileUploadText);
          }
        } else {
          console.warn("⚠️ File upload failed, but continuing with banner creation");
        }
      }

      // 2. Create banner with the uploaded image URLs
      const payload = {
        title: banner.title,
        link: banner.link,
        description: banner.description,
        images: imageUrls // Use the uploaded image URLs
      };

      console.log("📤 Creating banner with payload:", payload);

      const bannerRes = await fetch(`${apiUrl}/api/Banner/set-banner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await bannerRes.text();
      console.log("📥 Banner creation response:", responseText);

      if (!bannerRes.ok) {
        throw new Error(`HTTP ${bannerRes.status}: ${responseText}`);
      }

      let data: any = null;
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log("✅ Banner created successfully:", data.data);
      } catch (parseError) {
        console.warn("Banner response was not JSON:", responseText);
        data = { message: responseText };
      }
    }

    // Refresh the entire banners list
    const refreshRes = await fetch(`${apiUrl}/api/Banner/get-banners`);
    const refreshData = await refreshRes.json();
    
    console.log("🔄 Refreshed banners data:", refreshData.data);
    
    if (refreshData.status && refreshData.data) {
      setBanners(refreshData.data);
    }

    setNewBanners([]);
    alert("✅ All banners uploaded successfully!");
    
  } catch (err: any) {
    console.error("Upload error:", err);
    alert(`❌ Upload failed: ${err.message}`);
  }
};


  // ---------- Render ----------
  if (!isClient) return null;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Settings</h1>

      {/* API URL status */}
      {apiUrl ? (
        <p>
          API URL is: <strong>{apiUrl}</strong>
        </p>
      ) : (
        <p style={{ color: "red" }}>API URL not found.</p>
      )}

      {/* File Upload Dropzone */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop banner images here, or click to select files</p>
        )}
      </div>

      {/* Metadata Inputs for New Banners */}
      {newBanners.map((banner, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        >
          <p>
            <strong>File:</strong> {banner.file.name}
          </p>
          <input
            type="text"
            placeholder="Title"
            value={banner.title}
            onChange={(e) => handleChange(index, "title", e.target.value)}
            style={{ width: "100%", marginBottom: "5px" }}
          />
          <input
            type="text"
            placeholder="Description"
            value={banner.description}
            onChange={(e) => handleChange(index, "description", e.target.value)}
            style={{ width: "100%", marginBottom: "5px" }}
          />
          <input
            type="text"
            placeholder="Link"
            value={banner.link}
            onChange={(e) => handleChange(index, "link", e.target.value)}
            style={{ width: "100%", marginBottom: "5px" }}
          />
        </div>
      ))}

      {/* Upload Button */}
      {newBanners.length > 0 && (
        <button
          onClick={uploadBanners}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Upload Banners
        </button>
      )}

      {/* Loading & Error States */}
      {loading && <p>Loading banners...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* No Banners Found */}
      {!loading && !error && banners.length === 0 && <p>No banners found.</p>}

      {/* Existing Banners List */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              width: "200px",
            }}
          >
            <h3>{banner.title}</h3>
            <p>{banner.description}</p>
            <a href={banner.link} target="_blank" rel="noopener noreferrer">
              Visit Link
            </a>
            <div style={{ marginTop: "10px" }}>
              {banner.images.map((img, i) => (
                <img
                  key={i}
                  src={img.startsWith("http") ? img : `${apiUrl}/${img}`}
                  alt={`${banner.title}-${i}`}
                  style={{ width: "100%", marginBottom: "5px" }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
