const body = document.body;

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
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

document.querySelectorAll(".settings-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".settings-tab").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".settings-panel").forEach(panel => panel.classList.remove("active-panel"));

    button.classList.add("active");
    document.getElementById(button.dataset.panel).classList.add("active-panel");
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

  alert("Cảm ơn bạn đã gửi Feedback!");
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
  const total = recommendFields.reduce((sum, field) => {
    return sum + field.value.trim().length;
  }, 0);

  recommendCounter.textContent = `${total} / 5 ký tự tối thiểu`;
  recommendSend.disabled = total < 5;
}

recommendFields.forEach(field => {
  field.addEventListener("input", updateRecommend);
});

recommendSend.addEventListener("click", () => {
  const total = recommendFields.reduce((sum, field) => {
    return sum + field.value.trim().length;
  }, 0);

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

  alert("Cảm ơn bạn đã gửi lời giới thiệu!");
});

const changeAvatar = document.getElementById("changeAvatar");
const avatarInput = document.getElementById("avatarInput");
const profileAvatar = document.getElementById("profileAvatar");
const accountAvatar = document.getElementById("accountAvatar");

changeAvatar.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {
    profileAvatar.src = event.target.result;
    accountAvatar.src = event.target.result;
    localStorage.setItem("bao-avatar", event.target.result);
  };

  reader.readAsDataURL(file);
});

const savedAvatar = localStorage.getItem("bao-avatar");

if (savedAvatar) {
  profileAvatar.src = savedAvatar;
  accountAvatar.src = savedAvatar;
}
