const fab = document.getElementById("fab");
const overlay = document.getElementById("chat-overlay");
const closeBtn = document.getElementById("chat-close");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");

let open = false;

fab.addEventListener("click", () => {
  overlay.classList.add("open");
  open = true;
  input.focus();
});

closeBtn.addEventListener("click", () => {
  overlay.classList.remove("open");
  open = false;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && open) {
    overlay.classList.remove("open");
    open = false;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addBubble("user", text);
  input.value = "";
  const node = addBubble("assistant", "…");

  const resp = await fetch("/api/chat-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  if (!resp.ok || !resp.body) {
    node.textContent = "Fehler beim Laden.";
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    node.textContent = acc;
    messages.scrollTop = messages.scrollHeight;
  }
});

function addBubble(role, text) {
  const b = document.createElement("div");
  b.className = `bubble ${role}`;
  b.textContent = text;
  messages.appendChild(b);
  messages.scrollTop = messages.scrollHeight;
  return b;
}