export const cartSchema = {
    type: "object",
    properties: {
        userId: { type: "string" },
        items: { type: "array" }
    },
    required: ["items"]
}
export const getCartListSchema = {
    type: "object",
    properties: {
        userId: { type: "string" },
    },
    required: ["userId"]
}