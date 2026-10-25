import React, { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, Users, CreditCard } from 'lucide-react';
import { adminRepo } from '@/lib/adminRepo';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/app/providers/ToastProvider';
import { AdminStatusBadge, AdminLoadingSkeleton } from '@/components/brand';

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
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <button
          onClick={() => navigate('/requests')}
          className="text-xs font-bold text-[var(--kb-muted)] hover:text-[#F46A35] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Requests List
        </button>
        <AdminLoadingSkeleton variant="detail" />
      </div>
    );
  }

  const handleStatusUpdate = async (status: string) => {
    await adminRepo.updateRequestStatus(id as string, status);
    showToast(`Request status updated to ${status}`, 'success');
    loadDetails();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <button
        onClick={() => navigate('/requests')}
        className="text-xs font-bold text-[var(--kb-muted)] hover:text-[#F46A35] flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Requests List
      </button>

      {/* HEADER */}
      <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F46A35]/10 text-[#F46A35] border border-[#F46A35]/30 uppercase">
              {request.category_name}
            </span>
            <AdminStatusBadge status={request.status} size="sm" />
          </div>
          <h1 className="text-2xl font-black text-[var(--kb-text)] tracking-tight">
            {request.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {request.city_name && (
              <span className="text-xs text-[var(--kb-text)] font-semibold flex items-center gap-1.5 bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] px-3 py-1 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-[#F46A35]" /> 
                {request.city_name}
              </span>
            )}
            {request.location && (
              <a 
                href={request.location.startsWith('http') ? request.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.location)}`}
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-[#F46A35] hover:text-[#DC5425] hover:underline flex items-center gap-1.5 bg-[#F46A35]/10 border border-[#F46A35]/20 px-3 py-1 rounded-xl font-semibold"
              >
                <MapPin className="w-3.5 h-3.5" /> 
                <span className="truncate max-w-[250px]" title={request.location}>{request.location}</span>
              </a>
            )}
          </div>
        </div>

        {/* ADMIN ACTION BADGES */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {request.status !== 'closed' && (
            <button
              onClick={() => handleStatusUpdate('closed')}
              className="px-4 py-2 bg-[var(--kb-surface-subtle)] hover:bg-[var(--kb-border)] text-[var(--kb-text)] rounded-xl text-xs font-bold border border-[var(--kb-border)] transition-colors shadow-xs"
            >
              Close Post
            </button>
          )}
          {request.status !== 'published' && (
            <button
              onClick={() => handleStatusUpdate('published')}
              className="px-4 py-2 bg-[#F46A35] hover:bg-[#DC5425] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F46A35]/20"
            >
              Re-Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-black text-xs text-[var(--kb-muted)] uppercase tracking-wider border-b border-[var(--kb-border)] pb-2.5">
              Post Description
            </h3>
            <p className="text-xs sm:text-sm text-[var(--kb-text)] leading-relaxed">
              {request.description || 'No detailed description provided.'}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-[var(--kb-border)]">
              <div className="p-3.5 rounded-2xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)]">
                <span className="text-[var(--kb-muted)] text-[10px] uppercase font-bold flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-[#F46A35]" /> Players Required
                </span>
                <span className="text-[var(--kb-text)] font-extrabold text-sm">{request.required_people} Person(s)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)]">
                <span className="text-[var(--kb-muted)] text-[10px] uppercase font-bold flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#FFB45E]" /> Cost Per Head
                </span>
                <span className="text-[var(--kb-text)] font-extrabold text-sm">{request.currency} {request.cost}</span>
              </div>
            </div>
          </div>

          {/* APPLICANTS TABLE */}
          <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-black text-xs text-[var(--kb-muted)] uppercase tracking-wider border-b border-[var(--kb-border)] pb-2.5">
              Interested Applicants ({request.join_requests.length})
            </h3>
            {request.join_requests.length === 0 ? (
              <p className="text-xs text-[var(--kb-muted)] py-4 text-center">No user application recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {request.join_requests.map((j: any) => (
                  <div key={j.id} className="p-3.5 bg-[var(--kb-surface-subtle)] border border-[var(--kb-border)] rounded-2xl text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center font-bold text-xs text-[#F46A35] shrink-0">
                        {j.user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--kb-text)]">{j.user_name}</p>
                        <p className="text-[11px] text-[var(--kb-muted)]">{j.note || 'No note attached'}</p>
                      </div>
                    </div>
                    <AdminStatusBadge status={j.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CREATOR CARD */}
        <div className="space-y-4">
          <div className="bg-[var(--kb-surface)] border border-[var(--kb-border)] rounded-3xl p-6 space-y-3 shadow-sm">
            <h3 className="font-black text-xs text-[var(--kb-muted)] uppercase tracking-wider border-b border-[var(--kb-border)] pb-2.5">
              Post Creator
            </h3>
            {request.creator ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F46A35]/10 border border-[#F46A35]/20 flex items-center justify-center font-bold text-sm text-[#F46A35] shrink-0">
                  {request.creator.full_name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-[var(--kb-text)] truncate">{request.creator.full_name}</p>
                  <p className="text-xs text-[var(--kb-muted)] font-mono truncate">{request.creator.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--kb-muted)]">Created by System Admin</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
