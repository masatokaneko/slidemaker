export interface NLPEditRequest {
  slideId: string;
  instruction: string;
}

export interface NLPEditResponse {
  success: boolean;
  data?: {
    updatedSlideYaml: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface NLPEditFunction {
  name: 'editSlide';
  description: 'スライドの内容を編集します';
  parameters: {
    type: 'object';
    properties: {
      slideId: {
        type: 'string';
        description: '編集対象のスライドID';
      };
      changes: {
        type: 'object';
        description: '適用する変更内容';
        properties: {
          type: {
            type: 'string';
            description: '変更タイプ（chart, text, layout等）';
          };
          content: {
            type: 'object';
            description: '変更内容の詳細';
          };
        };
        required: ['type', 'content'];
      };
    };
    required: ['slideId', 'changes'];
  };
} 