import React, { useState, useEffect } from 'react';
import { AppStrings } from '@/core/constants/app_strings';
import { useToast } from '@/app/providers/ToastProvider';
import { adminRepo } from '@/lib/adminRepo';
import { Settings, Wrench, Smartphone, Plus, Trash2, Loader2, Save } from 'lucide-react';

interface MaintenanceRule {
  platform: 'android' | 'ios' | 'all';
  affected_versions: string[];
  title: string;
  message: string;
  is_active: boolean;
}

interface VersionMessage {
  title: string;
  message: string;
  release_notes: string[];
}

interface PlatformVersionControl {
  latest_version: string;
  store_url: string;
  blocked_versions: string[];
  min_supported_version: string;
  version_messages: Record<string, VersionMessage>;
}

export function AppSettingsPage() {
  const [flags, setFlags] = useState({
    chat: true,
    travel: true,
    sports: true,
  });

  const [maintenance, setMaintenance] = useState<{ global_maintenance: boolean; targeted_versions: MaintenanceRule[] }>({
    global_maintenance: false,
    targeted_versions: []
  });

  const [version, setVersion] = useState<{ android: PlatformVersionControl; ios: PlatformVersionControl }>({
    android: {
      latest_version: '',
      store_url: '',
      blocked_versions: [],
      min_supported_version: '',
      version_messages: {}
    },
    ios: {
      latest_version: '',
      store_url: '',
      blocked_versions: [],
      min_supported_version: '',
      version_messages: {}
    }
  });

  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  
  // Local state for new release notes being added (keyed by version string)
  const [newNoteInputs, setNewNoteInputs] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminRepo.getAppSettings();
      const maintenanceData = data.find(s => s.key === 'maintenance_mode');
      const versionData = data.find(s => s.key === 'version_control');
      
      if (maintenanceData && maintenanceData.value) {
        setMaintenance(maintenanceData.value);
      }
      if (versionData && versionData.value) {
        setVersion(versionData.value);
      }
    } catch (error) {
      showToast('Failed to load app settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminRepo.updateAppSetting('maintenance_mode', maintenance);
      await adminRepo.updateAppSetting('version_control', version);
      showToast(AppStrings.Settings.alerts.saved, 'success');
    } catch (error) {
      showToast(AppStrings.Settings.alerts.saveError, 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Maintenance Handlers ---
  const addMaintenanceRule = () => {
    setMaintenance({
      ...maintenance,
      targeted_versions: [
        ...maintenance.targeted_versions,
        {
          platform: 'all',
          affected_versions: [],
          title: 'Temporary Maintenance',
          message: 'Server upgrades are in progress.',
          is_active: false
        }
      ]
    });
  };

  const updateMaintenanceRule = (index: number, updates: Partial<MaintenanceRule>) => {
    const updated = [...maintenance.targeted_versions];
    updated[index] = { ...updated[index], ...updates };
    setMaintenance({ ...maintenance, targeted_versions: updated });
  };

  const removeMaintenanceRule = (index: number) => {
    const updated = [...maintenance.targeted_versions];
    updated.splice(index, 1);
    setMaintenance({ ...maintenance, targeted_versions: updated });
  };

  // --- Version Handlers ---
  const addBlockedVersion = (platform: 'android' | 'ios') => {
    const verInput = window.prompt("Enter version to block (e.g. 1.0.1):");
    if (!verInput) return;
    const vStr = verInput.trim();
    
    if (version[platform].blocked_versions.includes(vStr)) {
      showToast("Version already blocked.", "error");
      return;
    }

    const updatedPlatform = { ...version[platform] };
    updatedPlatform.blocked_versions = [...updatedPlatform.blocked_versions, vStr];
    updatedPlatform.version_messages[vStr] = {
      title: 'Update Required',
      message: `Version ${vStr} is deprecated. Please update to continue.`,
      release_notes: []
    };

    setVersion({ ...version, [platform]: updatedPlatform });
  };

  const removeBlockedVersion = (platform: 'android' | 'ios', vStr: string) => {
    const updatedPlatform = { ...version[platform] };
    updatedPlatform.blocked_versions = updatedPlatform.blocked_versions.filter(v => v !== vStr);
    delete updatedPlatform.version_messages[vStr];
    setVersion({ ...version, [platform]: updatedPlatform });
  };

  const updateVersionMessage = (platform: 'android' | 'ios', vStr: string, updates: Partial<VersionMessage>) => {
    const updatedPlatform = { ...version[platform] };
    updatedPlatform.version_messages[vStr] = {
      ...updatedPlatform.version_messages[vStr],
      ...updates
    };
    setVersion({ ...version, [platform]: updatedPlatform });
  };

  const addReleaseNote = (platform: 'android' | 'ios', vStr: string) => {
    const note = newNoteInputs[`${platform}_${vStr}`]?.trim();
    if (!note) return;
    
    const updatedPlatform = { ...version[platform] };
    const currentNotes = updatedPlatform.version_messages[vStr].release_notes || [];
    updatedPlatform.version_messages[vStr].release_notes = [...currentNotes, note];
    
    setVersion({ ...version, [platform]: updatedPlatform });
    setNewNoteInputs({ ...newNoteInputs, [`${platform}_${vStr}`]: '' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        <p>Loading settings...</p>
      </div>
    );
  }

  const activeVersionData = version[activeTab];

  return (
    <div className="max-w-5xl text-slate-100 space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-500" />
            {AppStrings.Settings.title}
          </h1>
          <p className="text-sm text-slate-400">{AppStrings.Settings.subtitle}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-70 shadow-lg shadow-emerald-900/20 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {AppStrings.Settings.saveBtn}
        </button>
      </div>

      {/* MAINTENANCE MODE SECTION */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-[20px] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">{AppStrings.Settings.maintenance.header}</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-5 py-4 bg-slate-950/50 border border-slate-800/60 rounded-xl">
            <span className="text-sm font-bold text-rose-400">{AppStrings.Settings.maintenance.globalMaintenance}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={maintenance.global_maintenance}
                onChange={(e) => setMaintenance({ ...maintenance, global_maintenance: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-300">Targeted Maintenance Rules</h4>
              <button 
                onClick={addMaintenanceRule}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {AppStrings.Settings.maintenance.addRuleBtn}
              </button>
            </div>
            
            <div className="space-y-4">
              {maintenance.targeted_versions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No targeted maintenance rules configured.</p>
              )}
              {maintenance.targeted_versions.map((rule, idx) => (
                <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 relative group">
                  <button 
                    onClick={() => removeMaintenanceRule(idx)}
                    className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-rose-400 bg-slate-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.maintenance.rulePlatform}</label>
                      <select
                        value={rule.platform}
                        onChange={(e) => updateMaintenanceRule(idx, { platform: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 text-slate-200"
                      >
                        <option value="all">All Platforms</option>
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.maintenance.ruleVersions}</label>
                      <input
                        type="text"
                        value={rule.affected_versions.join(', ')}
                        onChange={(e) => updateMaintenanceRule(idx, { affected_versions: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
                        placeholder="1.0.1, 1.0.2"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 text-slate-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.maintenance.ruleTitle}</label>
                      <input
                        type="text"
                        value={rule.title}
                        onChange={(e) => updateMaintenanceRule(idx, { title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.maintenance.ruleMessage}</label>
                      <textarea
                        value={rule.message}
                        onChange={(e) => updateMaintenanceRule(idx, { message: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 text-slate-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <span className="text-xs font-medium text-slate-400">{AppStrings.Settings.maintenance.ruleActive}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={rule.is_active}
                        onChange={(e) => updateMaintenanceRule(idx, { is_active: e.target.checked })}
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VERSION CONTROL SECTION */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-[20px] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">{AppStrings.Settings.version.header}</h3>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab('android')}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'android' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            {AppStrings.Settings.version.androidTab}
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ios' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            {AppStrings.Settings.version.iosTab}
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.version.minVersion}</label>
              <input
                type="text"
                value={activeVersionData.min_supported_version}
                onChange={(e) => setVersion({ ...version, [activeTab]: { ...activeVersionData, min_supported_version: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.version.latestVersion}</label>
              <input
                type="text"
                value={activeVersionData.latest_version}
                onChange={(e) => setVersion({ ...version, [activeTab]: { ...activeVersionData, latest_version: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.version.storeUrl}</label>
              <input
                type="text"
                value={activeVersionData.store_url}
                onChange={(e) => setVersion({ ...version, [activeTab]: { ...activeVersionData, store_url: e.target.value } })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-300">{AppStrings.Settings.version.blockedHeader}</h4>
              <button 
                onClick={() => addBlockedVersion(activeTab)}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {AppStrings.Settings.version.addBlockedBtn}
              </button>
            </div>

            <div className="space-y-4">
              {activeVersionData.blocked_versions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No blocked versions configured.</p>
              )}
              {activeVersionData.blocked_versions.map(vStr => {
                const vMsg = activeVersionData.version_messages[vStr] || { title: '', message: '', release_notes: [] };
                
                return (
                  <div key={vStr} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-sm font-bold border border-rose-500/20">
                        {vStr}
                      </div>
                      <button 
                        onClick={() => removeBlockedVersion(activeTab, vStr)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-900 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.version.updateTitle}</label>
                        <input
                          type="text"
                          value={vMsg.title}
                          onChange={(e) => updateVersionMessage(activeTab, vStr, { title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">{AppStrings.Settings.version.updateMessage}</label>
                        <textarea
                          value={vMsg.message}
                          onChange={(e) => updateVersionMessage(activeTab, vStr, { message: e.target.value })}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200 resize-none"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{AppStrings.Settings.version.releaseNotes}</label>
                      <div className="space-y-2 mb-3">
                        {vMsg.release_notes.map((note, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5 text-xs">•</span>
                            <span className="text-sm text-slate-300 flex-1">{note}</span>
                            <button 
                              onClick={() => {
                                const newNotes = [...vMsg.release_notes];
                                newNotes.splice(idx, 1);
                                updateVersionMessage(activeTab, vStr, { release_notes: newNotes });
                              }}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNoteInputs[`${activeTab}_${vStr}`] || ''}
                          onChange={(e) => setNewNoteInputs({ ...newNoteInputs, [`${activeTab}_${vStr}`]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && addReleaseNote(activeTab, vStr)}
                          placeholder="Add a bullet point..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
                        />
                        <button
                          onClick={() => addReleaseNote(activeTab, vStr)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE FLAGS SECTION */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-[20px] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">{AppStrings.Settings.flagsHeader}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-5 py-4 bg-slate-950/50 border border-slate-800/60 rounded-xl">
            <span className="text-sm font-medium text-slate-200">{AppStrings.Settings.flags.chat}</span>
            <button 
              onClick={() => setFlags({ ...flags, chat: !flags.chat })}
              className={`text-sm font-bold transition-colors ${flags.chat ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {flags.chat ? AppStrings.Common.enabled : AppStrings.Common.disabled}
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4 bg-slate-950/50 border border-slate-800/60 rounded-xl">
            <span className="text-sm font-medium text-slate-200">{AppStrings.Settings.flags.travel}</span>
            <button 
              onClick={() => setFlags({ ...flags, travel: !flags.travel })}
              className={`text-sm font-bold transition-colors ${flags.travel ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {flags.travel ? AppStrings.Common.enabled : AppStrings.Common.disabled}
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-4 bg-slate-950/50 border border-slate-800/60 rounded-xl">
            <span className="text-sm font-medium text-slate-200">{AppStrings.Settings.flags.sports}</span>
            <button 
              onClick={() => setFlags({ ...flags, sports: !flags.sports })}
              className={`text-sm font-bold transition-colors ${flags.sports ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {flags.sports ? AppStrings.Common.enabled : AppStrings.Common.disabled}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
