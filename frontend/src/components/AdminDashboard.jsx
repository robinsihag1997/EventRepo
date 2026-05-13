import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  RefreshCcw, 
  Image as ImageIcon, 
  User, 
  Calendar, 
  Loader2, 
  Search,
  X,
  Eye,
  Download,
  ExternalLink,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this photo? This will remove it from the database and S3 storage.')) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/admin/uploads/${id}`);
      setUploads(prev => prev.filter(u => u.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchUploads();
    const interval = setInterval(() => fetchUploads(), 60000); // Auto refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const filteredUploads = uploads.filter(upload => 
    upload.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upload.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-amber-500">
             <ImageIcon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] selection:bg-amber-500/30">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight leading-none mb-1">Admin Center</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Live System</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-white/20 text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUploads(true)}
              disabled={refreshing}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all relative group"
              title="Refresh"
            >
              <RefreshCcw className={`w-5 h-5 text-white/60 group-hover:text-amber-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="w-px h-8 bg-white/10 mx-1"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-3 rounded-xl border border-red-500/20 transition-all font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline uppercase tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 pt-10 pb-20">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex items-center gap-5 group hover:border-amber-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider">Total Uploads</p>
              <h3 className="text-3xl font-black">{uploads.length}</h3>
            </div>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex items-center gap-5 group hover:border-blue-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider">Unique Users</p>
              <h3 className="text-3xl font-black">{new Set(uploads.map(u => u.name)).size}</h3>
            </div>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex items-center gap-5 group hover:border-green-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider">Latest Activity</p>
              <h3 className="text-xl font-bold truncate">
                {uploads[0] ? new Date(uploads[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </h3>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">Content Library</h2>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white/10 text-amber-500 shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-amber-500 shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        {filteredUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px]">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white/60">No results found</h3>
            <p className="text-white/30">Try adjusting your search query or refresh the data.</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-[#111] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-white/40 uppercase text-[11px] font-black tracking-widest border-b border-white/5">
                    <th className="px-8 py-5">Image</th>
                    <th className="px-6 py-5">User / Name</th>
                    <th className="px-6 py-5">Upload Date</th>
                    <th className="px-6 py-5">Reference ID</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUploads.map((upload) => (
                    <tr 
                      key={upload.id} 
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setSelectedImage(upload)}
                    >
                      <td className="px-8 py-4">
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-amber-500/50 transition-all group-hover:scale-105 shadow-lg">
                          <img 
                            src={upload.imageUrl} 
                            alt={upload.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold group-hover:text-amber-500 transition-colors">{upload.name}</span>
                          <span className="text-xs text-white/30 flex items-center gap-1.5 mt-1">
                            <User className="w-3 h-3" /> Verified Participant
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white/80">
                            {new Date(upload.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[11px] text-white/30 flex items-center gap-1 mt-1 font-mono uppercase">
                            <Clock className="w-3 h-3" /> {new Date(upload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[11px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-white/40 font-mono">
                          {upload.id}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-all hover:scale-110 shadow-sm"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(upload); }}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all hover:scale-110 shadow-sm text-red-500"
                            onClick={(e) => handleDelete(e, upload.id)}
                            disabled={deletingId === upload.id}
                          >
                            {deletingId === upload.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredUploads.map((upload) => (
              <div 
                key={upload.id}
                onClick={() => setSelectedImage(upload)}
                className="group relative bg-[#111] border border-white/5 rounded-[32px] overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5 cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden relative text-white">
                   <img 
                    src={upload.imageUrl} 
                    alt={upload.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                     <span className="bg-black/60 backdrop-blur-md border border-white/10 text-[10px] px-3 py-1 rounded-full font-mono text-white/60">
                        {upload.id.slice(0, 8)}
                     </span>
                  </div>
                  <button 
                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleDelete(e, upload.id)}
                    disabled={deletingId === upload.id}
                  >
                    {deletingId === upload.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-6">
                   <h3 className="text-lg font-bold mb-1 group-hover:text-amber-500 transition-colors truncate">{upload.name}</h3>
                   <div className="flex items-center gap-2 text-white/30 text-xs text-white">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(upload.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Professional Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            onClick={() => setSelectedImage(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-6xl flex flex-col md:flex-row bg-[#0a0a0a] rounded-[40px] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-500">
            {/* Image Section */}
            <div className="flex-1 bg-black flex items-center justify-center p-2 min-h-[300px] max-h-[70vh] md:max-h-none">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.name} 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info Section */}
            <div className="w-full md:w-[380px] p-8 md:p-10 flex flex-col border-t md:border-t-0 md:border-l border-white/10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 text-white">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-400 transition-all text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/20 mb-2 block">Uploader Name</label>
                  <h2 className="text-3xl font-black text-white">{selectedImage.name}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 block text-white">Date</label>
                    <p className="text-sm font-bold text-white">{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 block text-white">Time</label>
                    <p className="text-sm font-bold text-white">{new Date(selectedImage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/20 mb-2 block">System Identifier</label>
                  <div className="flex items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/5 font-mono text-xs text-white/40">
                    <span className="flex-1 truncate">{selectedImage.id}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-auto flex flex-col gap-3">
                <a 
                  href={selectedImage.imageUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-white text-black font-black py-4 rounded-2xl hover:bg-amber-500 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Full Resolution
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage.imageUrl;
                      link.download = `photo_${selectedImage.id}.jpg`;
                      link.click();
                    }}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/10 transition-all"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, selectedImage.id)}
                    disabled={deletingId === selectedImage.id}
                    className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 font-black py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    {deletingId === selectedImage.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
