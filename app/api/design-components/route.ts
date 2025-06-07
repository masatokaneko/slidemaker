import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Cache } from '@/lib/cache';
import { Monitoring } from '@/lib/monitoring';
import { CustomError, ErrorCode } from '@/lib/error-handler';

const prisma = new PrismaClient();
const cache = Cache.getInstance();
const monitoring = Monitoring.getInstance();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || '';
    const sourcePdf = searchParams.get('sourcePdf') || '';

    // キャッシュキーの生成
    const cacheKey = `design-components:${type}:${sourcePdf}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ components: JSON.parse(cachedData) });
    }

    // データベースからコンポーネントを取得
    const components = await prisma.designComponent.findMany({
      where: {
        type: type || undefined,
        sourcePdfId: sourcePdf || undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // キャッシュに保存
    await cache.set(cacheKey, JSON.stringify(components), 3600); // 1時間

    // メトリクスを記録
    await monitoring.trackMetric('design_components_fetched', {
      count: components.length,
      type,
      sourcePdf,
    });

    return NextResponse.json({ components });
  } catch (error) {
    console.error('Failed to fetch design components:', error);
    await monitoring.logError(error as Error, {
      context: 'GET /api/design-components',
    });

    if (error instanceof CustomError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, json, name, sourcePdfId } = body;

    // バリデーション
    if (!type || !json || !name) {
      throw new CustomError(
        'Missing required fields',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    // コンポーネントを作成
    const component = await prisma.designComponent.create({
      data: {
        type,
        json,
        name,
        sourcePdfId,
      },
    });

    // キャッシュをクリア
    await cache.delete('design-components:*');

    // メトリクスを記録
    await monitoring.trackMetric('design_component_created', {
      type,
      sourcePdfId,
    });

    return NextResponse.json({ component });
  } catch (error) {
    console.error('Failed to create design component:', error);
    await monitoring.logError(error as Error, {
      context: 'POST /api/design-components',
    });

    if (error instanceof CustomError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 