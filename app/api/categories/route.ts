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
    // キャッシュから取得
    const cacheKey = 'categories:all';
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ categories: JSON.parse(cachedData) });
    }

    // データベースから取得
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { components: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // キャッシュに保存
    await cache.set(cacheKey, JSON.stringify(categories), 3600); // 1時間

    // メトリクスを記録
    await monitoring.trackMetric('categories_fetched', {
      count: categories.length,
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    await monitoring.logError(error as Error, {
      context: 'GET /api/categories',
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
    const { name, description } = body;

    // バリデーション
    if (!name) {
      throw new CustomError(
        'カテゴリ名は必須です',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    // カテゴリを作成
    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    // キャッシュをクリア
    await cache.delete('categories:*');

    // メトリクスを記録
    await monitoring.trackMetric('category_created', {
      categoryId: category.id,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Failed to create category:', error);
    await monitoring.logError(error as Error, {
      context: 'POST /api/categories',
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    // バリデーション
    if (!id || !name) {
      throw new CustomError(
        'カテゴリIDと名前は必須です',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    // カテゴリを更新
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    // キャッシュをクリア
    await cache.delete('categories:*');

    // メトリクスを記録
    await monitoring.trackMetric('category_updated', {
      categoryId: category.id,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Failed to update category:', error);
    await monitoring.logError(error as Error, {
      context: 'PUT /api/categories',
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new CustomError(
        'カテゴリIDは必須です',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }

    // カテゴリを削除
    await prisma.category.delete({
      where: { id },
    });

    // キャッシュをクリア
    await cache.delete('categories:*');

    // メトリクスを記録
    await monitoring.trackMetric('category_deleted', {
      categoryId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    await monitoring.logError(error as Error, {
      context: 'DELETE /api/categories',
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