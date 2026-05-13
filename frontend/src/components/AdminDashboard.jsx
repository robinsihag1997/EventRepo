import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCcw, Image as ImageIcon, User, Calendar, Loader2, Search } from 'lucide-react';

export default function AdminDashboard() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUploads = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const { data } = await api.get('/admin/uploads');
      setUploads(data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
      setError('Failed to fetch uploads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUploads();
    const interval = setInterval(() => fetchUploads(), 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-['Outfit'] pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Event Photos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUploads(true)}
              disabled={refreshing}
              className={`p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCcw className="w-5 h-5 text-amber-500" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-3 rounded-xl border border-red-500/20 transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* Stats / Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black mb-2">Recent Uploads</h2>
            <p className="text-white/40">Total submissions: <span className="text-amber-500 font-bold">{uploads.length}</span></p>
          </div>
          
          <div className="flex items-center gap-4">
             {error && <span className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">{error}</span>}
          </div>
        </div>

        {/* Grid */}
        {uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
            <div className="p-6 rounded-full bg-white/5 mb-4">
              <ImageIcon className="w-12 h-12 text-white/20" />
            </div>
            <p className="text-white/40 text-lg">No photos uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uploads.map((upload) => (
              <div 
                key={upload.id} 
                className="group relative bg-[#121212] border border-white/10 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5"
              >
                {/* Image Container */}
                <div className="aspect-[4/5] overflow-hidden bg-black relative">
                  <img
                    src={upload.imageUrl}
                    alt={upload.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="p-5 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <User className="w-4 h-4 text-amber-500" />
                      </div>
                      <h3 className="font-bold text-lg leading-tight truncate max-w-[150px]">{upload.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(upload.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                {/* ID Tag */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/40 tracking-tighter">
                  {upload.id.slice(0, 8)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
