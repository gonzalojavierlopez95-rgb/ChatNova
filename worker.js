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

// ---- Conversaciones: cada una se guarda en KV (namespace MEMORIA) bajo la clave "conv:<id>" ----
const PREFIJO_CONV_VIEJO = "conv:"; // formato de antes de separar por persona: conv:<id>
const ID_VALIDO = /^[a-z0-9]{1,40}$/i;
const USUARIO_VALIDO = /^[a-z0-9_.-]{1,100}$/i;

// Identifica a la persona que inició sesión con Cloudflare Access. Ese encabezado lo agrega
// Cloudflare de forma segura después de verificar la sesión: el navegador no puede falsificarlo.
function obtenerUsuario(request) {
  const email = request.headers.get("Cf-Access-Authenticated-User-Email") || "";
  const userkey = email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_").slice(0, 80);
  if (!USUARIO_VALIDO.test(userkey)) return null;
  return { email, userkey };
}

function claveConv(userkey, id) {
  return "conv:u:" + userkey + ":" + id;
}
function prefijoConv(userkey) {
  return "conv:u:" + userkey + ":";
}

// ---- Adjuntos: imágenes y PDF de las conversaciones, guardados en R2 (bucket ADJUNTOS) ----
const PREFIJO_ADJ_VIEJO = "adj/"; // formato de antes de separar por persona: adj/<uuid>
const CLAVE_ADJ_VALIDA = /^adj\/u\/[a-z0-9_]{1,80}\/[a-z0-9-]{1,80}$/i;
const MAX_BYTES_ADJUNTO = 25 * 1024 * 1024; // 25 MB por archivo, de sobra para fotos y PDF

