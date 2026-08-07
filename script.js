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

feedbackSend.addEventListener("click", async () => {
  if (await isVisitor()) {
    showAuthToast("Bạn cần đăng nhập để gửi Feedback.", "error");
    return;
}
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

recommendSend.addEventListener("click", async () => {
  if (await isVisitor()) {
    showAuthToast("Bạn cần đăng nhập để gửi Recommend.", "error");
    return;
}
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



/* Version 2.1 — online Account/Profile */
const SUPABASE_URL = "https://fwskrzmivcwauleualio.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mQpBQfiOkIJNjy4qeqBX4w_7xmnJPhO";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const accountUsername = document.getElementById("accountUsername");
const accountPassword = document.getElementById("accountPassword");
const accountEmail = document.getElementById("accountEmail");
const accountBio = document.getElementById("accountBio");
const accountNamePreview = document.getElementById("accountNamePreview");
const accountStatus = document.getElementById("accountStatus");
const accountStatusText = document.getElementById("accountStatusText");
const saveAccount = document.getElementById("saveAccount");
const resetAccount = document.getElementById("resetAccount");
const passwordToggle = document.getElementById("passwordToggle");
const signOutButton = document.getElementById("signOutButton");

async function getSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}
async function getCurrentProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabaseClient.from("profiles")
    .select("id,username,email,bio,avatar_url,role").eq("id", session.user.id).maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}
async function getCurrentRole() {
    const profile = await getCurrentProfile();
    if (!profile) return "visitor";
    return profile.role || "user";
}

async function isOwner() {
    return (await getCurrentRole()) === "owner";
}

async function isUser() {
    return (await getCurrentRole()) !== "user";
}

async function isVisitor() {
    return (await getCurrentRole()) === "visitor";
}

async function updatePermissionUI() {
    document.body.dataset.role = await getCurrentRole();
}
function renderSignedInAccount(profile) {
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
  const badge = profile.role === "owner"
    ? "👑"
    : "👤";

accountNamePreview.textContent =
    `${badge} ${profile.username || "Account"}`;
  accountAvatar.src = profile.avatar_url || "assets/profile.jpg";
  accountStatus?.classList.add("signed-in");
  if (accountStatusText) accountStatusText.textContent = `Đã đăng nhập · ${profile.username}`;
  if (signOutButton) signOutButton.disabled = false;
}
async function refreshAccountUI() {
  const profile = await getCurrentProfile();
  const avatarBtn = document.getElementById("userAvatarButton");
  const authBtn = document.getElementById("authButton");
  const navAvatar = document.getElementById("navAvatar");
  if (!profile) {
    authBtn.hidden=false; avatarBtn.hidden=true;
    renderSignedInAccount(null); return;
  }
  authBtn.hidden=true; avatarBtn.hidden=false;
  navAvatar.src=profile.avatar_url || "assets/profile.jpg";
  renderSignedInAccount(profile);
  await updatePermissionUI();
}
saveAccount?.addEventListener("click", async () => {
  const session=await getSession();
  if (!session) return showAuthToast("Hãy đăng nhập trước khi chỉnh sửa Account.","error");
  const username=accountUsername.value.trim(), email=accountEmail.value.trim(), bio=accountBio.value.trim(), pw=accountPassword.value;
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return showAuthToast("Username không hợp lệ.","error");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthToast("Gmail chưa đúng định dạng.","error");
  if (pw && pw.length<6) return showAuthToast("Password phải có ít nhất 6 ký tự.","error");
  const {data: dup,error:dupErr}=await supabaseClient.from("profiles").select("id").eq("username",username).neq("id",session.user.id).maybeSingle();
  if (dupErr) return showAuthToast("Không thể kiểm tra Username.","error");
  if (dup) return showAuthToast("Username đã được sử dụng","error");
  const {data: updated,error}=await supabaseClient.from("profiles").update({username,email,bio}).eq("id",session.user.id).select("id,username,email,bio,avatar_url").single();
  if (error) { console.error(error); return showAuthToast("Không thể lưu thông tin Account.","error"); }
  if (pw) {
    const {error:pe}=await supabaseClient.auth.updateUser({password:pw});
    if (pe) return showAuthToast("Thông tin đã lưu nhưng Password chưa cập nhật.","error");
  }
  renderSignedInAccount(updated); await refreshAccountUI();
await updatePermissionUI();
  showAuthToast("Đã đồng bộ Account online.","success");
});
resetAccount?.addEventListener("click",async()=>{renderSignedInAccount(await getCurrentProfile());});
passwordToggle?.addEventListener("click",()=>{const h=accountPassword.type==="password";accountPassword.type=h?"text":"password";passwordToggle.textContent=h?"○":"◉";});
changeAvatar?.addEventListener("click",async()=>{if(await getSession()) avatarInput.click();else showAuthToast("Hãy đăng nhập trước.","error");});
avatarInput?.addEventListener("change",async()=>{
  const f=avatarInput.files?.[0], s=await getSession(); if(!f||!s)return;
  if(!f.type.startsWith("image/")) return showAuthToast("Vui lòng chọn file ảnh.","error");
  if(f.size>2*1024*1024)return showAuthToast("Ảnh nên nhỏ hơn 2 MB.","error");
  const ext=f.name.split(".").pop().toLowerCase()||"jpg", path=`${s.user.id}/avatar.${ext}`;
  const {error:ue}=await supabaseClient.storage.from("avatars").upload(path,f,{upsert:true,contentType:f.type,cacheControl:"3600"});
  if(ue){console.error(ue);return showAuthToast("Upload avatar thất bại. Kiểm tra Storage policy.","error");}
  const {data:pd}=supabaseClient.storage.from("avatars").getPublicUrl(path);
  const avatarUrl=pd.publicUrl+"?t="+Date.now();
  const {data:updated,error}=await supabaseClient.from("profiles").update({avatar_url:avatarUrl}).eq("id",s.user.id).select("id,username,email,bio,avatar_url").single();
  if(error)return showAuthToast("Không thể lưu avatar.","error");
  renderSignedInAccount(updated); await refreshAccountUI(); showAuthToast("Đã cập nhật ảnh đại diện.","success"); avatarInput.value="";
});
signOutButton?.addEventListener("click",async()=>{
  const {error}=await supabaseClient.auth.signOut();
  if(error)return showAuthToast("Đăng xuất thất bại.","error");
  await refreshAccountUI(); goHome(); showAuthToast("Bạn đã đăng xuất.","success");
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
      <button class="card-action edit-info owner-only" type="button">Edit <span>↗</span></button>
    `;

    grid.appendChild(article);
  });

  grid.querySelectorAll(".edit-info").forEach(button => {
    button.addEventListener("click", async () => {
      const card = button.closest(".info-card");
      await openInfoEditor(card.dataset.cardId);
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

async function openInfoEditor(id) {
  if (!(await isOwner())) {
    showAuthToast("Chỉ Owner mới được chỉnh About Me.", "error");
    return;
}
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

addInfoCard.addEventListener("click", async () => {
  if (!(await isOwner())) {
    showAuthToast("Chỉ Owner mới được thêm mục.", "error");
    return;
}
  const id = `custom-${Date.now()}`;
  infoCards.push({
    id,
    label: "CUSTOM",
    title: "Thông tin mới",
    text: "Thêm nội dung của bạn vào đây."
  });

  saveInfoCards();
  renderInfoCards();
  await openInfoEditor(id);
});

renderInfoCards();



/* Version 2.1 — online Sign In / Sign Up */
const authModal=document.getElementById("authModal");
const authButton=document.getElementById("authButton");
const userAvatarButton=document.getElementById("userAvatarButton");
const navAvatar=document.getElementById("navAvatar");
const closeAuthModal=document.getElementById("closeAuthModal");
const signInTab=document.getElementById("signInTab");
const signUpTab=document.getElementById("signUpTab");
const authTitle=document.getElementById("authTitle");
const authForm=document.getElementById("authForm");
const authIdentity=document.getElementById("authIdentity");
const authPassword=document.getElementById("authPassword");
const authEmail = document.getElementById("authEmail");
const authConfirmPassword = document.getElementById("authConfirmPassword");
const signupOnlyFields = document.querySelectorAll(".auth-signup-only");
const authPasswordToggle=document.getElementById("authPasswordToggle");
const authSubmit=document.getElementById("authSubmit");
const authIdentityLabel=document.getElementById("authIdentityLabel");
const authHint=document.getElementById("authHint");
let authMode="signin";

function setAuthMode(mode){
  authMode=mode;
  const signup = mode === "signup";
  signupOnlyFields.forEach(field=>{
    field.style.display = signup ? "block" : "none";
  });
  signInTab.classList.toggle("active",!signup); signUpTab.classList.toggle("active",signup);
  authTitle.textContent = signup ? "Sign Up" : "Sign In";
  authIdentityLabel.textContent =
    signup
        ? "Username"
        : "Username hoặc Gmail";

authIdentity.placeholder = "Username";
 authSubmit.innerHTML =
    signup
        ? 'Sign Up <span>↗</span>'
        : 'Sign In <span>↗</span>';
  authIdentityLabel.textContent=signup?"Username":"Username hoặc Gmail";
  authIdentity.placeholder=signup?"Username":"Username hoặc Gmail";
  authHint.textContent=signup?"Username 3–30 ký tự. Gmail sẽ được dùng cho tài khoản Supabase.":"Đăng nhập bằng Username hoặc Gmail.";
  authIdentity.value="";authPassword.value="";authPassword.type="password";authPasswordToggle.textContent="◉";
}
function openAuth(mode="signin"){setAuthMode(mode);authModal.classList.add("open");authModal.setAttribute("aria-hidden","false");setTimeout(()=>authIdentity.focus(),50);}
function closeAuth(){authModal.classList.remove("open");authModal.setAttribute("aria-hidden","true");}
authButton.addEventListener("click",()=>openAuth("signin"));
userAvatarButton.addEventListener("click",()=>document.querySelector('[data-target="settings"]')?.click());
closeAuthModal.addEventListener("click",closeAuth);
authModal.addEventListener("click",e=>{if(e.target===authModal)closeAuth();});
signInTab.addEventListener("click",()=>setAuthMode("signin"));
signUpTab.addEventListener("click",()=>setAuthMode("signup"));
authPasswordToggle.addEventListener("click",()=>{const h=authPassword.type==="password";authPassword.type=h?"text":"password";authPasswordToggle.textContent=h?"○":"◉";});

authForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const identity = authIdentity.value.trim();
  const email = authEmail.value.trim();
  const password = authPassword.value;
  const confirmPassword = authConfirmPassword.value;
  if(authMode==="signup"){
    if(!email){
    return showAuthToast("Vui lòng nhập Email.","error");
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return showAuthToast("Email không hợp lệ.","error");
    }
    if(password !== confirmPassword){
    return showAuthToast("Mật khẩu xác nhận không khớp.","error");
    }
    if(!/^[A-Za-z0-9_.-]{3,30}$/.test(identity))return showAuthToast("Username không hợp lệ.","error");
    if(password.length<6)return showAuthToast("Password phải có ít nhất 6 ký tự.","error");
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))return showAuthToast("Gmail chưa đúng định dạng.","error");
    const {data,error}=await supabaseClient.auth.signUp({email:email.trim(),password,options:{data:{username:identity}}});
    if(error)return showAuthToast(error.message.toLowerCase().includes("already")?"Email đã được sử dụng.":error.message,"error");
    if(!data.user)return showAuthToast("Không thể tạo tài khoản.","error");
    const {data:profile,error:pe}=await supabaseClient.from("profiles").insert({id:data.user.id,username:identity,email:email.trim(),bio:""}).select("id,username,email,bio,avatar_url").single();
    if(pe){console.error(pe);return showAuthToast("Tài khoản Auth đã tạo nhưng profile chưa tạo. Kiểm tra RLS.","error");}
    closeAuth();
    if(data.session){await refreshAccountUI();goHome();showAuthToast("Bạn đã đăng kí thành công.","success");}
    else showAuthToast("Đăng kí thành công. Hãy xác nhận Gmail rồi đăng nhập.","success");
    return;
  }
  let email=identity;
  if(!identity.includes("@")){
    const {data,error}=await supabaseClient.from("profiles").select("email").eq("username",identity).maybeSingle();
    if(error||!data?.email)return showAuthToast("Thông tin đăng nhập chưa chính xác","error");
    email=data.email;
  }
  const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error||!data.session)return showAuthToast("Thông tin đăng nhập chưa chính xác","error");
  closeAuth();await refreshAccountUI();goHome();showAuthToast("Bạn đã đăng nhập thành công","success");
});
function updateAuthUI(){refreshAccountUI();}
(async()=>{
  supabaseClient.auth.onAuthStateChange(()=>{
    setTimeout(async()=>{
        await refreshAccountUI();
        await updatePermissionUI();
    },0);
  },0);
   await refreshAccountUI();
  await updatePermissionUI();
})();