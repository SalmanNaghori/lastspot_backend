import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/app/providers/ToastProvider';

export function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    setLoading(true);
    if (!id) return;
    const r = await adminRepo.getRequestById(id);
    setRequest(r);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    if (id) {
      adminRepo.getRequestById(id).then((r) => {
        if (!ignore) {
          setRequest(r);
          setLoading(false);
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading || !request) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading request details...
      </div>
    );
  }

  const handleStatusUpdate = async (status: string) => {
    await adminRepo.updateRequestStatus(id as string, status);
    showToast(`Request status updated to ${status}`, 'success');
    loadDetails();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/requests')}
        className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1.5"
      >
        ← Back to Requests List
      </button>

      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
              {request.category_name}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              STATUS: {request.status.toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-2">{request.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {request.city_name && (
              <span className="text-xs text-slate-300 flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md">
                <MapPin className="w-3 h-3 text-emerald-400" /> 
                {request.city_name}
              </span>
            )}
            {request.location && (
              <a 
                href={request.location.startsWith('http') ? request.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.location)}`}
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md"
              >
                <MapPin className="w-3 h-3" /> 
                <span className="truncate max-w-[250px]" title={request.location}>{request.location}</span>
              </a>
            )}
          </div>
        </div>

        {/* ADMIN ACTION BADGES */}
        <div className="flex flex-wrap gap-2">
          {request.status !== 'closed' && (
            <button
              onClick={() => handleStatusUpdate('closed')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Close Post
            </button>
          )}
          {request.status !== 'published' && (
            <button
              onClick={() => handleStatusUpdate('published')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
            >
              Re-Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Post Description
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">{request.description || 'No detailed description provided.'}</p>
            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">People Required</span>
                <span className="text-slate-200 font-bold">{request.required_people} Person(s)</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Cost Per Head</span>
                <span className="text-slate-200 font-bold">{request.currency} {request.cost}</span>
              </div>
            </div>
          </div>

          {/* APPLICANTS TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Interested Applicants ({request.join_requests.length})
            </h3>
            {request.join_requests.length === 0 ? (
              <p className="text-xs text-slate-500">No user application recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {request.join_requests.map((j: any) => (
                  <div key={j.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={j.user_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-slate-200">{j.user_name}</p>
                        <p className="text-[10px] text-slate-400">{j.note}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                      {j.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CREATOR CARD */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Post Creator
            </h3>
            {request.creator ? (
              <div className="flex items-center gap-3">
                <img src={request.creator.avatar_url} alt="" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                <div>
                  <p className="font-bold text-xs text-slate-200">{request.creator.full_name}</p>
                  <p className="text-[10px] text-slate-400">{request.creator.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Created by System Admin</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
