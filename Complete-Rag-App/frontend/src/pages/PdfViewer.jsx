import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const PdfViewer = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const targetPage = location.state?.page;

  useEffect(() => {
    let objectUrl;

    const fetchPdf = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/pdfs/view/${id}`, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(response.data);
        setBlobUrl(objectUrl);
      } catch (err) {
        setError('Unable to load this PDF. It may have been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-primary-600 hover:underline font-medium mb-1"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {location.state?.title || 'Document'}
            </h1>
            {targetPage && (
              <p className="text-xs text-gray-400 mt-0.5">Jumping to page {targetPage}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full py-24">
              <p className="text-gray-500">Loading PDF...</p>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full py-24">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          {!loading && !error && blobUrl && (
            <iframe
              src={targetPage ? `${blobUrl}#page=${targetPage}` : blobUrl}
              title="PDF Viewer"
              className="w-full h-[80vh] border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
