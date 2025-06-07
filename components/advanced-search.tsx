import { useState, useEffect } from 'react';
import { Monitoring } from '@/lib/monitoring';

interface SearchFilter {
  query: string;
  type: string;
  category: string;
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onFilterChange: (filter: SearchFilter) => void;
}

export function AdvancedSearch({ onFilterChange }: AdvancedSearchProps) {
  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    type: '',
    category: '',
    dateRange: {
      start: '',
      end: '',
    },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setCategories(data.categories);

      // メトリクスを記録
      await Monitoring.getInstance().trackMetric('search_categories_loaded', {
        count: data.categories.length,
      });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFilterChange = (key: keyof SearchFilter, value: any) => {
    const newFilter = { ...filter, [key]: value };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    const newFilter = {
      ...filter,
      dateRange: { ...filter.dateRange, [key]: value },
    };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilter = {
      ...filter,
      sortBy,
      sortOrder: filter.sortBy === sortBy && filter.sortOrder === 'asc' ? 'desc' : 'asc',
    };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="コンポーネントを検索..."
          value={filter.query}
          onChange={(e) => handleFilterChange('query', e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          {isExpanded ? '詳細検索を閉じる' : '詳細検索'}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイプ
            </label>
            <select
              value={filter.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">すべて</option>
              <option value="heading">見出し</option>
              <option value="chart">グラフ</option>
              <option value="cover">カバー</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              value={filter.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">すべて</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作成日（開始）
            </label>
            <input
              type="date"
              value={filter.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作成日（終了）
            </label>
            <input
              type="date"
              value={filter.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              並び替え
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('createdAt')}
                className={`px-3 py-1 rounded ${
                  filter.sortBy === 'createdAt'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                作成日
                {filter.sortBy === 'createdAt' && (
                  <span>{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                onClick={() => handleSortChange('name')}
                className={`px-3 py-1 rounded ${
                  filter.sortBy === 'name'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                名前
                {filter.sortBy === 'name' && (
                  <span>{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                onClick={() => handleSortChange('type')}
                className={`px-3 py-1 rounded ${
                  filter.sortBy === 'type'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                タイプ
                {filter.sortBy === 'type' && (
                  <span>{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 