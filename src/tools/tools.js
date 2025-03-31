import * as trading from "./trading.js";

// Compatible with the OpenAI function calling parameter
const getTools = (tools = []) => {};

// Get simplified version of tools for models that don't support function calling natively
const getSimpleTools = (tools = []) => {
  const allTools = [...trading.default];
  const simpleTools = [];

  for (const tool of allTools) {
    simpleTools.push({
      name: tool.function.name,
      description: tool.function.description,
      fn: tool.function.fn,
      usage: tool.function.usage.replaceAll(`"`, `'`).replaceAll("\n", ""),
    });
  }

  return simpleTools;
};

export { getTools, getSimpleTools };
