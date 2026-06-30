import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(file) {
  const env = {};
  const content = fs.readFileSync(file, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function main() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const env = loadEnv(envPath);
  const key = env.OPENAI_API_KEY;
  const baseUrl = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const model = env.OPENAI_MODEL || "gpt-4o-mini";

  if (!key) {
    console.log(JSON.stringify({ ok: false, error: "未配置 OPENAI_API_KEY" }));
    process.exit(1);
  }

  const masked = key.slice(0, 7) + "..." + key.slice(-4);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 80,
        messages: [
          {
            role: "user",
            content: '只回复：连接成功',
          },
        ],
      }),
    });

    const body = await res.json();

    console.log(
      JSON.stringify(
        {
          ok: res.ok,
          httpStatus: res.status,
          provider: baseUrl,
          model,
          apiKey: masked,
          error: body.error?.message || null,
          reply: body.choices?.[0]?.message?.content || null,
          usage: body.usage || null,
        },
        null,
        2
      )
    );

    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.log(
      JSON.stringify({
        ok: false,
        error: err.message,
        apiKey: masked,
        provider: baseUrl,
        model,
      })
    );
    process.exit(1);
  }
}

main();
