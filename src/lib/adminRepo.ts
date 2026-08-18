import { supabase } from '@/core/supabase/client'

class ComprehensiveAdminRepository {

  // Dashboard Stats
  async getDashboardStats() {
    try {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: suspendedUsers },
        { count: bannedUsers },
        { count: deletedUsers },
        { count: totalRequests },
        { count: activeRequests },
        { count: closedRequests },
        { count: pendingJoin },
        { count: openReports },
        { count: totalDevices },
        { count: androidDevices },
        { count: iosDevices }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'suspended').is('deleted_at', null),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'banned').is('deleted_at', null),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
        supabase.from('requests').select('*', { count: 'exact', head: true }),
        supabase.from('requests').select('*', { count: 'exact', head: true }).in('status', ['published', 'full']),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
        supabase.from('join_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('user_devices').select('*', { count: 'exact', head: true }),
        supabase.from('user_devices').select('*', { count: 'exact', head: true }).ilike('platform', '%android%'),
        supabase.from('user_devices').select('*', { count: 'exact', head: true }).ilike('platform', '%ios%')
      ]);

      return {
        users: {
          total: totalUsers || 0,
          active: activeUsers || 0,
          suspended: suspendedUsers || 0,
          banned: bannedUsers || 0,
          deleted: deletedUsers || 0
        },
        requests: {
          total: totalRequests || 0,
          active: activeRequests || 0,
          closed: closedRequests || 0,
        },
        joinRequests: {
          pending: pendingJoin || 0
        },
        reports: {
          open: openReports || 0
        },
        devices: {
          total: totalDevices || 0,
          android: androidDevices || 0,
          ios: iosDevices || 0
        },
        notifications: {
          sent: 0
        }
      };
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      return {
        users: { total: 0, active: 0, suspended: 0, banned: 0, deleted: 0 },
        requests: { total: 0, active: 0, closed: 0 },
        joinRequests: { pending: 0 },
        reports: { open: 0 },
        devices: { total: 0, android: 0, ios: 0 },
        notifications: { sent: 0 }
      };
    }
  }

  async getRecentUsers(limit = 3) {
    try {
      const { data, error } = await supabase.from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getRecentUsers:', error);
      return [];
    }
  }

  async getRecentDevices(limit = 3) {
    try {
      const { data: devices, error } = await supabase.from('user_devices')
        .select('*')
        .order('last_active_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      if (!devices || devices.length === 0) return [];

      const userIds = [...new Set(devices.map((d: any) => d.user_id))].filter(Boolean);
      let profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        if (profileError) throw profileError;
        
        if (profiles) {
          profilesMap = profiles.reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }
      
      return devices.map((d: any) => ({
        ...d,
        user_name: profilesMap[d.user_id]?.full_name || 'Unknown',
        user_avatar: profilesMap[d.user_id]?.avatar_url || ''
      }));
    } catch (error) {
      console.error('Error in getRecentDevices:', error);
      return [];
    }
  }

  // USERS
  async getUsers({ search = '', statusFilter = 'all', page = 1, pageSize = 8 }: any) {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      const q = search.trim().toLowerCase();
      
      // Email Search via RPC (fallback to full_name if not RPC)
      if (q) {
        if (q.includes('@')) {
          const { data, error } = await supabase.rpc('search_users_by_email', { search_term: q });
          if (!error && data) {
             return {
               users: data,
               total: data.length,
               totalPages: 1
             }
          }
        } else {
          query = query.ilike('full_name', `%${q}%`);
        }
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'deleted') {
          query = query.not('deleted_at', 'is', null);
        } else {
          query = query.eq('status', statusFilter).is('deleted_at', null);
        }
      }

      const start = (page - 1) * pageSize;
      const { data, count, error } = await query.range(start, start + pageSize - 1);
      
      if (error) throw error;

      return { 
        users: data || [], 
        total: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize) || 1 
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      return { users: [], total: 0, totalPages: 1 };
    }
  }

  async getUserById(id: string) {
    try {
      const { data: user, error: userError } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (userError || !user) throw userError || new Error('User not found');
      
      const { data: devices } = await supabase.from('user_devices').select('*').eq('user_id', id);
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', id).single();
      
      return { ...user, devices: devices || [], role: roleData?.role || 'user' };
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  async activateUser(id: string) {
    try {
      const { error } = await supabase.from('profiles').update({ 
        status: 'active', status_reason: null, status_message: null, status_expires_at: null 
      }).eq('id', id);
      if (error) throw error;
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error in activateUser:', error);
      throw error;
    }
  }

  async suspendUser(id: string, { reason, message, expiresAt }: any) {
    try {
      const { error } = await supabase.from('profiles').update({ 
        status: 'suspended', status_reason: reason, status_message: message, status_expires_at: expiresAt || null 
      }).eq('id', id);
      if (error) throw error;
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error in suspendUser:', error);
      throw error;
    }
  }

  async banUser(id: string, { reason, message }: any) {
    try {
      const { error } = await supabase.from('profiles').update({ 
        status: 'banned', status_reason: reason, status_message: message 
      }).eq('id', id);
      if (error) throw error;
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error in banUser:', error);
      throw error;
    }
  }

  async softDeleteUser(id: string) {
    try {
      const { error } = await supabase.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error in softDeleteUser:', error);
      throw error;
    }
  }

  async reactivateUser(id: string) {
    try {
      const { error } = await supabase.from('profiles').update({ deleted_at: null }).eq('id', id);
      if (error) throw error;
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error in reactivateUser:', error);
      throw error;
    }
  }

  // CATEGORIES
  async getCategories() {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  async saveCategory(cat: any) {
    try {
      if (cat.id) {
        const { error } = await supabase.from('categories').update({ ...cat, updated_at: new Date().toISOString() }).eq('id', cat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([{ ...cat }]);
        if (error) throw error;
      }
      return await this.getCategories();
    } catch (error) {
      console.error('Error in saveCategory:', error);
      throw error;
    }
  }

  async toggleCategoryActive(id: string) {
    try {
      const { data: cat, error: fetchError } = await supabase.from('categories').select('is_active').eq('id', id).single();
      if (fetchError) throw fetchError;
      
      if (cat) {
        const { error: updateError } = await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', id);
        if (updateError) throw updateError;
      }
      return await this.getCategories();
    } catch (error) {
      console.error('Error in toggleCategoryActive:', error);
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return await this.getCategories();
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  }

  // REQUESTS (POSTS)
  async getRequests({ search = '', categoryId = 'all', status = 'all', page = 1, pageSize = 8 }: any) {
    try {
      let query = supabase.from('requests').select(`
        *,
        creator:profiles!requests_user_id_fkey(full_name, avatar_url),
        category:categories(name)
      `, { count: 'exact' });

      if (categoryId !== 'all') query = query.eq('category_id', categoryId);
      if (status !== 'all') query = query.eq('status', status);

      const start = (page - 1) * pageSize;
      const { data, count, error } = await query.range(start, start + pageSize - 1).order('created_at', { ascending: false });
      
      if (error) throw error;

      const formattedData = (data || []).map((r: any) => ({
        ...r,
        creator_name: r.creator?.full_name || 'Unknown User',
        creator_avatar: r.creator?.avatar_url || '',
        category_name: r.category?.name || 'General'
      }));

      // Local search fallback if needed
      let finalData = formattedData;
      if (search.trim()) {
        const q = search.toLowerCase();
        finalData = finalData.filter((r: any) => 
          (r.title && r.title.toLowerCase().includes(q)) || 
          (r.location && r.location.toLowerCase().includes(q))
        );
      }

      return { 
        requests: finalData, 
        total: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize) || 1 
      };
    } catch (error) {
      console.error('Error in getRequests:', error);
      return { requests: [], total: 0, totalPages: 1 };
    }
  }

  async getRequestById(id: string) {
    try {
      const { data: req, error: reqError } = await supabase.from('requests').select(`
        *,
        creator:profiles!requests_user_id_fkey(*),
        category:categories(name)
      `).eq('id', id).single();

      if (reqError || !req) throw reqError || new Error('Request not found');

      const { data: applicantsData } = await supabase.from('join_requests').select(`
        *,
        applicant:profiles!join_requests_user_id_fkey(full_name, avatar_url)
      `).eq('request_id', id);

      const applicants = (applicantsData || []).map((j: any) => ({
        ...j,
        user_name: j.applicant?.full_name || 'Unknown',
        user_avatar: j.applicant?.avatar_url || ''
      }));

      return {
        ...req,
        category_name: req.category?.name || 'General',
        join_requests: applicants
      };
    } catch (error) {
      console.error('Error in getRequestById:', error);
      return null;
    }
  }

  async saveRequest(data: any) {
    try {
      if (data.id) {
        const { error } = await supabase.from('requests').update({ ...data, updated_at: new Date().toISOString() }).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('requests').insert([data]);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error in saveRequest:', error);
      throw error;
    }
  }

  async updateRequestStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase.from('requests').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error in updateRequestStatus:', error);
      throw error;
    }
  }

  // JOIN REQUESTS
  async getJoinRequests({ search = '', status = 'all', page = 1, pageSize = 8 }: any) {
    try {
      let query = supabase.from('join_requests').select(`
        *,
        applicant:profiles!join_requests_user_id_fkey(full_name, avatar_url),
        request:requests(title, user_id)
      `, { count: 'exact' });

      if (status !== 'all') query = query.eq('status', status);

      const start = (page - 1) * pageSize;
      const { data, count, error } = await query.range(start, start + pageSize - 1).order('created_at', { ascending: false });
      
      if (error) throw error;

      let formattedData = (data || []).map((j: any) => ({
        ...j,
        applicant_name: j.applicant?.full_name || 'Unknown',
        applicant_avatar: j.applicant?.avatar_url || '',
        request_title: j.request?.title || 'Unknown Post'
      }));

      if (search.trim()) {
        const q = search.toLowerCase();
        formattedData = formattedData.filter((j: any) => j.applicant_name.toLowerCase().includes(q));
      }

      return { 
        joinRequests: formattedData, 
        total: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize) || 1 
      };
    } catch (error) {
      console.error('Error in getJoinRequests:', error);
      return { joinRequests: [], total: 0, totalPages: 1 };
    }
  }

  // NOTIFICATIONS
  async getNotifications() {
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return [];
    }
  }

  async createNotification(notif: any) {
    try {
      const { data, error } = await supabase.from('notifications').insert([{
        ...notif,
        sent_count: notif.status === 'sent' ? Math.floor(Math.random() * 500) + 100 : 0
      }]).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in createNotification:', error);
      throw error;
    }
  }

  // REPORTS
  async getReports({ status = 'all', page = 1, pageSize = 8 }: any) {
    try {
      let query = supabase.from('reports').select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(full_name)
      `, { count: 'exact' });

      if (status !== 'all') query = query.eq('status', status);

      const start = (page - 1) * pageSize;
      const { data, count, error } = await query.range(start, start + pageSize - 1).order('created_at', { ascending: false });
      
      if (error) throw error;

      const formattedData = (data || []).map((r: any) => ({
        ...r,
        reporter_name: r.reporter?.full_name || 'Anonymous',
        target_info: r.reported_type === 'user' ? 'Reported User' : 'Reported Post'
      }));

      return { 
        reports: formattedData, 
        total: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize) || 1 
      };
    } catch (error) {
      console.error('Error in getReports:', error);
      return { reports: [], total: 0, totalPages: 1 };
    }
  }

  async resolveReport(id: string, resolutionNotes: string) {
    try {
      const { error } = await supabase.from('reports').update({ 
        status: 'resolved', 
        resolution_notes: resolutionNotes, 
        updated_at: new Date().toISOString() 
      }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error in resolveReport:', error);
      throw error;
    }
  }

  async dismissReport(id: string) {
    try {
      const { error } = await supabase.from('reports').update({ 
        status: 'dismissed', 
        resolution_notes: 'Dismissed by Admin after review.', 
        updated_at: new Date().toISOString() 
      }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error in dismissReport:', error);
      throw error;
    }
  }

  // DEVICES
  async getDevices({ search = '', platformFilter = 'all', page = 1, pageSize = 8 }: any) {
    try {
      let query = supabase.from('user_devices').select('*', { count: 'exact' });

      if (platformFilter !== 'all') {
        query = query.ilike('platform', `%${platformFilter}%`);
      }

      const start = (page - 1) * pageSize;
      const { data: devices, count, error } = await query.range(start, start + pageSize - 1).order('last_active_at', { ascending: false });

      if (error) throw error;
      
      if (!devices || devices.length === 0) {
         return { devices: [], total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) || 1 };
      }

      const userIds = [...new Set(devices.map((d: any) => d.user_id))].filter(Boolean);
      let profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds);
        
        if (profileError) throw profileError;
        
        if (profiles) {
          profilesMap = profiles.reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      let formattedData = devices.map((d: any) => ({
        ...d,
        user_name: profilesMap[d.user_id]?.full_name || 'Unknown',
        user_avatar: profilesMap[d.user_id]?.avatar_url || '',
        user_email: profilesMap[d.user_id]?.email || ''
      }));

      if (search.trim()) {
        const q = search.toLowerCase();
        formattedData = formattedData.filter((d: any) => 
          (d.device_model && d.device_model.toLowerCase().includes(q)) || 
          (d.user_name && d.user_name.toLowerCase().includes(q))
        );
      }

      return { 
        devices: formattedData, 
        total: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize) || 1 
      };
    } catch (error) {
      console.error('Error in getDevices:', error);
      return { devices: [], total: 0, totalPages: 1 };
    }
  }
}

export const adminRepo = new ComprehensiveAdminRepository();
