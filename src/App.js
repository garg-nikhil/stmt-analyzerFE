import React, { useState } from 'react';

const API_URL = "https://statement-analyzer-h0x1.onrender.com/process"; // Replace with your backend endpoint

function MultiPdfUpload() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError(null);
    setUploadSuccess(null);
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select one or more PDF files first!');
      return;
    }
    setLoading(true);
    setError(null);
    setUploadSuccess(null);
    setUploadMessage("");

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
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

        if (result.monthly_results) {
          const messages = Object.entries(result.monthly_results).map(
            ([month, info]) => `${month}: ${info.rows_sent} rows`
          );
          setUploadMessage(`Upload successful for months:\n${messages.join('\n')}`);
        } else if (result.month && result.rows_sent) {
          setUploadMessage(`Upload successful for month: ${result.month}. Rows sent: ${result.rows_sent}.`);
        } else {
          setUploadMessage('Upload successful.');
        }
      }
    } catch (err) {
      setError(err.message);
      setUploadSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Upload Multiple PDF Statements</h2>
      <input 
        type="file" 
        accept="application/pdf" 
        multiple 
        onChange={handleFileChange} 
      />
      <br /><br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {uploadSuccess === true && (
        <pre style={{ marginTop: 20, color: 'green', whiteSpace: 'pre-wrap' }}>
          {uploadMessage}
        </pre>
      )}

      {uploadSuccess === false && error && (
        <div style={{ marginTop: 20, color: 'red' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default MultiPdfUpload;
