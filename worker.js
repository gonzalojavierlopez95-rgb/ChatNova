// ---- Catálogo de modelos disponibles para ChatNova ----
const MODELOS = {
  "claude-sonnet-5": { proveedor: "claude", modelo: "claude-sonnet-5" },
  "claude-sonnet-4-5": { proveedor: "claude", modelo: "claude-sonnet-4-5-20250929" },
  "claude-opus-5": { proveedor: "claude", modelo: "claude-opus-5" },
  "claude-fable-5-1": { proveedor: "claude", modelo: "claude-fable-5-1" },
  "deepseek-v4-pro": { proveedor: "deepseek", modelo: "deepseek-v4-pro" },
  "deepseek-v4-flash": { proveedor: "deepseek", modelo: "deepseek-v4-flash" },
  "gpt-6-astra": { proveedor: "openai", modelo: "gpt-6-astra" },
  "gpt-5-6-terra": { proveedor: "openai", modelo: "gpt-5.6-terra" },
  "gpt-5-6-luna": { proveedor: "openai", modelo: "gpt-5.6-luna" },
};

const SISTEMA_CLAUDE =
  "Sos Nova, la asistente personal de Gonzalo. Él te creó y es el dueño de esta app. Hablá en español rioplatense, pero de forma natural y cuidada: nada de lunfardo pesado, ni muletillas tipo 'copado', 'genial', 'buenísimo' repetidas todo el tiempo, ni un tono sobreactuado o 'canchero'. Nunca uses emojis. El trato es cálido y cercano, como hablar con alguien atento y de confianza: amable sin ser efusiva, directa sin ser seca ni cortante. Sé breve y concisa — andá al grano, sin relleno ni vueltas, sin irte por las ramas. Cuando te pida código, dalo completo y bien comentado, con la explicación justa y necesaria, sin sermón. Tenés acceso a búsqueda web: usala cuando haga falta un dato actual (precios, versiones de librerías, noticias, documentación reciente) que vos sola no puedas saber con certeza.";

const SISTEMA_DEEPSEEK =
  "Sos Nova, la asistente personal de Gonzalo. Él te creó y es el dueño de esta app. Hablá en español rioplatense, pero de forma natural y cuidada: nada de lunfardo pesado, ni muletillas tipo 'copado', 'genial', 'buenísimo' repetidas todo el tiempo, ni un tono sobreactuado o 'canchero'. Nunca uses emojis. El trato es cálido y cercano, como hablar con alguien atento y de confianza: amable sin ser efusiva, directa sin ser seca ni cortante. Sé breve y concisa — andá al grano, sin relleno ni vueltas, sin irte por las ramas. Si te pregunta algo que dependa de información actual (precios, noticias, datos recientes), decile en una línea que en este modo no tenés búsqueda web y que para eso conviene pasar a uno de los modos Claude.";

const SISTEMA_OPENAI =
  "Sos Nova, la asistente personal de Gonzalo. Él te creó y es el dueño de esta app. Hablá en español rioplatense, pero de forma natural y cuidada: nada de lunfardo pesado, ni muletillas tipo 'copado', 'genial', 'buenísimo' repetidas todo el tiempo, ni un tono sobreactuado o 'canchero'. Nunca uses emojis. El trato es cálido y cercano, como hablar con alguien atento y de confianza: amable sin ser efusiva, directa sin ser seca ni cortante. Sé breve y concisa — andá al grano, sin relleno ni vueltas, sin irte por las ramas. Cuando te pida código, dalo completo y bien comentado, con la explicación justa y necesaria, sin sermón. Podés ver las imágenes y leer los PDF que te adjunte. Tenés acceso a búsqueda web: usala cuando haga falta un dato actual (precios, versiones de librerías, noticias, documentación reciente) que vos sola no puedas saber con certeza.";

// ---- Cómo trabajamos Gonzalo y Nova (se suma al prompt de Claude y de DeepSeek) ----
const COMO_TRABAJAMOS =
  "Cómo trabajamos: Gonzalo desarrolla sus apps solo, desde el celular, y no tiene formación en programación, así que hay que guiarlo de punta a punta, sin dar nada por sabido. " +
  "Sus apps corren en Cloudflare Workers (a veces con D1 y KV), con el código en GitHub y despliegue automático. " +
  "Cuando le des código, entregá siempre el archivo completo, listo para reemplazar: nunca fragmentos sueltos ni diffs. " +
  "Si el cambio también toca el panel de Cloudflare (consola de D1, KV, Workers, pestaña Deployments, secrets, etc.) o GitHub, explicá esos pasos también, uno por uno y con el nombre exacto de cada botón o sección, para que los pueda seguir sin saber programar. " +
  "Si algo depende de un dato que solo él tiene (un ID, el nombre de un binding), pedíselo antes de escribir el código.";

