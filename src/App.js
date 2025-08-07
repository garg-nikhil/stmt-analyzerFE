import React, { useState } from 'react';

const API_URL = "https://statement-analyzer-h0x1.onrender.com/process";

function PdfUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // Reset previous states on new file selection
    setError(null);
    setUploadSuccess(null);
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file first!');
      return;
    }
    setLoading(true);
    setError(null);
    setUploadSuccess(null);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        // Try to parse JSON error if possible
        let errMessage = response.statusText;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setUploadSuccess(false);
      } else {
        setUploadSuccess(true);
        setUploadMessage(`Upload successful for month: ${result.month}. Rows sent: ${result.rows_sent}.`);
      }
    } catch (err) {
      setError(err.message);
      setUploadSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Upload PDF Statement</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {uploadSuccess === true && (
        <div style={{ marginTop: 20, color: 'green' }}>
          {uploadMessage}
        </div>
      )}

      {uploadSuccess === false && error && (
        <div style={{ marginTop: 20, color: 'red' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default PdfUpload;
