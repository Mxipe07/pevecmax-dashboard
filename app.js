const btn = document.getElementById("chatBtn");
const overlay = document.getElementById("chatOverlay");
const closeBtn = document.getElementById("closeChat");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const box = document.getElementById("chatBox");

btn.addEventListener("click", () => overlay.classList.remove("hidden"));
closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  addMessage("Du", message);
  input.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  addMessage("ChatGPT", data.reply || "Keine Antwort.");
});

function addMessage(sender, text) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${sender}:</strong> ${text}`;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}