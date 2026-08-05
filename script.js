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
