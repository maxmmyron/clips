import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ resolve, event }) => {
  const response = await resolve(event);

  return new Response(response.body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
  }});
};
