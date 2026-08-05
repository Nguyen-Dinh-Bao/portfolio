const body = document.body;
const progress = document.getElementById("pageProgress");
const navbar = document.getElementById("navbar");

function updatePageUI() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const percent = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = `${percent}%`;

  navbar.classList.toggle("scrolled", scrollTop > 10);
}

window.addEventListener("scroll", updatePageUI, { passive: true });
updatePageUI();

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("bao-theme");

if (savedTheme === "dark") {
  body.classList.add("dark");
  themeToggle.checked = true;
}

themeToggle.addEventListener("change", () => {
  body.classList.toggle("dark", themeToggle.checked);
  localStorage.setItem("bao-theme", themeToggle.checked ? "dark" : "light");
});

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

menuButton.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const sections = [...document.querySelectorAll("main section[id]")];
const navItems = [...document.querySelectorAll(".nav-link")];

const navObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;

  navItems.forEach(item => {
    item.classList.toggle("active", item.getAttribute("href") === `#${visible.target.id}`);
  });
}, { threshold: [0.2, 0.5, 0.8] });

sections.forEach(section => navObserver.observe(section));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));

document.querySelectorAll(".settings-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".settings-tab").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".settings-panel").forEach(panel => panel.classList.remove("active-panel"));

    button.classList.add("active");
    const panel = document.getElementById(button.dataset.panel);
    panel.classList.add("active-panel");

    panel.querySelectorAll(".reveal").forEach(item => {
      requestAnimationFrame(() => item.classList.add("visible"));
    });
  });
});

const feedbackInput = document.getElementById("feedbackInput");
const feedbackSend = document.getElementById("feedbackSend");
const feedbackCounter = document.getElementById("feedbackCounter");

function updateFeedback() {
  const length = feedbackInput.value.trim().length;
  feedbackCounter.textContent = `${length} / 5 ký tự tối thiểu`;
  feedbackSend.disabled = length < 5;
}

feedbackInput.addEventListener("input", updateFeedback);

feedbackSend.addEventListener("click", () => {
  const message = feedbackInput.value.trim();
  if (message.length < 5) return;

  localStorage.setItem("bao-last-feedback", message);
  feedbackInput.value = "";
  updateFeedback();
  showToast("Cảm ơn bạn đã gửi Feedback!");
});

const recommendFields = [
  document.getElementById("book"),
  document.getElementById("media"),
  document.getElementById("story"),
  document.getElementById("explanation")
];

const recommendSend = document.getElementById("recommendSend");
const recommendCounter = document.getElementById("recommendCounter");

function updateRecommend() {
  const total = recommendFields.reduce((sum, field) => sum + field.value.trim().length, 0);
  recommendCounter.textContent = `${total} / 5 ký tự tối thiểu`;
  recommendSend.disabled = total < 5;
}

recommendFields.forEach(field => field.addEventListener("input", updateRecommend));

recommendSend.addEventListener("click", () => {
  const total = recommendFields.reduce((sum, field) => sum + field.value.trim().length, 0);
  if (total < 5) return;

  const recommendation = {
    book: document.getElementById("book").value,
    media: document.getElementById("media").value,
    story: document.getElementById("story").value,
    explanation: document.getElementById("explanation").value
  };

  localStorage.setItem("bao-last-recommendation", JSON.stringify(recommendation));

  recommendFields.forEach(field => field.value = "");
  updateRecommend();
  showToast("Cảm ơn bạn đã gửi lời giới thiệu!");
});

const changeAvatar = document.getElementById("changeAvatar");
const avatarInput = document.getElementById("avatarInput");
const profileAvatar = document.getElementById("profileAvatar");
const accountAvatar = document.getElementById("accountAvatar");

changeAvatar.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Vui lòng chọn một tệp hình ảnh.");
    return;
  }

  const reader = new FileReader();

  reader.onload = event => {
    profileAvatar.src = event.target.result;
    accountAvatar.src = event.target.result;
    localStorage.setItem("bao-avatar", event.target.result);
    showToast("Ảnh đại diện đã được cập nhật trên thiết bị này.");
  };

  reader.readAsDataURL(file);
});

const savedAvatar = localStorage.getItem("bao-avatar");
if (savedAvatar) {
  profileAvatar.src = savedAvatar;
  accountAvatar.src = savedAvatar;
}

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}


/* Version 1.2 — editable Account profile */
const defaultAccount = {
  username: "Nguyen Dinh Bao",
  password: "",
  email: "your-email@gmail.com",
  bio: "Student · Learner · Creator"
};

const accountUsername = document.getElementById("accountUsername");
const accountPassword = document.getElementById("accountPassword");
const accountEmail = document.getElementById("accountEmail");
const accountBio = document.getElementById("accountBio");
const accountNamePreview = document.getElementById("accountNamePreview");
const saveAccount = document.getElementById("saveAccount");
const resetAccount = document.getElementById("resetAccount");
const passwordToggle = document.getElementById("passwordToggle");

function getAccountData() {
  try {
    return { ...defaultAccount, ...(JSON.parse(localStorage.getItem("bao-account")) || {}) };
  } catch {
    return { ...defaultAccount };
  }
}

function renderAccount() {
  const data = getAccountData();
  accountUsername.value = data.username || "";
  accountPassword.value = data.password || "";
  accountEmail.value = data.email || "";
  accountBio.value = data.bio || "";
  accountNamePreview.textContent = data.username || "Nguyen Dinh Bao";
}

renderAccount();

