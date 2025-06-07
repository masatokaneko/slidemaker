import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from '@ai-sdk/openai';
import { NLPEditRequest, NLPEditResponse, NLPEditFunction } from '@/types/nlp-edit';
import { CustomError, ErrorCode, handleError } from '@/lib/error-handler';
import { Cache } from '@/lib/cache';
import { Monitoring } from '@/lib/monitoring';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cache = Cache.getInstance();
const monitoring = Monitoring.getInstance();

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as NLPEditRequest;
    const { slideId, instruction } = body;

    // キャッシュチェック
    const cacheKey = `nlp-edit:${slideId}:${instruction}`;
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json(JSON.parse(cachedResult));
    }

    // GPT-4 function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'あなたはPowerPointスライドの編集アシスタントです。ユーザーの指示に基づいてスライドを編集してください。',
        },
        {
          role: 'user',
          content: instruction,
        },
      ],
      functions: [NLPEditFunction],
      function_call: { name: 'editSlide' },
    });

    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall) {
      throw new CustomError(ErrorCode.VALIDATION_ERROR, '編集内容の生成に失敗しました');
    }

    const { changes } = JSON.parse(functionCall.arguments);
    const updatedSlideYaml = await applyChanges(slideId, changes);

    // キャッシュに保存
    const response: NLPEditResponse = {
      success: true,
      data: { updatedSlideYaml },
    };
    await cache.set(cacheKey, JSON.stringify(response), 3600); // 1時間

    // メトリクスを記録
    await monitoring.trackMetric('nlp_edit', {
      slideId,
      instruction,
      success: true,
    });

    return NextResponse.json(response);
  } catch (error) {
    const handledError = handleError(error);
    
    // エラーログを記録
    await monitoring.logError('nlp_edit_error', {
      error: handledError,
      request: await req.json(),
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: handledError.code,
          message: handledError.message,
        },
      } as NLPEditResponse,
      { status: handledError.status }
    );
  }
}

async function applyChanges(slideId: string, changes: any): Promise<string> {
  // TODO: スライドのYAMLを更新するロジックを実装
  // 現在はダミーの実装
  return `type: ${changes.type}\ncontent: ${JSON.stringify(changes.content)}`;
} 