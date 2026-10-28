const MODEL = "gemini-3.6-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const SYSTEM_PROMPT = "You are a helpful assistant who responds in Sinhala with friendly and concise replies.";

let apiKey = "";
const messages = [];
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const resetKeyBtn = document.getElementById("resetKey");

function askKey() {
  const enteredKey = (prompt("API HEAR:") || "").trim();
  if (enteredKey) apiKey = enteredKey;
}

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function send() {
  const text = input.value.trim();
  if (!text) return;
  if (!apiKey) askKey();
  if (!apiKey) return;

  addMsg(text, "user");
  input.value = "";
  sendBtn.disabled = true;
  messages.push({ role: "user", parts: [{ text }] });

  const loading = addMsg("...", "bot");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
     body: JSON.stringify({
  systemInstruction: {
    parts: [{ text: "Always reply in English." }]
  },
  contents: messages
}),
      signal: AbortSignal.timeout(240000)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "The request failed.");
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error("The API returned no response text.");

    loading.textContent = reply;
    messages.push({ role: "model", parts: [{ text: reply }] });
  } catch (error) {
    loading.textContent = "An error occurred: " +
      (error instanceof Error ? error.message : String(error));
    messages.pop();
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

sendBtn.addEventListener("click", send);
input.addEventListener("keydown", event => {
  if (event.key === "Enter") send();
});
resetKeyBtn.addEventListener("click", askKey);