saveAccount.addEventListener("click", () => {
  const username = accountUsername.value.trim();
  const email = accountEmail.value.trim();
  const bio = accountBio.value.trim();

  if (username.length < 2) {
    showToast("Username phải có ít nhất 2 ký tự.");
    accountUsername.focus();
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Gmail chưa đúng định dạng.");
    accountEmail.focus();
    return;
  }

  const data = {
    username,
    password: accountPassword.value,
    email,
    bio
  };

  localStorage.setItem("bao-account", JSON.stringify(data));
  accountNamePreview.textContent = username;
  showToast("Đã lưu thông tin tài khoản trên thiết bị này.");
});

resetAccount.addEventListener("click", () => {
  if (!confirm("Khôi phục thông tin Account về mặc định?")) return;

  localStorage.removeItem("bao-account");
  renderAccount();
  showToast("Đã khôi phục thông tin.");
});

passwordToggle.addEventListener("click", () => {
  const hidden = accountPassword.type === "password";
  accountPassword.type = hidden ? "text" : "password";
  passwordToggle.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
  passwordToggle.textContent = hidden ? "○" : "◉";
});


/* Version 1.3 — editable About Me cards */
const defaultInfoCards = [
  {
    id: "education",
    label: "EDUCATION",
    title: "Trình Độ Học Vấn",
    text: "Thêm trường học, thành tích, chứng chỉ hoặc mục tiêu học tập của bạn."
  },
  {
    id: "profile",
    label: "PROFILE",
    title: "Thông Tin Cá Nhân",
    text: "Giới thiệu ngắn gọn về bản thân, sở thích và những điều bạn muốn chia sẻ."
  },
  {
    id: "more",
    label: "MORE",
    title: "Thông Tin Thêm",
    text: "Thêm dự án, kỹ năng, câu nói yêu thích hoặc bất kỳ nội dung nào bạn muốn."
  }
];

let infoCards = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem("bao-info-cards"));
    return Array.isArray(saved) && saved.length ? saved : defaultInfoCards;
  } catch {
    return defaultInfoCards;
  }
})();

const infoModal = document.getElementById("infoModal");
const closeInfoModal = document.getElementById("closeInfoModal");
const cancelInfoEdit = document.getElementById("cancelInfoEdit");
const saveInfoEdit = document.getElementById("saveInfoEdit");
const deleteInfoCard = document.getElementById("deleteInfoCard");
const infoTitleInput = document.getElementById("infoTitleInput");
const infoTextInput = document.getElementById("infoTextInput");
const addInfoCard = document.getElementById("addInfoCard");

let editingCardId = null;

function saveInfoCards() {
  localStorage.setItem("bao-info-cards", JSON.stringify(infoCards));
}

function renderInfoCards() {
  const grid = document.querySelector(".about-grid");
  grid.innerHTML = "";

  infoCards.forEach((card, index) => {
    const article = document.createElement("article");
    article.className = "info-card editable-info-card";
    article.dataset.cardId = card.id;

    article.innerHTML = `
      <div class="card-top">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <span>${escapeHTML(card.label || "MORE")}</span>
      </div>
      <h2 class="info-title">${escapeHTML(card.title)}</h2>
      <p class="info-text">${escapeHTML(card.text)}</p>
      <button class="card-action edit-info" type="button">Edit <span>↗</span></button>
    `;

    grid.appendChild(article);
  });

  grid.querySelectorAll(".edit-info").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".info-card");
      openInfoEditor(card.dataset.cardId);
    });
  });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openInfoEditor(id) {
  editingCardId = id;
  const card = infoCards.find(item => item.id === id);
  if (!card) return;

  infoTitleInput.value = card.title;
  infoTextInput.value = card.text;
  deleteInfoCard.style.display = infoCards.length > 1 ? "block" : "none";

  infoModal.classList.add("open");
  infoModal.setAttribute("aria-hidden", "false");
  setTimeout(() => infoTitleInput.focus(), 50);
}

function closeEditor() {
  infoModal.classList.remove("open");
  infoModal.setAttribute("aria-hidden", "true");
  editingCardId = null;
}

closeInfoModal.addEventListener("click", closeEditor);
cancelInfoEdit.addEventListener("click", closeEditor);

infoModal.addEventListener("click", event => {
  if (event.target === infoModal) closeEditor();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && infoModal.classList.contains("open")) {
    closeEditor();
  }
});

saveInfoEdit.addEventListener("click", () => {
  const title = infoTitleInput.value.trim();
  const text = infoTextInput.value.trim();

  if (title.length < 2 || text.length < 5) {
    showToast("Tiêu đề và nội dung chưa đủ dài.");
    return;
  }

  const card = infoCards.find(item => item.id === editingCardId);
  if (!card) return;

  card.title = title;
  card.text = text;

  saveInfoCards();
  renderInfoCards();
  closeEditor();
  showToast("Đã lưu thông tin About Me.");
});

deleteInfoCard.addEventListener("click", () => {
  if (!editingCardId || infoCards.length <= 1) return;

  if (!confirm("Bạn có chắc muốn xóa ô thông tin này?")) return;

  infoCards = infoCards.filter(card => card.id !== editingCardId);
  saveInfoCards();
  renderInfoCards();
  closeEditor();
  showToast("Đã xóa ô thông tin.");
});

addInfoCard.addEventListener("click", () => {
  const id = `custom-${Date.now()}`;
  infoCards.push({
    id,
    label: "CUSTOM",
    title: "Thông tin mới",
    text: "Thêm nội dung của bạn vào đây."
  });

  saveInfoCards();
  renderInfoCards();
  openInfoEditor(id);
});

renderInfoCards();
