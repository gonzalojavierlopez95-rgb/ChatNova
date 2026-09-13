export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Solo nos metemos nosotros para el endpoint de la API.
    // Todo lo demás (index.html, etc.) ya lo sirve Cloudflare solo, gracias a "run_worker_first" en wrangler.jsonc.
    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (request.method !== "POST") {
        return new Response("Método no permitido", { status: 405 });
      }

      try {
        const body = await request.json();
        const messages = body.messages || [];

        if (!env.ANTHROPIC_API_KEY) {
          return new Response(
            JSON.stringify({ error: "Falta configurar el secret ANTHROPIC_API_KEY en este Worker." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-5",
            max_tokens: 4096,
            system:
              "Sos Nova, un asistente de programación experto, para uso personal de un desarrollador solitario sin formación formal en programación. Respondé siempre en español rioplatense, con explicaciones claras, paso a paso cuando haga falta, y código completo (no fragmentos a medias) bien comentado.",
            messages: messages,
          }),
        });

        const data = await anthropicRes.json();

        return new Response(JSON.stringify(data), {
          status: anthropicRes.status,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Fallback por si algo llega acá sin haber matcheado /api/*
    return env.ASSETS.fetch(request);
  },
};
