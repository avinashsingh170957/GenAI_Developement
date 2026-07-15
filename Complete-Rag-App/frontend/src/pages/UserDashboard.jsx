import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RagSearch from '../components/RagSearch';
import api from '../api/axios';

const UserDashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchPdfs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Document Library</h1>
        <p className="text-gray-500 mb-6">Browse and read available PDF documents.</p>

        <RagSearch />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : pdfs.length === 0 ? (
            <p className="text-gray-500">No PDF documents are available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfs.map((pdf) => (
                <button
                  key={pdf.id}
                  onClick={() => navigate(`/view/${pdf.id}`, { state: { title: pdf.title } })}
                  className="text-left border border-gray-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-md transition group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium text-gray-800 group-hover:text-primary-600 truncate">{pdf.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Added {new Date(pdf.uploaded_at).toLocaleDateString()}
                  </p>
                  {pdf.status === 'processing' && (
                    <span className="inline-block mt-2 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
                      Indexing for search…
                    </span>
                  )}
                  {pdf.status === 'failed' && (
                    <span className="inline-block mt-2 text-[11px] font-medium bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5">
                      Not searchable
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