function claveAdjunto(userkey, uuid) {
  return "adj/u/" + userkey + "/" + uuid;
}

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

    // ---- Endpoint de adjuntos: subir y descargar imágenes/PDF (solo mismo origen, sin CORS) ----
    if (url.pathname === "/api/adjuntos") {
      const responder = (objeto, estado) =>
        new Response(JSON.stringify(objeto), { status: estado || 200, headers: { "Content-Type": "application/json" } });

      if (!env.ADJUNTOS) {
        return responder({ error: "Falta enlazar el bucket R2 ADJUNTOS a este Worker." }, 500);
      }
      const usuarioAdj = obtenerUsuario(request);
      if (!usuarioAdj) {
        return responder({ error: "No se pudo identificar tu sesión. Recargá la página para iniciar sesión de nuevo." }, 401);
      }

      try {
        if (request.method === "POST") {
          const body = await request.json();
          const mediaType = String(body.media_type || "application/octet-stream").slice(0, 100);
          if (!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i.test(mediaType)) {
            return responder({ error: "Tipo de archivo inválido." }, 400);
          }
          let bytes;
          try {
            bytes = Uint8Array.from(atob(String(body.data || "")), (c) => c.charCodeAt(0));
          } catch (e) {
            return responder({ error: "El archivo no llegó bien codificado." }, 400);
          }
          if (bytes.byteLength === 0) return responder({ error: "El archivo está vacío." }, 400);
          if (bytes.byteLength > MAX_BYTES_ADJUNTO) {
            return responder({ error: "El archivo pesa más de 25 MB." }, 413);
          }
          const clave = claveAdjunto(usuarioAdj.userkey, crypto.randomUUID());
          await env.ADJUNTOS.put(clave, bytes, { httpMetadata: { contentType: mediaType } });
          return responder({ key: clave });
        }

        if (request.method === "GET") {
          const clave = url.searchParams.get("key") || "";
          if (!CLAVE_ADJ_VALIDA.test(clave)) return responder({ error: "Clave de adjunto inválida." }, 400);
          // El adjunto solo lo puede ver quien lo subió: la clave lleva su usuario adentro
          const duenio = clave.split("/")[2];
          if (duenio !== usuarioAdj.userkey) return responder({ error: "No tenés permiso para ver este adjunto." }, 403);
          const objeto = await env.ADJUNTOS.get(clave);
          if (!objeto) return responder({ error: "No se encontró el adjunto." }, 404);
          return new Response(objeto.body, {
            headers: {
              "Content-Type": (objeto.httpMetadata && objeto.httpMetadata.contentType) || "application/octet-stream",
              "Cache-Control": "private, max-age=31536000, immutable",
            },
          });
        }

        return new Response("Método no permitido", { status: 405 });
      } catch (err) {
        return responder({ error: err.message }, 500);
      }
    }

    // ---- Endpoint de migración: se visita UNA sola vez para pasar las conversaciones guardadas
    //      antes de separar por persona a la cuenta de quien las abrió. No hace nada si ya no queda nada viejo. ----
    if (url.pathname === "/api/migrar" && request.method === "GET") {
      const responder = (objeto, estado) =>
        new Response(JSON.stringify(objeto), { status: estado || 200, headers: { "Content-Type": "application/json" } });
      if (!env.MEMORIA) return responder({ error: "Falta enlazar el KV namespace MEMORIA a este Worker." }, 500);
      const usuarioMig = obtenerUsuario(request);
      if (!usuarioMig) return responder({ error: "No se pudo identificar tu sesión." }, 401);

      try {
        const clavesViejas = [];
        let cursor;
        do {
          const pagina = await env.MEMORIA.list({ prefix: PREFIJO_CONV_VIEJO, cursor });
          for (const clave of pagina.keys) {
            const resto = clave.name.slice(PREFIJO_CONV_VIEJO.length);
            // formato viejo: "conv:<id>", sin el ":u:<usuario>:" del formato nuevo
            if (!resto.startsWith("u:") && ID_VALIDO.test(resto)) clavesViejas.push(clave.name);
          }
          cursor = pagina.list_complete ? undefined : pagina.cursor;
        } while (cursor);

        let migradas = 0;
        for (const claveVieja of clavesViejas) {
          const conv = await env.MEMORIA.get(claveVieja, "json");
          if (!conv) continue;

          // Los adjuntos que use esta conversación también pasan a la cuenta de esta persona
          for (const m of conv.historial || []) {
            if (!Array.isArray(m.content)) continue;
            for (const b of m.content) {
              if (b && (b.type === "image_ref" || b.type === "document_ref") && typeof b.key === "string" && b.key.startsWith(PREFIJO_ADJ_VIEJO) && !b.key.startsWith("adj/u/")) {
                const objViejo = env.ADJUNTOS ? await env.ADJUNTOS.get(b.key) : null;
                if (objViejo) {
                  const bytes = await objViejo.arrayBuffer();
                  const uuid = b.key.slice(PREFIJO_ADJ_VIEJO.length);
                  const claveNueva = claveAdjunto(usuarioMig.userkey, uuid);
                  await env.ADJUNTOS.put(claveNueva, bytes, { httpMetadata: objViejo.httpMetadata });
                  await env.ADJUNTOS.delete(b.key);
                  b.key = claveNueva;
                }
              }
            }
          }

          const id = claveVieja.slice(PREFIJO_CONV_VIEJO.length);
          await env.MEMORIA.put(claveConv(usuarioMig.userkey, id), JSON.stringify(conv), {
            metadata: { titulo: conv.titulo, actualizado: conv.actualizado, fijado: !!conv.fijado },
          });
          await env.MEMORIA.delete(claveVieja);
          migradas++;
        }

        return responder({ ok: true, migradas, mensaje: migradas > 0 ? `Se pasaron ${migradas} conversación(es) a tu cuenta.` : "No había conversaciones viejas para migrar." });
      } catch (err) {
        return responder({ error: err.message }, 500);
      }
    }

    // ---- Endpoint de conversaciones: listar, abrir una, guardar y borrar (solo mismo origen, sin CORS) ----
    if (url.pathname === "/api/conversaciones") {
      const responder = (objeto, estado) =>
        new Response(JSON.stringify(objeto), {
          status: estado || 200,
          headers: { "Content-Type": "application/json" },
        });

      if (!env.MEMORIA) {
        return responder({ error: "Falta enlazar el KV namespace MEMORIA a este Worker." }, 500);
      }
      const usuarioConv = obtenerUsuario(request);
      if (!usuarioConv) {
        return responder({ error: "No se pudo identificar tu sesión. Recargá la página para iniciar sesión de nuevo." }, 401);
      }

      try {
        if (request.method === "GET") {
          const id = url.searchParams.get("id");

          // Abrir una conversación completa (solo las propias: la clave lleva el usuario adentro)
          if (id) {
            if (!ID_VALIDO.test(id)) return responder({ error: "Id inválido." }, 400);
            const conversacion = await env.MEMORIA.get(claveConv(usuarioConv.userkey, id), "json");
            if (!conversacion) return responder({ error: "No se encontró la conversación." }, 404);
            return responder({ conversacion });
          }

          // Listado: solo las conversaciones de esta persona
          const prefijo = prefijoConv(usuarioConv.userkey);
          const conversaciones = [];
          let cursor;
          do {
            const pagina = await env.MEMORIA.list({ prefix: prefijo, cursor });
            for (const clave of pagina.keys) {
              const meta = clave.metadata || {};
              conversaciones.push({
                id: clave.name.slice(prefijo.length),
                titulo: meta.titulo || "Conversación",
                actualizado: meta.actualizado || 0,
                fijado: !!meta.fijado,
              });
            }
            cursor = pagina.list_complete ? undefined : pagina.cursor;
          } while (cursor);
          return responder({ conversaciones });
        }

        if (request.method === "POST") {
          const body = await request.json();
          const c = body.conversacion || {};
          if (!ID_VALIDO.test(String(c.id || ""))) return responder({ error: "Id inválido." }, 400);
          if (!Array.isArray(c.historial)) return responder({ error: "Falta el historial de la conversación." }, 400);

          const titulo = String(c.titulo || "Nueva conversación").slice(0, 120);
          const guardar = {
            id: c.id,
            titulo,
            actualizado: Number(c.actualizado) || Date.now(),
            fijado: !!c.fijado,
            historial: c.historial,
            pasos: c.pasos && typeof c.pasos === "object" ? c.pasos : {},
          };
          const texto = JSON.stringify(guardar);
          if (texto.length > 20000000) {
            return responder({ error: "La conversación es demasiado grande para guardarla en la nube." }, 413);
          }

          await env.MEMORIA.put(claveConv(usuarioConv.userkey, c.id), texto, {
            metadata: { titulo, actualizado: guardar.actualizado, fijado: guardar.fijado },
          });
          return responder({ ok: true });
        }

        if (request.method === "DELETE") {
          const body = await request.json();
          if (!ID_VALIDO.test(String(body.id || ""))) return responder({ error: "Id inválido." }, 400);
          await env.MEMORIA.delete(claveConv(usuarioConv.userkey, body.id));
          return responder({ ok: true });
        }

        return new Response("Método no permitido", { status: 405 });
      } catch (err) {
        return responder({ error: err.message }, 500);
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

        // Arma el cuerpo del pedido a Claude. "conEsfuerzo" decide si incluye el parámetro
        // "output_config.effort" (no todos los modelos de Claude lo soportan todavía).
        const cuerpoClaude = (conEsfuerzo) => {
          const cuerpo = {
            model: config.modelo,
            max_tokens: 16000, // largo máximo de cada respuesta de Claude (antes 4096)
            system: conMemoria(SISTEMA_CLAUDE + EXTRA_NOVA, notas),
            messages: messages,
            tools: [
              {
                type: "web_search_20250305",
                name: "web_search",
                max_uses: 5,
              },
            ],
          };
          if (conEsfuerzo) cuerpo.output_config = { effort: esfuerzo };
          return cuerpo;
        };

        const pedirClaude = (conEsfuerzo) =>
          fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify(cuerpoClaude(conEsfuerzo)),
          });

        let anthropicRes = await pedirClaude(true);
        let data = await anthropicRes.json();

        // Si este modelo de Claude no soporta el nivel de esfuerzo, reintentamos sin ese parámetro
        const mensajeError = data && data.error && (data.error.message || "");
        if (!anthropicRes.ok && /effort/i.test(mensajeError)) {
          anthropicRes = await pedirClaude(false);
          data = await anthropicRes.json();
        }

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
