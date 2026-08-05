/* Kinz Portfolio — Version 2.0
   Supabase Auth + PostgreSQL profile + Storage avatar
*/

const SUPABASE_URL = "https://fwskrzmivcwauleualio.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mQpBQfiOkIJNjy4qeqBX4w_7xmnJPhO";
const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/* ---------- Helpers ---------- */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `auth-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Auth modal ---------- */
const authModal = document.getElementById("authModal");
const authButton = document.getElementById("authButton");
const userAvatarButton = document.getElementById("userAvatarButton");
const navAvatar = document.getElementById("navAvatar");
const closeAuthModal = document.getElementById("closeAuthModal");
const signInTab = document.getElementById("signInTab");
const signUpTab = document.getElementById("signUpTab");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const authIdentity = document.getElementById("authIdentity");
const authPassword = document.getElementById("authPassword");
const authPasswordToggle = document.getElementById("authPasswordToggle");
const authSubmit = document.getElementById("authSubmit");
const authIdentityLabel = document.getElementById("authIdentityLabel");
const authHint = document.getElementById("authHint");

let authMode = "signin";

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";

  signInTab.classList.toggle("active", !signup);
  signUpTab.classList.toggle("active", signup);
  authTitle.textContent = signup ? "Sign Up" : "Sign In";
  authSubmit.innerHTML = signup ? 'Đăng Kí <span>↗</span>' : 'Sign In <span>↗</span>';
  authIdentityLabel.textContent = signup ? "Username" : "Username hoặc Gmail";
  authIdentity.placeholder = signup ? "Username" : "Username hoặc Gmail";
  authPassword.autocomplete = signup ? "new-password" : "current-password";
  authHint.textContent = signup
    ? "Username phải có ít nhất 3 ký tự. Email sẽ được dùng để xác thực tài khoản."
    : "Đăng nhập bằng Gmail hoặc Username của tài khoản.";

  authIdentity.value = "";
  authPassword.value = "";
  authPassword.type = "password";
  authPasswordToggle.textContent = "◉";
}

function openAuth(mode = "signin") {
  setAuthMode(mode);
  authModal.classList.add("open");
  authModal.setAttribute("aria-hidden", "false");
  setTimeout(() => authIdentity.focus(), 50);
}

function closeAuth() {
  authModal.classList.remove("open");
  authModal.setAttribute("aria-hidden", "true");
}

authButton?.addEventListener("click", () => openAuth("signin"));
userAvatarButton?.addEventListener("click", () => {
  const settingsLink = document.querySelector('[data-target="settings"]');
  if (settingsLink) settingsLink.click();
});

closeAuthModal?.addEventListener("click", closeAuth);
authModal?.addEventListener("click", event => {
  if (event.target === authModal) closeAuth();
});

signInTab?.addEventListener("click", () => setAuthMode("signin"));
signUpTab?.addEventListener("click", () => setAuthMode("signup"));

authPasswordToggle?.addEventListener("click", () => {
  const hidden = authPassword.type === "password";
  authPassword.type = hidden ? "text" : "password";
  authPasswordToggle.textContent = hidden ? "○" : "◉";
});

/* ---------- Profile DB ---------- */
async function getSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error(error);
    return null;
  }
  return data.session;
}

async function getProfile(userId) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username, email, bio, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Profile read:", error);
    return null;
  }
  return data;
}

async function createOrGetProfile(user, username = "") {
  const existing = await getProfile(user.id);
  if (existing) return existing;

  const safeUsername = username || (user.email || "kinz").split("@")[0];

  const { data, error } = await supabaseClient
    .from("profiles")
    .insert({
      id: user.id,
      username: safeUsername,
      email: user.email || "",
      bio: "Student · Learner · Creator"
    })
    .select("id, username, email, bio, avatar_url")
    .single();

  if (error) {
    console.error("Profile create:", error);
    return null;
  }
  return data;
}

async function getCurrentProfile() {
  const session = await getSession();
  if (!session) return null;
  return await getProfile(session.user.id);
}

/* ---------- Sign up ---------- */
authForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const identity = authIdentity.value.trim();
  const password = authPassword.value;

  if (authMode === "signup") {
    if (!/^[A-Za-z0-9_.-]{3,30}$/.test(identity)) {
      showToast("Username không hợp lệ. Dùng 3–30 ký tự chữ, số, ., _, -.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password phải có ít nhất 6 ký tự.", "error");
      return;
    }

    const email = prompt("Nhập Gmail để tạo tài khoản:");
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showToast("Gmail chưa đúng định dạng.", "error");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: identity
        }
      }
    });

    if (error) {
      const msg = error.message.toLowerCase().includes("already")
        ? "Email đã được sử dụng."
        : error.message;
      showToast(msg, "error");
      return;
    }

    if (!data.user) {
      showToast("Không thể tạo tài khoản.", "error");
      return;
    }

    const profile = await createOrGetProfile(data.user, identity);

    closeAuth();

    if (data.session) {
      await refreshAccountUI();
      goHome();
      showToast("Bạn đã đăng kí thành công.", "success");
    } else {
      showToast("Đăng kí thành công. Hãy kiểm tra Gmail để xác nhận tài khoản.", "success");
    }

    if (profile) renderAccountProfile(profile);
    return;
  }

  /* ---------- Sign in ---------- */
  let email = identity;

  if (!identity.includes("@")) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("email")
      .eq("username", identity)
      .maybeSingle();

    if (error || !data?.email) {
      showToast("Thông tin đăng nhập chưa chính xác", "error");
      return;
    }
    email = data.email;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    showToast("Thông tin đăng nhập chưa chính xác", "error");
    return;
  }

  closeAuth();
  await refreshAccountUI();
  goHome();
  showToast("Bạn đã đăng nhập thành công", "success");
});

/* ---------- Account panel ---------- */
const accountUsername = document.getElementById("accountUsername");
const accountPassword = document.getElementById("accountPassword");
const accountEmail = document.getElementById("accountEmail");
const accountBio = document.getElementById("accountBio");
const accountNamePreview = document.getElementById("accountNamePreview");
const accountAvatar = document.getElementById("accountAvatar");
const accountStatus = document.getElementById("accountStatus");
const accountStatusText = document.getElementById("accountStatusText");
const saveAccount = document.getElementById("saveAccount");
const resetAccount = document.getElementById("resetAccount");
const passwordToggle = document.getElementById("passwordToggle");
const changeAvatar = document.getElementById("changeAvatar");
const avatarInput = document.getElementById("avatarInput");
const signOutButton = document.getElementById("signOutButton");

let currentProfile = null;

function renderAccountProfile(profile) {
  currentProfile = profile;

  if (!profile) {
    accountUsername.value = "";
    accountPassword.value = "";
    accountEmail.value = "";
    accountBio.value = "";
    accountNamePreview.textContent = "Not signed in";
    accountAvatar.src = "assets/profile.jpg";
    accountStatus?.classList.remove("signed-in");
    if (accountStatusText) accountStatusText.textContent = "Chưa đăng nhập";
    if (signOutButton) signOutButton.disabled = true;
    return;
  }

  accountUsername.value = profile.username || "";
  accountPassword.value = "";
  accountEmail.value = profile.email || "";
  accountBio.value = profile.bio || "";
  accountNamePreview.textContent = profile.username || "Account";
  accountAvatar.src = profile.avatar_url || "assets/profile.jpg";
  accountStatus?.classList.add("signed-in");
  if (accountStatusText) accountStatusText.textContent = `Đã đăng nhập · ${profile.username}`;
  if (signOutButton) signOutButton.disabled = false;

  accountAvatar.onerror = () => {
    accountAvatar.src = "https://placehold.co/260x260/f0f0ec/777?text=K";
  };
}

async function refreshAccountUI() {
  const session = await getSession();

  if (!session) {
    authButton.hidden = false;
    userAvatarButton.hidden = true;
    renderAccountProfile(null);
    return;
  }

  const profile = await getProfile(session.user.id);
  if (!profile) {
    authButton.hidden = false;
    userAvatarButton.hidden = true;
    renderAccountProfile(null);
    return;
  }

  authButton.hidden = true;
  userAvatarButton.hidden = false;
  navAvatar.src = profile.avatar_url || "assets/profile.jpg";
  navAvatar.onerror = () => {
    navAvatar.src = "https://placehold.co/100x100/f0f0ec/777?text=K";
  };

  renderAccountProfile(profile);
}

saveAccount?.addEventListener("click", async () => {
  const session = await getSession();

  if (!session) {
    showToast("Hãy đăng nhập trước khi chỉnh sửa Account.", "error");
    return;
  }

  const username = accountUsername.value.trim();
  const email = accountEmail.value.trim();
  const bio = accountBio.value.trim();
  const newPassword = accountPassword.value;

  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) {
    showToast("Username phải có 3–30 ký tự và chỉ dùng chữ, số, ., _, -.", "error");
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Gmail chưa đúng định dạng.", "error");
    return;
  }

  if (newPassword && newPassword.length < 6) {
    showToast("Password phải có ít nhất 6 ký tự.", "error");
    return;
  }

  const { data: duplicate, error: duplicateError } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", session.user.id)
    .maybeSingle();

  if (duplicateError) {
    showToast("Không thể kiểm tra Username.", "error");
    return;
  }

  if (duplicate) {
    showToast("Username đã được sử dụng.", "error");
    return;
  }

  const { data: updatedProfile, error: profileError } = await supabaseClient
    .from("profiles")
    .update({
      username,
      email,
      bio
    })
    .eq("id", session.user.id)
    .select("id, username, email, bio, avatar_url")
    .single();

  if (profileError) {
    showToast("Không thể lưu thông tin Account.", "error");
    console.error(profileError);
    return;
  }

  if (newPassword) {
    const { error: passwordError } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (passwordError) {
      showToast("Thông tin đã lưu, nhưng Password chưa được cập nhật.", "error");
      console.error(passwordError);
      renderAccountProfile(updatedProfile);
      return;
    }
  }

  renderAccountProfile(updatedProfile);
  await refreshAccountUI();
  showToast("Đã đồng bộ Account với tài khoản online.");
});

resetAccount?.addEventListener("click", async () => {
  const profile = await getCurrentProfile();
  if (!profile) {
    showToast("Hãy đăng nhập trước.", "error");
    return;
  }
  renderAccountProfile(profile);
  showToast("Đã khôi phục dữ liệu chưa lưu.");
});

passwordToggle?.addEventListener("click", () => {
  const hidden = accountPassword.type === "password";
  accountPassword.type = hidden ? "text" : "password";
  passwordToggle.textContent = hidden ? "○" : "◉";
});

changeAvatar?.addEventListener("click", async () => {
  const session = await getSession();
  if (!session) {
    showToast("Hãy đăng nhập trước khi đổi ảnh.", "error");
    return;
  }
  avatarInput.click();
});

avatarInput?.addEventListener("change", async () => {
  const file = avatarInput.files?.[0];
  const session = await getSession();
  if (!file || !session) return;

  if (!file.type.startsWith("image/")) {
    showToast("Vui lòng chọn một file ảnh.", "error");
    avatarInput.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast("Ảnh đại diện nên nhỏ hơn 2 MB.", "error");
    avatarInput.value = "";
    return;
  }

  const extension = file.name.split(".").pop().toLowerCase() || "jpg";
  const path = `${session.user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600"
    });

  if (uploadError) {
    console.error(uploadError);
    showToast("Upload avatar thất bại. Kiểm tra Storage bucket/policy.", "error");
    avatarInput.value = "";
    return;
  }

  const { data: publicData } = supabaseClient.storage
    .from("avatars")
    .getPublicUrl(path);

  const avatarUrl = `${publicData.publicUrl}?t=${Date.now()}`;

  const { data: updated, error: profileError } = await supabaseClient
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", session.user.id)
    .select("id, username, email, bio, avatar_url")
    .single();

  if (profileError) {
    console.error(profileError);
    showToast("Ảnh đã upload nhưng chưa lưu được profile.", "error");
    return;
  }

  renderAccountProfile(updated);
  await refreshAccountUI();
  showToast("Đã cập nhật ảnh đại diện online.");
  avatarInput.value = "";
});

