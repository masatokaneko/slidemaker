-- 🔴 最高優先度: 初期データの投入

-- サンプルユーザーの作成
INSERT INTO users (id, name, email, role, email_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@example.com', 'admin', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440001', 'Test User', 'test@example.com', 'user', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'Demo User', 'demo@example.com', 'user', CURRENT_TIMESTAMP);

-- サンプルテンプレートの作成
INSERT INTO templates (id, title, description, category, industry, yaml_data, is_public, featured, user_id) VALUES 
(
  '660e8400-e29b-41d4-a716-446655440000',
  'BCG戦略分析テンプレート',
  'コンサルティング向けの戦略分析テンプレート。2x2マトリックス、競合分析、市場ポジショニングを含む',
  'consulting',
  'consulting',
  '---
title: 戦略分析プレゼンテーション
slides:
  - type: title
    content:
      title: 戦略分析
      subtitle: BCGスタイル分析フレームワーク
  
  - type: content
    content:
      title: エグゼクティブサマリー
      points:
        - "市場機会の特定と評価"
        - "競合優位性の分析"
        - "戦略的提言と実行計画"
  
  - type: chart
    content:
      title: 市場成長率 vs 市場シェア
      chart_type: "scatter"
      data:
        labels: ["製品A", "製品B", "製品C", "製品D"]
        datasets:
          - label: "ポートフォリオ分析"
            data: [
              {"x": 15, "y": 25},
              {"x": 30, "y": 45},
              {"x": 45, "y": 15},
              {"x": 60, "y": 35}
            ]
  
  - type: comparison
    content:
      title: 競合比較分析
      layout: "2x2"
      items:
        - title: "自社"
          value: "85%"
          trend: "+12%"
        - title: "競合A"
          value: "72%"
          trend: "+8%"
        - title: "競合B"
          value: "68%"
          trend: "+5%"
        - title: "競合C"
          value: "45%"
          trend: "-2%"',
  true,
  true,
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '660e8400-e29b-41d4-a716-446655440001',
  '営業プレゼンテンプレート',
  '営業向けのプレゼンテーションテンプレート。製品紹介、ROI分析、導入事例を含む',
  'sales',
  'technology',
  '---
title: 製品紹介プレゼンテーション
slides:
  - type: title
    content:
      title: 革新的ソリューション
      subtitle: あなたのビジネスを次のレベルへ
  
  - type: content
    content:
      title: 課題と解決策
      points:
        - "現在の課題: 効率性の低下"
        - "我々の解決策: AI駆動の自動化"
        - "期待される効果: 30%の効率向上"
  
  - type: chart
    content:
      title: ROI分析
      chart_type: "bar"
      data:
        labels: ["導入前", "3ヶ月後", "6ヶ月後", "12ヶ月後"]
        datasets:
          - label: "コスト削減効果"
            data: [0, 150, 300, 500]
          - label: "売上向上効果"
            data: [0, 100, 250, 400]',
  true,
  false,
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  '財務報告テンプレート',
  '四半期・年次財務報告用のテンプレート。P/L、B/S、キャッシュフロー分析を含む',
  'financial',
  'finance',
  '---
title: 第1四半期 財務報告
slides:
  - type: title
    content:
      title: Q1 財務報告
      subtitle: 2024年第1四半期業績
  
  - type: chart
    content:
      title: 売上推移
      chart_type: "line"
      data:
        labels: ["1月", "2月", "3月"]
        datasets:
          - label: "売上高"
            data: [1200, 1350, 1480]
          - label: "前年同期"
            data: [1100, 1200, 1300]
  
  - type: comparison
    content:
      title: 主要指標
      layout: "2x2"
      items:
        - title: "売上高"
          value: "4.03億円"
          trend: "+15%"
        - title: "営業利益"
          value: "0.85億円"
          trend: "+22%"
        - title: "純利益"
          value: "0.62億円"
          trend: "+18%"
        - title: "ROE"
          value: "12.5%"
          trend: "+2.1pt"',
  true,
  true,
  '550e8400-e29b-41d4-a716-446655440000'
);

-- サンプルプロジェクトの作成
INSERT INTO projects (id, title, description, yaml_data, tags, user_id) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440000',
  '第1四半期売上分析',
  '2024年第1四半期の売上実績と分析レポート',
  '---
title: Q1売上分析レポート
slides:
  - type: title
    content:
      title: 第1四半期売上分析
      subtitle: 2024年1-3月実績報告
  
  - type: chart
    content:
      title: 月別売上推移
      chart_type: "bar"
      data:
        labels: ["1月", "2月", "3月"]
        datasets:
          - label: "売上高"
            data: [1200, 1350, 1480]',
  ARRAY['ビジネス', 'データ分析', '売上'],
  '550e8400-e29b-41d4-a716-446655440001'
),
(
  '770e8400-e29b-41d4-a716-446655440001',
  '新製品ローンチ計画',
  '新製品の市場投入戦略とマーケティング計画',
  '---
title: 新製品ローンチ戦略
slides:
  - type: title
    content:
      title: 新製品ローンチ計画
      subtitle: 市場投入戦略 2024
  
  - type: content
    content:
      title: ローンチ戦略
      points:
        - "ターゲット市場の特定"
        - "競合分析と差別化戦略"
        - "マーケティングミックス"',
  ARRAY['戦略', 'マーケティング', '新製品'],
  '550e8400-e29b-41d4-a716-446655440002'
);

COMMIT;
