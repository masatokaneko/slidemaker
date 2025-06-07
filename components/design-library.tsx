import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { PrismaClient } from '@prisma/client';
import { Monitoring } from '@/lib/monitoring';

interface DesignComponent {
  id: string;
  type: string;
  json: any;
  name: string;
  sourcePdfId?: string;
}

interface DesignLibraryProps {
  onComponentSelect: (component: DesignComponent) => void;
}

export function DesignLibrary({ onComponentSelect }: DesignLibraryProps) {
  const [components, setComponents] = useState<DesignComponent[]>([]);
  const [filter, setFilter] = useState({
    type: '',
    sourcePdf: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComponents();
  }, [filter]);

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/design-components?' + new URLSearchParams({
        type: filter.type,
        sourcePdf: filter.sourcePdf
      }));
      const data = await response.json();
      setComponents(data.components);
    } catch (error) {
      console.error('Failed to fetch components:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'design-component',
    drop: (item: DesignComponent) => {
      onComponentSelect(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div className="w-80 border-r border-gray-200 p-4 flex flex-col">
      {/* 検索バー */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="コンポーネントを検索..."
          className="w-full p-2 border rounded"
          onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
        />
      </div>

      {/* フィルター */}
      <div className="mb-4 flex gap-2">
        <select
          className="flex-1 p-2 border rounded"
          value={filter.type}
          onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="">すべてのタイプ</option>
          <option value="heading">見出し</option>
          <option value="chart">グラフ</option>
          <option value="cover">カバー</option>
        </select>
        <select
          className="flex-1 p-2 border rounded"
          value={filter.sourcePdf}
          onChange={(e) => setFilter(prev => ({ ...prev, sourcePdf: e.target.value }))}
        >
          <option value="">すべてのPDF</option>
          {/* TODO: PDFのリストを動的に生成 */}
        </select>
      </div>

      {/* コンポーネント一覧 */}
      <div
        ref={drop}
        className={`flex-1 overflow-y-auto ${
          isOver ? 'bg-blue-50' : ''
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {components.map((component) => (
              <div
                key={component.id}
                className="p-2 border rounded cursor-move hover:bg-gray-50"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(component));
                }}
              >
                <div className="text-sm font-medium">{component.name}</div>
                <div className="text-xs text-gray-500">{component.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 