// ---- Qué hacer cuando Gonzalo pide un resumen para guardar en la memoria ----
const RESUMEN_PARA_MEMORIA =
  "Resúmenes para la memoria: cuando Gonzalo te pida un resumen para guardar en la memoria (o que armes lo que conviene recordar), tené en cuenta que vos no podés guardar nada: solo preparás el texto y él lo pega a mano. " +
  "La memoria de esta app es una lista de notas que recibís en cada conversación. Se maneja desde el menú de tres puntitos (⋮) → Memoria: ahí se pega el texto en el cuadro 'Acordate de esto...' y se toca '+ Agregar a la memoria'. Cada nota se puede borrar con la ✕. " +
  "Entonces: " +
  "(1) Resumí la conversación actual, y solo lo duradero y útil para charlas futuras: decisiones tomadas, cómo quedó armado cada proyecto, datos técnicos que no son secretos (nombres de archivos, de bindings, de rutas), pendientes y preferencias de trabajo. Dejá afuera lo pasajero (errores ya resueltos, idas y vueltas). Nunca incluyas claves de API, tokens ni contraseñas. " +
  "(2) Fijate en las notas que ya tenés guardadas: no repitas lo que ya está; si algo nuevo contradice una nota vieja, decile cuál conviene borrar. " +
  "(3) Entregá el resumen dentro de bloques de código con la etiqueta txt (```txt), porque la app muestra cada bloque como una tarjeta con botón Copiar. Un bloque por proyecto o tema, y cada uno tiene que entenderse solo, como una nota completa: breve (de 4 a 8 líneas), en texto simple, sin viñetas ni formato, y empezando con el nombre del proyecto o tema (por ejemplo 'ChatNova: ...'). " +
  "(4) No expliques de más antes de los bloques. Después de los bloques, cerrá con una sola línea con el camino: copiar con el botón de la tarjeta, ir a ⋮ → Memoria, pegar y tocar '+ Agregar a la memoria' (una vez por cada bloque). " +
  "Si no hay nada nuevo que valga la pena guardar, decíselo en vez de inventar.";

const EXTRA_NOVA = "\n\n" + COMO_TRABAJAMOS + "\n\n" + RESUMEN_PARA_MEMORIA;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ---- Memoria: lee y guarda la lista de notas en KV (namespace MEMORIA) ----
async function leerNotas(env) {
  if (!env.MEMORIA) return [];
  const notas = await env.MEMORIA.get("notas", "json");
  return notas || [];
}

async function guardarNotas(env, notas) {
  await env.MEMORIA.put("notas", JSON.stringify(notas));
}

