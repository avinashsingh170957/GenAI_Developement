const tools = [
  {
    type: "function",
    function: {
      name: "GetExpence",
      description: "Get expense records filtered by month, year, or date.",
      parameters: {
        type: "object",
        properties: {
          filterType: {
            type: "string",
            enum: ["monthly", "yearly", "date_wise"],
            description: "Filter type."
          },
          value: {
            type: "string",
            description:
              "For monthly use YYYY-MM (example: 2026-05). For yearly use YYYY (example: 2026). For date_wise use YYYY-MM-DD (example: 2026-05-15)."
          }
        },
        required: ["filterType", "value"]
      }
    }
  }
];

export default tools;