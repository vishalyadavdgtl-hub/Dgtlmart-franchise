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
    crmUrl: '',
    ndaTemplateUrl: '',
    agreementTemplateUrl: '',
    meetingLink: ''
  });
  
  const [templateDocs, setTemplateDocs] = useState({
    ndaTemplate: null,
    agreementTemplate: null
  });
  const [uploadingTemplates, setUploadingTemplates] = useState(false);

  useEffect(() => {
    console.log('SettingsManagement mounted');
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
          crmUrl: response.data.crmUrl || '',
          ndaTemplateUrl: response.data.ndaTemplateUrl || '',
          agreementTemplateUrl: response.data.agreementTemplateUrl || '',
          meetingLink: response.data.meetingLink || ''
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

  const handleTemplateFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        e.target.value = '';
        return;
      }
      setTemplateDocs(prev => ({ ...prev, [docType]: file }));
    }
  };

  const handleUploadTemplates = async (e) => {
    e.preventDefault();
    if (!templateDocs.ndaTemplate && !templateDocs.agreementTemplate) {
      showToast('Please select at least one template to upload', 'error');
      return;
    }
    setUploadingTemplates(true);
    try {
      const formData = new FormData();
      if (templateDocs.ndaTemplate) formData.append('ndaTemplate', templateDocs.ndaTemplate);
      if (templateDocs.agreementTemplate) formData.append('agreementTemplate', templateDocs.agreementTemplate);

      const res = await adminAPI.uploadTemplates(formData);
      showToast('Templates uploaded successfully', 'success');
      setSettings(prev => ({
        ...prev,
        ndaTemplateUrl: res.data.settings.ndaTemplateUrl || prev.ndaTemplateUrl,
        agreementTemplateUrl: res.data.settings.agreementTemplateUrl || prev.agreementTemplateUrl,
      }));
      setTemplateDocs({ ndaTemplate: null, agreementTemplate: null });
      // Reset inputs
      document.getElementById('ndaTemplateInput').value = '';
      document.getElementById('agreementTemplateInput').value = '';
    } catch (error) {
      console.error('Error uploading templates:', error);
      showToast('Failed to upload templates', 'error');
    } finally {
      setUploadingTemplates(false);
    }
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
            <>
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


                  {/* Meeting Link */}
                  <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3">Discovery Call Meeting Link</h3>
                    <input
                      type="url"
                      name="meetingLink"
                      value={settings.meetingLink}
                      onChange={handleInputChange}
                      placeholder="https://calendly.com/your-link OR https://zoom.us/j/... OR https://meet.google.com/..."
                      className="w-full rounded-xl border border-indigo-200 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <p className="text-xs text-indigo-500 mt-1.5">After partners submit their documents, this link will be displayed on the Schedule Meeting page</p>
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
              <div className="p-6 md:p-8">
                <form onSubmit={handleUploadTemplates} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Master Document Templates
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Upload the blank NDA and Agreement PDFs. These will be shown to all users when they apply for a franchise or referral partnership.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Master NDA Template <span className="text-gray-400 font-normal text-xs ml-1">(PDF, JPG, PNG up to 5MB)</span> {settings.ndaTemplateUrl && <span className="text-green-600 text-xs ml-2">(Current: {settings.ndaTemplateUrl})</span>}
                        </label>
                        <input
                          id="ndaTemplateInput"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleTemplateFileChange(e, 'ndaTemplate')}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors border border-gray-200 rounded-lg p-1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Master Agreement Template <span className="text-gray-400 font-normal text-xs ml-1">(PDF, JPG, PNG up to 5MB)</span> {settings.agreementTemplateUrl && <span className="text-green-600 text-xs ml-2">(Current: {settings.agreementTemplateUrl})</span>}
                        </label>
                        <input
                          id="agreementTemplateInput"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleTemplateFileChange(e, 'agreementTemplate')}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors border border-gray-200 rounded-lg p-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={uploadingTemplates}
                      className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploadingTemplates ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload Templates'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

