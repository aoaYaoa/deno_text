// MBTI测试相关Schema定义
// 用于请求参数验证

export const getMbtiQuestionsSchema = {
  type: "object",
  properties: {},
  additionalProperties: false
};

export const getMbtiTypeDetailsSchema = {
  type: "object",
  properties: {
    type: { type: "string", minLength: 5, maxLength: 6 }
  },
  required: ["type"],
  additionalProperties: false
};

export const getAllMbtiTypesSchema = {
  type: "object",
  properties: {},
  additionalProperties: false
};

export const getMbtiRolesSchema = {
  type: "object",
  properties: {},
  additionalProperties: false
};

export const submitMbtiTestSchema = {
  type: "object",
  properties: {
    user_id: { type: "string", minLength: 1 },
    nickname: { type: "string", optional: true },
    responses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question_id: { type: "integer", minimum: 1 },
          selected_value: { 
            type: "string", 
            enum: ["E", "I", "S", "N", "T", "F", "J", "P", "A", "T"]
          }
        },
        required: ["question_id", "selected_value"],
        additionalProperties: false
      },
      minItems: 1
    }
  },
  required: ["user_id", "responses"],
  additionalProperties: false
};

export const getUserTestHistorySchema = {
  type: "object",
  properties: {
    userId: { type: "string", minLength: 1 }
  },
  required: ["userId"],
  additionalProperties: false
}; 