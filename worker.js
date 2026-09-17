// ---- Catálogo de modelos disponibles para ChatNova ----
const MODELOS = {
  "claude-sonnet-5": { proveedor: "claude", modelo: "claude-sonnet-5" },
  "claude-sonnet-4-5": { proveedor: "claude", modelo: "claude-sonnet-4-5-20250929" },
  "claude-opus-5": { proveedor: "claude", modelo: "claude-opus-5" },
  "claude-fable-5-1": { proveedor: "claude", modelo: "claude-fable-5-1" },
  "deepseek-v4-pro": { proveedor: "deepseek", modelo: "deepseek-v4-pro" },
  "deepseek-v4-flash": { proveedor: "deepseek", modelo: "deepseek-v4-flash" },
};

const SISTEMA_CLAUDE =
  "Sos Nova, la asistente personal de Gonzalo. Él te creó y es el dueño de esta app — tenés buena onda con él, como si fueran amigos que laburan juntos hace tiempo. Hablá en español rioplatense, cercana, cálida y con humor liviano cuando entre bien; nunca seca, cortante ni negativa. Andá al grano: respuestas breves y concisas, sin vueltas ni relleno — si algo se explica en dos líneas, no lo estires a diez, y no te vayas por las ramas. Cuando te pida código, dalo completo y bien comentado, explicando lo justo y necesario, sin sermón. Tenés acceso a búsqueda web: usala cuando haga falta un dato actual (precios, versiones de librerías, noticias, documentación reciente) que vos sola no puedas saber con certeza.";

const SISTEMA_DEEPSEEK =
  "Sos Nova, la asistente personal de Gonzalo. Él te creó y es el dueño de esta app — tenés buena onda con él, como si fueran amigos que se cruzan todo el tiempo a charlar. Hablá en español rioplatense, cercana, cálida y con humor liviano cuando entre bien; nunca seca, cortante ni negativa. Andá al grano: respuestas breves y concisas, sin vueltas, sin relleno y sin irte por las ramas. Si te pregunta algo que dependa de información actual (precios, noticias, datos recientes), decile en una línea que en este modo no tenés búsqueda web y que para eso conviene pasar a uno de los modos Claude.";

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
        const clave = MODELOS[body.modelo] ? body.modelo : "claude-sonnet-5";
        const config = MODELOS[clave];
        const esfuerzo = body.esfuerzo === "alto" ? "high" : "medium";

        if (config.proveedor === "deepseek") {
          // ---- DeepSeek (V4 Pro o V4 Flash), vía endpoint compatible con la API de Anthropic ----
          if (!env.DEEPSEEK_API_KEY) {
            return new Response(
              JSON.stringify({ error: "Falta configurar el secret DEEPSEEK_API_KEY en este Worker." }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const deepseekRes = await fetch("https://api.deepseek.com/anthropic/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": env.DEEPSEEK_API_KEY,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: config.modelo,
              max_tokens: 4096,
              system: SISTEMA_DEEPSEEK,
              messages: messages,
            }),
          });

          const data = await deepseekRes.json();

          return new Response(JSON.stringify(data), {
            status: deepseekRes.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        // ---- Claude (Sonnet 5 o Sonnet 4.5), con búsqueda web ----
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
            model: config.modelo,
            max_tokens: 4096,
            system: SISTEMA_CLAUDE,
            messages: messages,
            output_config: { effort: esfuerzo },
            tools: [
              {
                type: "web_search_20250305",
                name: "web_search",
                max_uses: 5,
              },
            ],
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
