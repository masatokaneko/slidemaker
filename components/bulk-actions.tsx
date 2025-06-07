import { useState } from 'react';
import { Monitoring } from '@/lib/monitoring';

interface BulkActionsProps {
  selectedComponents: string[];
  onCategoryChange: (categoryId: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function BulkActions({
  selectedComponents,
  onCategoryChange,
  onDelete,
}: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCategoryChange = async () => {
    if (!selectedCategory) return;

    try {
      setIsLoading(true);
      setError(null);

      await onCategoryChange(selectedCategory);

      // メトリクスを記録
      await Monitoring.getInstance().trackMetric('bulk_category_change', {
        count: selectedComponents.length,
        categoryId: selectedCategory,
      });
    } catch (error) {
      console.error('Failed to change category:', error);
      setError(error instanceof Error ? error.message : 'カテゴリの変更に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`${selectedComponents.length}件のコンポーネントを削除してもよろしいですか？`)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onDelete();

      // メトリクスを記録
      await Monitoring.getInstance().trackMetric('bulk_delete', {
        count: selectedComponents.length,
      });
    } catch (error) {
      console.error('Failed to delete components:', error);
      setError(error instanceof Error ? error.message : '削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedComponents.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {selectedComponents.length}件選択中
          </span>
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded"
              disabled={isLoading}
            >
              <option value="">カテゴリを選択</option>
              {/* TODO: カテゴリのリストを動的に生成 */}
            </select>
            <button
              onClick={handleCategoryChange}
              disabled={isLoading || !selectedCategory}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              カテゴリを変更
            </button>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          削除
        </button>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mt-2 p-2 bg-red-50 text-red-500 text-sm rounded">
          {error}
        </div>
      )}
    </div>
  );
} 