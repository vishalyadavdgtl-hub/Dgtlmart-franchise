
import {useEffect, useState} from "react";
import { adminAPI } from "../../utils/api";
import AdminSidebar from "../../components/Admin/Sidebar";
import {useToast} from "../../components/common/Toast";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";

export default function TrainingManagement() {
  const { showToast } = useToast();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Getting Started',
    difficulty: 'Beginner',
    duration: 0,
    videoUrl: '',
    order: 0
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTrainingModules();
      setModules(response.data.modules || []);
    } catch (error) {
      console.error('Error fetching training modules:', error);
      showToast('Failed to load training modules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        title: module.title,
        description: module.description,
        content: module.content,
        category: module.category,
        difficulty: module.difficulty,
        duration: module.duration,
        videoUrl: module.videoUrl || '',
        order: module.order
      });
    } else {
      setEditingModule(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        category: 'Getting Started',
        difficulty: 'Beginner',
        duration: 0,
        videoUrl: '',
        order: 0
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.content) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration),
        order: parseInt(formData.order)
      };

      if (editingModule) {
        await adminAPI.updateTrainingModule(editingModule._id, payload);
        showToast('Training module updated successfully', 'success');
      } else {
        await adminAPI.createTrainingModule(payload);
        showToast('Training module created successfully', 'success');
      }

      setShowModal(false);
      fetchModules();
    } catch (error) {
      console.error('Error saving training module:', error);
      showToast('Failed to save training module', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this training module?')) {
      try {
        await adminAPI.deleteTrainingModule(id);
        showToast('Training module deleted successfully', 'success');
        fetchModules();
      } catch (error) {
        console.error('Error deleting training module:', error);
        showToast('Failed to delete training module', 'error');
      }
    }
  };

  // if (loading) return <LoadingSpinner />;
  // {loading ? <Loader /> : <Content />}

  return (
    <div className="flex min-h-screen bg-gray-50">
      
        <AdminSidebar />
     
      
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        {loading ? (
          <LoadingSpinner />
        ) : (
        <div className="max-w-7xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Training Modules Management</h2>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + Add Training Module
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3 text-left font-semibold">Title</th>
              <th className="border p-3 text-left font-semibold">Category</th>
              <th className="border p-3 text-left font-semibold">Difficulty</th>
              <th className="border p-3 text-left font-semibold">Duration</th>
              <th className="border p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module._id} className="hover:bg-gray-50">
                <td className="border p-3">{module.title}</td>
                <td className="border p-3">
                  <span className="bg-blue-200 px-2 py-1 rounded text-sm">{module.category}</span>
                </td>
                <td className="border p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    module.difficulty === 'Beginner' ? 'bg-green-200' :
                    module.difficulty === 'Intermediate' ? 'bg-yellow-200' :
                    'bg-red-200'
                  }`}>
                    {module.difficulty}
                  </span>
                </td>
                <td className="border p-3">{module.duration} mins</td>
                <td className="border p-3 text-center">
                  <button
                    onClick={() => handleOpenModal(module)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(module._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingModule ? 'Edit Training Module' : 'Create New Training Module'}
      >
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Module title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Module description"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Module content/body"
                  rows="4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="Getting Started">Getting Started</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="https://example.com/video"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                >
                  {editingModule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
      </Modal>
        </div>
        
      </div>
      )}
    </div>
    </div>
  );
}

        
