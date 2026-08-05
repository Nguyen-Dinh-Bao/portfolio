const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <rect width="100%" height="100%" fill="#f0f0ed"/>
    <circle cx="150" cy="115" r="55" fill="#c9c9c4"/>
    <path d="M65 275c10-65 160-65 170 0" fill="#c9c9c4"/>
  </svg>`
);

const SOCIALS = [
  ["Facebook", "F", "https://facebook.com/"],
  ["Instagram", "IG", "https://instagram.com/"],
  ["LinkedIn", "in", "https://linkedin.com/in/"],
  ["Snapchat", "S", "https://snapchat.com/"],
  ["TikTok", "♪", "https://tiktok.com/"]
];

let aboutCards = JSON.parse(localStorage.getItem("kinzAboutCards") || "null") || [
  {title:"Trình Độ Học Vấn", text:"Thêm thông tin học vấn của bạn tại đây."},
  {title:"Thông Tin Cá Nhân", text:"Thêm thông tin cá nhân của bạn tại đây."},
  {title:"Thông Tin Thêm", text:"Thêm những điều bạn muốn chia sẻ tại đây."}
];

function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getUsers() { return JSON.parse(localStorage.getItem("kinzUsers") || "[]"); }
function setUsers(users) { save("kinzUsers", users); }
function currentUser() { return JSON.parse(localStorage.getItem("kinzCurrentUser") || "null"); }

function toast(message, type="success") {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = `toast ${type} show`;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}

function renderAbout() {
  const wrap = document.getElementById("aboutCards");
  wrap.innerHTML = "";
  aboutCards.forEach((card, i) => {
    const el = document.createElement("article");
    el.className = "about-card";
    el.innerHTML = `<h3></h3><p></p><button class="outline-btn edit-card" data-index="${i}">Chỉnh sửa</button>`;
    el.querySelector("h3").textContent = card.title;
    el.querySelector("p").textContent = card.text;
    wrap.appendChild(el);
  });
  wrap.querySelectorAll(".edit-card").forEach(btn => btn.onclick = () => {
    const i = Number(btn.dataset.index);
    const title = prompt("Tên mục:", aboutCards[i].title);
    if (title === null) return;
    const text = prompt("Nội dung:", aboutCards[i].text);
    if (text === null) return;
    aboutCards[i] = {title, text};
    save("kinzAboutCards", aboutCards);
    renderAbout();
  });
}
document.getElementById("addAboutCard").onclick = () => {
  const title = prompt("Tên mục mới:");
  if (!title) return;
  const text = prompt("Nội dung:");
  if (text === null) return;
  aboutCards.push({title, text});
  save("kinzAboutCards", aboutCards);
  renderAbout();
};

function renderSocials() {
  const list = document.getElementById("socialList");
  list.innerHTML = SOCIALS.map(([name, icon, url]) => `
    <div class="social-item">
      <div class="social-icon">${icon}</div>
      <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
    </div>
  `).join("");
}

function applyTheme() {
  const dark = localStorage.getItem("kinzTheme") === "dark";
  document.body.classList.toggle("dark", dark);
  document.getElementById("themeToggle").checked = dark;
}
document.getElementById("themeToggle").onchange = e => {
  localStorage.setItem("kinzTheme", e.target.checked ? "dark" : "light");
  applyTheme();
};

function renderAccount() {
  const user = currentUser();
  const avatar = user?.avatar || DEFAULT_AVATAR;
  document.getElementById("aboutAvatar").src = avatar;
  document.getElementById("accountAvatar").src = avatar;
  document.getElementById("navAvatar").src = avatar;
  document.getElementById("profileName").textContent = user?.username || "Kinz";
  document.getElementById("authButton").classList.toggle("hidden", !!user);
  document.getElementById("avatarButton").classList.toggle("hidden", !user);
  if (user) {
    document.getElementById("usernameField").value = user.username || "";
    document.getElementById("passwordField").value = user.password || "";
    document.getElementById("gmailField").value = user.gmail || "";
    document.getElementById("bioField").value = user.bio || "";
  }
}
document.getElementById("authButton").onclick = () => openModal("authModal");
document.getElementById("avatarButton").onclick = () => showSettings();

function showSettings() {
  document.getElementById("mainPage").classList.add("hidden");
  document.getElementById("settings").classList.remove("hidden");
  location.hash = "settings";
}
document.getElementById("backHome").onclick = () => {
  document.getElementById("settings").classList.add("hidden");
  document.getElementById("mainPage").classList.remove("hidden");
  location.hash = "about";
};

document.querySelectorAll(".settings-tab[data-tab]").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".settings-tab[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".settings-panel").forEach(p => p.classList.add("hidden"));
    document.getElementById(btn.dataset.tab === "appearance" ? "appearancePanel" : "accountPanel").classList.remove("hidden");
  };
});

document.getElementById("avatarUpload").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const user = currentUser();
    if (!user) return;
    user.avatar = reader.result;
    updateUser(user);
    renderAccount();
    toast("Ảnh đại diện đã được cập nhật");
  };
  reader.readAsDataURL(file);
};

function updateUser(updated) {
  const users = getUsers().map(u => u.username === updated.username ? updated : u);
  setUsers(users);
  localStorage.setItem("kinzCurrentUser", JSON.stringify(updated));
}

document.getElementById("saveAccount").onclick = () => {
  const user = currentUser();
  if (!user) return toast("Bạn chưa đăng nhập", "error");
  user.gmail = document.getElementById("gmailField").value.trim();
  user.password = document.getElementById("passwordField").value;
  user.bio = document.getElementById("bioField").value.trim();
  updateUser(user);
  renderAccount();
  toast("Thông tin tài khoản đã được lưu");
};

document.getElementById("logoutButton").onclick = () => {
  localStorage.removeItem("kinzCurrentUser");
  renderAccount();
  toast("Bạn đã đăng xuất");
};

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
document.querySelectorAll("[data-close]").forEach(b => b.onclick = () => document.getElementById(b.dataset.close).classList.add("hidden"));

document.querySelectorAll(".auth-tab").forEach(btn => btn.onclick = () => {
  document.querySelectorAll(".auth-tab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("signinForm").classList.toggle("hidden", btn.dataset.auth !== "signin");
  document.getElementById("signupForm").classList.toggle("hidden", btn.dataset.auth !== "signup");
});

document.querySelectorAll(".eye-btn").forEach(btn => btn.onclick = () => {
  const input = document.getElementById(btn.dataset.target);
  input.type = input.type === "password" ? "text" : "password";
});

document.getElementById("signupForm").onsubmit = e => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return toast("Username đã được sử dụng", "error");
  }
  if (username.length < 3 || password.length < 4) {
    return toast("Username cần ít nhất 3 ký tự và Password ít nhất 4 ký tự", "error");
  }
  const user = {username, password, gmail:"", bio:"", avatar:DEFAULT_AVATAR};
  users.push(user);
  setUsers(users);
  localStorage.setItem("kinzCurrentUser", JSON.stringify(user));
  document.getElementById("authModal").classList.add("hidden");
  renderAccount();
  toast("Bạn đã đăng kí thành công");
  location.hash = "about";
};

document.getElementById("signinForm").onsubmit = e => {
  e.preventDefault();
  const identity = document.getElementById("signinIdentity").value.trim().toLowerCase();
  const password = document.getElementById("signinPassword").value;
  const user = getUsers().find(u =>
    (u.username.toLowerCase() === identity || (u.gmail && u.gmail.toLowerCase() === identity)) &&
    u.password === password
  );
  if (!user) return toast("Thông tin đăng nhập chưa chính xác", "error");
  localStorage.setItem("kinzCurrentUser", JSON.stringify(user));
  document.getElementById("authModal").classList.add("hidden");
  renderAccount();
  toast("Bạn đã đăng nhập thành công");
  location.hash = "about";
};

function countTextareas(form) {
  return [...form.querySelectorAll("textarea")].reduce((n, el) => n + el.value.trim().length, 0);
}
function updateFeedbackButton() {
  const n = document.getElementById("feedbackText").value.trim().length;
  document.getElementById("feedbackCount").textContent = `${n} ký tự`;
  document.getElementById("feedbackSend").classList.toggle("hidden", n < 5);
}
document.getElementById("feedbackText").oninput = updateFeedbackButton;
document.getElementById("feedbackForm").onsubmit = e => {
  e.preventDefault();
  const text = document.getElementById("feedbackText").value.trim();
  if (text.length < 5) return;
  const entries = JSON.parse(localStorage.getItem("kinzFeedback") || "[]");
  entries.push({text, time:new Date().toLocaleString()});
  save("kinzFeedback", entries);
  e.target.reset();
  updateFeedbackButton();
  renderSubmissions();
  toast("Feedback đã được gửi");
};

function updateRecommendButton() {
  const n = countTextareas(document.getElementById("recommendForm"));
  document.getElementById("recommendCount").textContent = `${n} ký tự`;
  document.getElementById("recommendSend").classList.toggle("hidden", n < 5);
}
document.querySelectorAll("#recommendForm textarea").forEach(t => t.oninput = updateRecommendButton);
document.getElementById("recommendForm").onsubmit = e => {
  e.preventDefault();
  if (countTextareas(e.target) < 5) return;
  const data = Object.fromEntries(new FormData(e.target).entries());
  const entries = JSON.parse(localStorage.getItem("kinzRecommendations") || "[]");
  entries.push({...data, time:new Date().toLocaleString()});
  save("kinzRecommendations", entries);
  e.target.reset();
  updateRecommendButton();
  renderSubmissions();
  toast("Đề xuất đã được gửi");
};

function renderSubmissions() {
  const feedback = JSON.parse(localStorage.getItem("kinzFeedback") || "[]");
  const recs = JSON.parse(localStorage.getItem("kinzRecommendations") || "[]");
  const fp = document.getElementById("feedbackAdmin");
  const rp = document.getElementById("recommendAdmin");
  fp.classList.toggle("hidden", feedback.length === 0);
  rp.classList.toggle("hidden", recs.length === 0);
  fp.innerHTML = feedback.length ? `<strong>Feedback đã nhận trên thiết bị này:</strong><br>${feedback.map(x => `• ${escapeHtml(x.text)} <small>(${x.time})</small>`).join("<br>")}` : "";
  rp.innerHTML = recs.length ? `<strong>Recommend đã nhận trên thiết bị này:</strong><br>${recs.map(x => `<div class="submission-card"><b>${escapeHtml(x.book)}</b><br>${escapeHtml(x.media)}<br>${escapeHtml(x.story)}<br>${escapeHtml(x.explanation)}<br><small>${x.time}</small></div>`).join("")}` : "";
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function route() {
  const settings = location.hash === "#settings";
  document.getElementById("settings").classList.toggle("hidden", !settings);
  document.getElementById("mainPage").classList.toggle("hidden", settings);
}
window.addEventListener("hashchange", route);

renderAbout();
renderSocials();
applyTheme();
renderAccount();
renderSubmissions();
route();