signOutButton?.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showToast("Đăng xuất thất bại.", "error");
    return;
  }

  await refreshAccountUI();
  goHome();
  showToast("Bạn đã đăng xuất.");
});

/* ---------- Existing About Me editor ---------- */
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
  if (!grid) return;

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
    button.addEventListener("click", () => openInfoEditor(button.closest(".info-card").dataset.cardId));
  });
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

closeInfoModal?.addEventListener("click", closeEditor);
cancelInfoEdit?.addEventListener("click", closeEditor);
infoModal?.addEventListener("click", event => {
  if (event.target === infoModal) closeEditor();
});

saveInfoEdit?.addEventListener("click", () => {
  const title = infoTitleInput.value.trim();
  const text = infoTextInput.value.trim();

  if (title.length < 2 || text.length < 5) {
    showToast("Tiêu đề và nội dung chưa đủ dài.", "error");
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

deleteInfoCard?.addEventListener("click", () => {
  if (!editingCardId || infoCards.length <= 1) return;
  if (!confirm("Bạn có chắc muốn xóa ô thông tin này?")) return;

  infoCards = infoCards.filter(card => card.id !== editingCardId);
  saveInfoCards();
  renderInfoCards();
  closeEditor();
  showToast("Đã xóa ô thông tin.");
});

addInfoCard?.addEventListener("click", () => {
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

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && infoModal?.classList.contains("open")) closeEditor();
});

/* ---------- Startup ---------- */
async function goHome() {
  const aboutLink = document.querySelector('[data-target="about"]');
  if (aboutLink) aboutLink.click();
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

renderInfoCards();

(async () => {
  const { data: listener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
      await refreshAccountUI();
    }

    if (event === "SIGNED_OUT") {
      await refreshAccountUI();
    }
  });

  await refreshAccountUI();
})();
