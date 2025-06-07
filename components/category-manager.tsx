import { useState, useEffect } from 'react';
import { Monitoring } from '@/lib/monitoring';

interface Category {
  id: string;
  name: string;
  description?: string;
  _count: {
    components: number;
  };
}

interface CategoryManagerProps {
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryManager({ onCategorySelect }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCategories(data.categories);

      // メトリクスを記録
      await Monitoring.getInstance().trackMetric('categories_loaded', {
        count: data.categories.length,
      });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError(error instanceof Error ? error.message : 'カテゴリの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCategories([...categories, data.category]);
      setNewCategory({ name: '', description: '' });
      setIsCreating(false);

      // メトリクスを記録
      await Monitoring.getInstance().trackMetric('category_created', {
        categoryId: data.category.id,
      });
    } catch (error) {
      console.error('Failed to create category:', error);
      setError(error instanceof Error ? error.message : 'カテゴリの作成に失敗しました');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('このカテゴリを削除してもよろしいですか？')) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCategories(categories.filter(category => category.id !== id));

      // メトリクスを記録
      await Monitoring.getInstance().trackMetric('category_deleted', {
        categoryId: id,
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError(error instanceof Error ? error.message : 'カテゴリの削除に失敗しました');
    }
  };

  return (
    <div className="w-64 border-r border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">カテゴリ</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="text-blue-500 hover:text-blue-600"
        >
          ＋
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateCategory} className="mb-4 p-4 bg-gray-50 rounded">
          <div className="mb-2">
            <input
              type="text"
              placeholder="カテゴリ名"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              placeholder="説明（任意）"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              作成
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500">
                      {category.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {category._count.components}件
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 