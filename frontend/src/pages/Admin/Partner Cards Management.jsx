import { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api";
import AdminSidebar from "../../components/Admin/Sidebar";
import { useToast } from "../../components/common/Toast";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";

export default function PackageManagement() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Starter",
    description: "",
    price: "",
    features: "",
    validityDays: 365,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
  try {
    setLoading(true);

    const res = await adminAPI.getPartnerCards();

    console.log("API RESPONSE:", res.data);

    // ✅ FIX HERE
    setPackages(res.data.data || []);

  } catch (error) {
    console.error("Error fetching partner cards:", error);
    showToast("Failed to load partner cards", "error");
  } finally {
    setLoading(false);
  }
};

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        category: pkg.category,
        description: pkg.description,
        price: pkg.price,
        features: Array.isArray(pkg.features) ? pkg.features.join(", ") : "",
        validityDays: pkg.validityDays,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        category: "Starter",
        description: "",
        price: "",
        features: "",
        validityDays: 365,
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.price || !formData.description) {
    showToast("Please fill all required fields", "error");
    return;
  }

  try {
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f),
      validityDays: parseInt(formData.validityDays),
    };

    if (editingPackage) {
      await adminAPI.updatePartnerCard(editingPackage._id, payload); // ✅ FIX
      showToast("Package updated successfully", "success");
    } else {
      await adminAPI.createPartnerCard(payload); // ✅ FIX
      showToast("Package created successfully", "success");
    }

    setShowModal(false);
    fetchPackages();
  } catch (error) {
    console.error("Error saving package:", error);
    showToast("Failed to save package", "error");
  }
};

  const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to delete this package?")) {
    try {
      await adminAPI.deletePartnerCard(id); // ✅ FIXED

      showToast("Package deleted successfully", "success");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      showToast("Failed to delete package", "error");
    }
  }
};

  // if (loading) return <LoadingSpinner />;

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
                <h2 className="text-2xl font-bold text-gray-900">
                  Package Management
                </h2>
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  + Add New Cards
                </Button>
              </div>

              {packages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    No partner cards found. Click "Add New Card" to create one.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {pkg.name}
                          </h3>
                          <p className="text-sm text-gray-600 bg-blue-200 px-2 py-1 rounded inline-block mt-1">
                            {pkg.category}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {pkg.description}
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{pkg.price}
                        </span>
                        <span className="text-xs text-gray-600">
                          {pkg.validityDays} days
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Features:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {Array.isArray(pkg.features) &&
                            pkg.features
                              .slice(0, 3)
                              .map((feature, idx) => (
                                <li key={idx}>• {feature}</li>
                              ))}
                          {Array.isArray(pkg.features) &&
                            pkg.features.length > 3 && (
                              <li>+ {pkg.features.length - 3} more</li>
                            )}
                          {!Array.isArray(pkg.features) && (
                            <li>No features listed</li>
                          )}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(pkg)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingPackage ? "Edit Package" : "Create New Package"}
              >
                <div className="w-full">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="e.g., Starter Plan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Package description"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Features (comma-separated)
                      </label>
                      <textarea
                        name="features"
                        value={formData.features}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Feature 1, Feature 2, Feature 3"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validity (Days)
                      </label>
                      <input
                        type="number"
                        name="validityDays"
                        value={formData.validityDays}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                      >
                        {editingPackage ? "Update" : "Create"}
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
