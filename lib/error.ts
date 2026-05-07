export function logStack(error: unknown) {
  console.error("Error:", (error as { stack: string }).stack);
}
