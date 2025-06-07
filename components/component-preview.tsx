import { useState, useEffect } from 'react';
import { Monitoring } from '@/lib/monitoring';

interface ComponentPreviewProps {
  component: {
    id: string;
    type: string;
    json: any;
    name: string;
  };
  onClose: () => void;
}

export function ComponentPreview({ component, onClose }: ComponentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    renderPreview();
  }, [component]);

  const renderPreview = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // プレビューのレンダリング
      const previewContainer = document.getElementById('preview-container');
      if (!previewContainer) return;

      switch (component.type) {
        case 'heading':
          renderHeadingPreview(previewContainer, component.json);
          break;
        case 'chart':
          await renderChartPreview(previewContainer, component.json);
          break;
        case 'cover':
          renderCoverPreview(previewContainer, component.json);
          break;
        default:
          throw new Error(`Unsupported component type: ${component.type}`);
      }

      // メトリクスを記録
      await Monitoring.getInstance().trackMetric('component_preview_rendered', {
        type: component.type,
        componentId: component.id,
      });
    } catch (error) {
      console.error('Failed to render preview:', error);
      setError(error instanceof Error ? error.message : 'プレビューの表示に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeadingPreview = (container: HTMLElement, json: any) => {
    container.innerHTML = `
      <div class="p-4 bg-white rounded shadow">
        <h${json.level} class="text-${json.size} font-${json.weight} text-${json.color}">
          ${json.text}
        </h${json.level}>
      </div>
    `;
  };

  const renderChartPreview = async (container: HTMLElement, json: any) => {
    // Chart.jsを使用してグラフをレンダリング
    const { Chart } = await import('chart.js/auto');
    const canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);

    new Chart(canvas, {
      type: json.type,
      data: json.data,
      options: json.options,
    });
  };

  const renderCoverPreview = (container: HTMLElement, json: any) => {
    container.innerHTML = `
      <div class="p-4 bg-white rounded shadow">
        <div class="text-${json.titleSize} font-bold mb-4">${json.title}</div>
        <div class="text-${json.subtitleSize} text-gray-600">${json.subtitle}</div>
        ${json.image ? `<img src="${json.image}" class="mt-4 max-w-full h-auto" />` : ''}
      </div>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{component.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : (
          <div id="preview-container" className="min-h-[300px]" />
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
} 