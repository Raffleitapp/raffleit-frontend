import React, { useState, useEffect } from 'react';

interface CategoryItem {
  id: string;
  name: string;
  raffleCount?: number;
}

const Category = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockCategories: CategoryItem[] = [
          { id: 'cat-001', name: 'Electronics', raffleCount: 25 },
          { id: 'cat-002', name: 'Vehicles', raffleCount: 10 },
          { id: 'cat-003', name: 'Travel & Experiences', raffleCount: 8 },
          { id: 'cat-004', name: 'Home Goods', raffleCount: 15 },
          { id: 'cat-005', name: 'Fashion & Accessories', raffleCount: 12 },
        ];
        setCategories(mockCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setMessage({ type: 'error', text: 'Category name cannot be empty.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (editingCategory) {
        const updatedCategory: CategoryItem = { ...editingCategory, name: categoryName.trim() };
        setCategories(categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
        setMessage({ type: 'success', text: `Category "${updatedCategory.name}" updated successfully!` });
      } else {
        const newCategory: CategoryItem = { id: `cat-${Date.now()}`, name: categoryName.trim(), raffleCount: 0 };
        setCategories([...categories, newCategory]);
        setMessage({ type: 'success', text: `Category "${newCategory.name}" added successfully!` });
      }
      setCategoryName('');
      setEditingCategory(null);
    } catch (err) {
      console.error("Failed to save category:", err);
      setMessage({ type: 'error', text: `Failed to ${editingCategory ? 'update' : 'add'} category. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setMessage(null);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone and may affect associated raffles.`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCategories(categories.filter(cat => cat.id !== categoryId));
      setMessage({ type: 'success', text: `Category "${categoryName}" deleted successfully!` });
    } catch (err) {
      console.error("Failed to delete category:", err);
      setMessage({ type: 'error', text: `Failed to delete category "${categoryName}". It might have associated raffles.` });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setMessage(null);
  };

  if (loading && !categories.length) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="loader"></div> Loading Categories...
        <style>{`
                  .loader {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-left: 10px;
                  }

                  @keyframes spin {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Category Management</h1>
      <p className="text-lg text-gray-700 mb-8">Add, edit, or delete raffle categories.</p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </h2>
        {message && (
          <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              id="categoryName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Electronics, Vehicles"
              required
              disabled={loading}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading && editingCategory ? (
                <>
                  <span className="loader mr-2"></span> Updating...
                </>
              ) : loading ? (
                <>
                  <span className="loader mr-2"></span> Adding...
                </>
              ) : editingCategory ? (
                'Update Category'
              ) : (
                'Add Category'
              )}
              <style>{`
                .loader {
                  border: 2px solid #f3f3f3;
                  border-top: 2px solid #fff;
                  border-radius: 50%;
                  width: 16px;
                  height: 16px;
                  animation: spin 1s linear infinite;
                  display: inline-block;
                  vertical-align: middle;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raffles Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">No categories found. Add one above!</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.raffleCount ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Category;