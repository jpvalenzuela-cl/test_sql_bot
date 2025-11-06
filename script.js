(() => {
  // Cambia esta URL a tu webhook de n8n
  const API_URL = "https://n8n.2read.ai/webhook-test/chatbot";

  const messagesElem = document.getElementById("messages");
  const input = document.getElementById("input-msg");
  const btn = document.getElementById("send-btn");
  const loader = document.getElementById("loader");
  const statusText = document.getElementById("status-text");
  const typing = document.getElementById("typing");
  const sessionEl = document.getElementById("session-id");
  const newChatBtn = document.getElementById("new-chat");
  const downloadBtn = document.getElementById("download-log");

  let history = [];
  let sessionId = Math.random().toString(36).slice(2, 10);
  sessionEl.textContent = sessionId;

  function addMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (role === "user" ? "user" : "bot");
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "TU" : "AI";

    const bubble = document.createElement("div");
    bubble.className = "bubble " + (role === "user" ? "user" : "bot");
    bubble.innerHTML = sanitize(text).replace(/\n/g, "<br>");

    const time = document.createElement("div");
    time.className = "meta-time";
    time.textContent = new Date().toLocaleTimeString();

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    messagesElem.appendChild(wrap);
    messagesElem.scrollTop = messagesElem.scrollHeight;
  }

  function sanitize(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function setStatus(s, busy = false) {
    statusText.textContent = s;
    loader.style.display = busy ? "block" : "none";
    typing.style.display = busy ? "flex" : "none";
    btn.disabled = busy;
    input.disabled = busy;
  }

  async function sendQuestion() {
    const input = document.getElementById("pregunta");
    const pregunta = input.value.trim();
    if (!pregunta) return;
  
    // Mostrar mensaje del usuario
    agregarMensaje("Usuario", pregunta);
    input.value = "";
  
    try {
      const response = await fetch("https://tuwebhook.n8n.cloud/webhook/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta }),
      });
  
      const data = await response.json();
      agregarMensaje("Bot", data.respuesta || "Sin respuesta del servidor");
    } catch (error) {
      agregarMensaje("Bot", "Error al conectar con el servidor.");
    }
  }

  btn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendQuestion(text);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      btn.click();
    }
  });

  newChatBtn.addEventListener("click", () => {
    messagesElem.innerHTML = "";
    history = [];
    sessionId = Math.random().toString(36).slice(2, 10);
    sessionEl.textContent = sessionId;
    setStatus("Nueva sesión", false);
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify({ session: sessionId, history }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_log_${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  addMessage("bot", "Hola 👋 — Soy tu asistente SQL. Haz una pregunta sobre la base de datos.");
  setStatus("Listo", false);
})();

