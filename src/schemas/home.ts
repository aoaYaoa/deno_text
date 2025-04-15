export const homeSchema = {
    type: "object",
    properties: {
        searchInfo:{
            type: "string",
            minLength: 1,
            maxLength: 100
        },
        pageNumber:{
            type: "number",
            default: 1
        },
        pageSize:{
            type: "number",
            default: 10  
        }
    },
}
