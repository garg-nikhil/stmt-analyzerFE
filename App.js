import React, { useState } from 'react';
import Papa from 'papaparse';

const API_URL = process.env.REACT_APP_API_URL || 'https://statement-analyzer-h0x1.onrender.com';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const onFileChange = e => {
    setFile(e.target.files[0]);
    setData(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file first!');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert JSON data by vendor & type to CSV string
  const exportCsv = (vendor, type) => {
    if (!data || !data[vendor] || !data[vendor][type]) return;

    const csvString = Papa.unparse(data[vendor][type].map(txn => ({
      Date: txn.date,
      Amount: txn.amount,
      Description: txn.desc || ''
    })));

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${vendor}-${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h1>PDF Extractor - Vendor & Credit/Debit Segregation</h1>
      <input type="file" accept="application/pdf" onChange={onFileChange} />
      <button onClick={handleUpload} disabled={loading || !file} style={{ marginLeft: 10 }}>
        {loading ? 'Processing...' : 'Upload & Process'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 20 }}>Error: {error}</div>}
      {data && (
        <div style={{ marginTop: 30 }}>
          <h2>Extracted Transaction Summary</h2>
          {Object.entries(data).map(([vendor, types]) => (
            <div key={vendor} style={{ marginBottom: 30 }}>
              <h3>{vendor}</h3>
              {['credit', 'debit'].map(type => (
                <div key={type} style={{ marginBottom: 20 }}>
                  <h4 style={{ textTransform: 'capitalize' }}>{type}</h4>
                  {types[type].length > 0 ? (
                    <>
                      <table border="1" cellPadding="5" cellSpacing="0" style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {types[type].map((txn, i) => (
                            <tr key={i}>
                              <td>{txn.date}</td>
                              <td>{txn.amount}</td>
                              <td>{txn.desc || ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button onClick={() => exportCsv(vendor, type)} style={{ marginTop: 5 }}>
                        Download {type} CSV
                      </button>
                    </>
                  ) : (
                    <p>No {type} transactions.</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <footer style={{ marginTop: 50, fontSize: 12, color: '#666' }}>
        Powered by React + Your Flask Backend on Render
      </footer>
    </div>
  );
}

export default App;
