// ===============
// ELEMENTS
// ===============
const chatFab = document.getElementById("fab-chat");
const chatOverlay = document.getElementById("chatOverlay");
const chatClose = document.getElementById("chatClose");
const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const themeToggle = document.getElementById("themeToggle");
const cmdToggle = document.getElementById("cmdToggle");
const cmdPalette = document.getElementById("cmdPalette");
const cmdInput = document.getElementById("cmdInput");
const cmdList = document.getElementById("cmdList");

// ===============
// CHAT OVERLAY
// ===============
chatFab.addEventListener("click", () => {
  chatOverlay.classList.remove("hidden");
  chatInput.focus();
});

chatClose.addEventListener("click", () => chatOverlay.classList.add("hidden"));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    chatOverlay.classList.add("hidden");
    cmdPalette.classList.add("hidden");
  }
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  addBubble("you", message);
  chatInput.value = "";

  const ai = addBubble("ai", "");
  streamResponse(message, ai);
});

function addBubble(role, text) {
  const div = document.createElement("div");
  div.className = `bubble ${role}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

async function streamResponse(prompt, bubble) {
  try {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bubble.textContent += decoder.decode(value);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } catch {
    bubble.textContent = "Verbindung unterbrochen.";
  }
}

// ===============
// THEME SWITCHER
// ===============
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
});
if (localStorage.getItem("theme") === "light") document.body.classList.add("light");

// ===============
// STATUS PINGS
// ===============
async function updateStatus() {
  try {
    const res = await fetch("/status.json");
    const data = await res.json();

    Object.entries(data).forEach(([key, value]) => {
      const el = document.getElementById("led-" + key);
      if (!el) return;
      el.classList.remove("ok", "warn", "fail");
      if (value === "ok") el.classList.add("ok");
      else if (value === "warn") el.classList.add("warn");
      else el.classList.add("fail");
    });
  } catch (err) {
    console.warn("Status-Check fehlgeschlagen", err);
  }
}
updateStatus();
setInterval(updateStatus, 30000);

// ===============
// COMMAND PALETTE
// ===============
const services = [...document.querySelectorAll(".card")].map((el) => ({
  name: el.textContent.trim(),
  href: el.href,
}));

function openCmd() {
  cmdPalette.classList.remove("hidden");
  cmdInput.value = "";
  cmdInput.focus();
  renderCmdList(services);
}

function closeCmd() {
  cmdPalette.classList.add("hidden");
}

cmdToggle.addEventListener("click", openCmd);

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (cmdPalette.classList.contains("hidden")) openCmd();
    else closeCmd();
  }
});

cmdInput?.addEventListener("input", () => {
  const term = cmdInput.value.toLowerCase();
  const filtered = services.filter((s) => s.name.toLowerCase().includes(term));
  renderCmdList(filtered);
});

function renderCmdList(list) {
  cmdList.innerHTML = "";
  list.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s.name;
    li.addEventListener("click", () => window.open(s.href, "_blank"));
    cmdList.appendChild(li);
  });
}

// ===============
// PARALLAX SCROLL
// ===============
const cards = document.querySelectorAll(".card");
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    const dist = (rect.top + rect.height / 2 - mid) / mid;
    card.style.transform = `translateY(${dist * -10}px) rotateX(${dist * 3}deg)`;
  });
});