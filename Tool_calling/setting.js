const tools = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get weather",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string"
          }
        },
        required: ["city"]
      }
    }
  }
];

export default tools;