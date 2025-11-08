/**
 * Calculator Tool for LangChain
 * Simple calculator that the agent can use for math operations
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Create a calculator tool
 * This allows the AI to perform mathematical calculations
 */
export function createCalculatorTool() {
  return new DynamicStructuredTool({
    name: "calculator",
    description: "Perform mathematical calculations. Supports basic arithmetic operations (+, -, *, /) and more complex expressions.",
    schema: z.object({
      expression: z.string().describe("The mathematical expression to evaluate (e.g., '2 + 2', '10 * 5', '(3 + 5) * 2')"),
    }),
    func: async ({ expression }) => {
      try {
        // Security: Only allow safe mathematical expressions
        // Remove any non-mathematical characters
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

        if (sanitized !== expression) {
          return "Invalid expression. Only numbers and basic operators (+, -, *, /, parentheses) are allowed.";
        }

        // Evaluate the expression
        // Note: In production, consider using a proper math expression parser library
        const result = Function(`'use strict'; return (${sanitized})`)();

        return `The result of ${expression} is ${result}`;
      } catch (error) {
        console.error("Error in calculator tool:", error);
        return `Error evaluating expression: ${expression}`;
      }
    },
  });
}
