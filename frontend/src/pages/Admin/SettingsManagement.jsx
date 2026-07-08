import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SettingsManagement() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    brandingKitUrl: '',
    proposalsUrl: '',
    driveUrl: '',
    crmUrl: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      if (response.data) {
        setSettings({
          brandingKitUrl: response.data.brandingKitUrl || '',
          proposalsUrl: response.data.proposalsUrl || '',
          driveUrl: response.data.driveUrl || '',
          crmUrl: response.data.crmUrl || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      showToast('Settings updated successfully', 'success');
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              System Settings
            </h1>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Branding & CRM Links
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Update the URLs that Franchise Partners will see in their dashboard for branding materials and CRM access.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branding Kit URL
                        </label>
                        <input
                          type="url"
                          name="brandingKitUrl"
                          value={settings.brandingKitUrl}
                          onChange={handleInputChange}
                          placeholder="https://drive.google.com/..."
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proposals URL
                        </label>
                        <input
                          type="url"
                          name="proposalsUrl"
                          value={settings.proposalsUrl}
                          onChange={handleInputChange}
                          placeholder="https://drive.google.com/..."
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Open Drive URL
                        </label>
                        <input
                          type="url"
                          name="driveUrl"
                          value={settings.driveUrl}
                          onChange={handleInputChange}
                          placeholder="https://drive.google.com/..."
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CRM URL
                        </label>
                        <input
                          type="url"
                          name="crmUrl"
                          value={settings.crmUrl}
                          onChange={handleInputChange}
                          placeholder="https://crm.zoho.com/..."
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
