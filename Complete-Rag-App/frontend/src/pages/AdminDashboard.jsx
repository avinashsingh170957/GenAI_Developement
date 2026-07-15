import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const AdminDashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const fetchPdfs = async () => {
    try {
      const { data } = await api.get('/pdfs');
      setPdfs(data.pdfs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  // Keep polling while at least one PDF is still being embedded, so the
  // admin can watch it flip from "Processing" to "Ready" without refreshing.
  useEffect(() => {
    const hasProcessing = pdfs.some((pdf) => pdf.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(fetchPdfs, 4000);
    return () => clearInterval(interval);
  }, [pdfs]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please choose a PDF file first.' });
      return;
    }
    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title || file.name);

    try {
      await api.post('/pdfs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'PDF uploaded successfully!' });
      setTitle('');
      setFile(null);
      e.target.reset();
      fetchPdfs();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this PDF? This cannot be undone.')) return;
    try {
      await api.delete(`/pdfs/${id}`);
      setPdfs((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Upload PDF files for users to view.</p>

        {/* Upload form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New PDF</h2>

          {message.text && (
            <div
              className={`text-sm rounded-md px-4 py-2 mb-4 border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employee Handbook 2026"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-md transition"
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </form>
        </div>

        {/* PDF list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded PDFs ({pdfs.length})</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : pdfs.length === 0 ? (
            <p className="text-gray-500">No PDFs uploaded yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{pdf.title}</p>
                      <p className="text-xs text-gray-400">
                        Uploaded by {pdf.uploaded_by_name} on {new Date(pdf.uploaded_at).toLocaleDateString()}
                      </p>
                      {pdf.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
                          Indexing for search…
                        </span>
                      )}
                      {pdf.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5">
                          Ready for search
                        </span>
                      )}
                      {pdf.status === 'failed' && (
                        <span
                          className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5"
                          title={pdf.error_message || 'Embedding failed'}
                        >
                          Indexing failed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/view/${pdf.id}`, { state: { title: pdf.title } })}
                      className="text-sm text-primary-600 hover:underline font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(pdf.id)}
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