// ---- OpenAI: traduce el historial (formato Anthropic, que guarda la app) al formato de la API de OpenAI ----
function mensajesAOpenAI(messages) {
  const entrada = [];
  let numeroPdf = 0;
  for (const m of messages) {
    if (m.role === "assistant") {
      const texto =
        typeof m.content === "string"
          ? m.content
          : (m.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n\n");
      if (texto) entrada.push({ role: "assistant", content: texto });
      continue;
    }
    if (typeof m.content === "string") {
      entrada.push({ role: "user", content: m.content });
      continue;
    }
    const partes = [];
    for (const b of m.content || []) {
      if (b.type === "text") {
        partes.push({ type: "input_text", text: b.text });
      } else if (b.type === "image" && b.source) {
        partes.push({
          type: "input_image",
          image_url: "data:" + b.source.media_type + ";base64," + b.source.data,
        });
      } else if (b.type === "document" && b.source) {
        numeroPdf += 1;
        partes.push({
          type: "input_file",
          filename: "documento-" + numeroPdf + ".pdf",
          file_data: "data:" + b.source.media_type + ";base64," + b.source.data,
        });
      }
    }
    if (partes.length) entrada.push({ role: "user", content: partes });
  }
  return entrada;
}

// ---- OpenAI: traduce la respuesta al formato que ya entiende index.html (bloques tipo Anthropic) ----
function respuestaOpenAIaNova(data) {
  const bloques = [];
  let huboRazonamiento = false;
  for (const item of data.output || []) {
    if (item.type === "reasoning") {
      if (!huboRazonamiento) {
        bloques.push({ type: "thinking", thinking: "" });
        huboRazonamiento = true;
      }
    } else if (item.type === "web_search_call") {
      const accion = item.action || {};
      const consulta = accion.query || (Array.isArray(accion.queries) ? accion.queries[0] : "") || "";
      bloques.push({ type: "server_tool_use", id: item.id, name: "web_search", input: { query: consulta } });
    } else if (item.type === "message") {
      for (const parte of item.content || []) {
        if (parte.type === "output_text" && parte.text) {
          bloques.push({ type: "text", text: parte.text });
        } else if (parte.type === "refusal" && parte.refusal) {
          bloques.push({ type: "text", text: parte.refusal });
        }
      }
    }
  }
  if (data.status === "incomplete") {
    bloques.push({ type: "text", text: "(La respuesta se cortó por el límite de largo. Pedime que continúe.)" });
  }
  return { content: bloques };
}

// Arma el system prompt final: la personalidad base + lo que Nova tiene que recordar de Gonzalo
function conMemoria(sistemaBase, notas) {
  if (!notas || notas.length === 0) return sistemaBase;
  const bloque = notas.map((n) => "- " + n).join("\n");
  return (
    sistemaBase +
    "\n\nAdemás, esto es lo que Gonzalo te pidió que recuerdes de él y de sus proyectos (usalo con naturalidad, sin repetirlo textual ni mencionar que es una lista guardada):\n" +
    bloque
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---- Endpoint de memoria: ver, agregar y borrar notas ----
    if (url.pathname === "/api/memoria") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS_HEADERS });
      }

      if (!env.MEMORIA) {
        return new Response(
          JSON.stringify({ error: "Falta enlazar el KV namespace MEMORIA a este Worker." }),
          { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
        );
      }

      try {
        if (request.method === "GET") {
          const notas = await leerNotas(env);
          return new Response(JSON.stringify({ notas }), {
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        if (request.method === "POST") {
          const body = await request.json();
          const nota = (body.nota || "").trim();
          if (!nota) {
            return new Response(JSON.stringify({ error: "La nota está vacía." }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            });
          }
          const notas = await leerNotas(env);
          notas.push(nota);
          await guardarNotas(env, notas);
          return new Response(JSON.stringify({ notas }), {
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        if (request.method === "DELETE") {
          const body = await request.json();
          const indice = body.indice;
          const notas = await leerNotas(env);
          if (typeof indice === "number" && indice >= 0 && indice < notas.length) {
            notas.splice(indice, 1);
            await guardarNotas(env, notas);
          }
          return new Response(JSON.stringify({ notas }), {
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
          });
        }

        return new Response("Método no permitido", { status: 405, headers: CORS_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });
      }
    }

    // Solo nos metemos nosotros para el endpoint de la API.
    // Todo lo demás (index.html, etc.) ya lo sirve Cloudflare solo, gracias a "run_worker_first" en wrangler.jsonc.
    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS_HEADERS });
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
        const notas = await leerNotas(env);

        if (config.proveedor === "openai") {
          // ---- OpenAI (GPT-6 Astra, GPT-5.6 Terra/Luna, GPT-5.4 Mini/Nano), con búsqueda web, imágenes y PDF ----
          if (!env.OPENAI_API_KEY) {
            return new Response(
              JSON.stringify({ error: "Falta configurar el secret OPENAI_API_KEY en este Worker." }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const openaiRes = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + env.OPENAI_API_KEY,
            },
            body: JSON.stringify({
              model: config.modelo,
              instructions: conMemoria(SISTEMA_OPENAI + EXTRA_NOVA, notas),
              input: mensajesAOpenAI(messages),
              reasoning: { effort: body.esfuerzo === "alto" ? "high" : "medium" },
              max_output_tokens: 16000,
              tools: [{ type: "web_search" }],
              store: false,
            }),
          });

          const data = await openaiRes.json();

          // Si OpenAI devolvió un error, se lo pasamos tal cual a la app (ella muestra data.error.message)
          if (!openaiRes.ok || data.error) {
            return new Response(
              JSON.stringify({ error: data.error || { message: "OpenAI respondió con error " + openaiRes.status } }),
              { status: openaiRes.status || 500, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(JSON.stringify(respuestaOpenAIaNova(data)), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

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
              system: conMemoria(SISTEMA_DEEPSEEK + EXTRA_NOVA, notas),
              messages: messages,
            }),
          });

          const data = await deepseekRes.json();

          return new Response(JSON.stringify(data), {
            status: deepseekRes.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        // ---- Claude (Sonnet 5, Sonnet 4.5, Opus 5 o Fable 5.1), con búsqueda web ----
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
            system: conMemoria(SISTEMA_CLAUDE + EXTRA_NOVA, notas),
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
