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
const dashboardTab = document.getElementById("dashboardTab");
const ownerFeedbackList = document.getElementById("ownerFeedbackList");
const ownerRecommendList = document.getElementById("ownerRecommendList");
function updateFeedback() {
  const length = feedbackInput.value.trim().length;
  feedbackCounter.textContent = `${length} / 5 ký tự tối thiểu`;
  feedbackSend.disabled = length < 5;
}

feedbackInput.addEventListener("input", updateFeedback);

feedbackSend.addEventListener("click", async () => {
  if (currentUserRole !== "user" && currentUserRole !== "owner") {
    showToast("Bạn cần đăng nhập để gửi Feedback.");
    return;
  }

  const session = await getSession();

  if (!session) {
    showAuthToast("Hãy đăng nhập trước khi gửi Feedback.", "error");
    return;
  }

  const message = feedbackInput.value.trim();

  if (message.length < 5) {
    showToast("Feedback quá ngắn.");
    return;
  }

  const { error } = await supabaseClient
    .from("feedback")
    .insert({
      user_id: session.user.id,
      message: message
    });

  if (error) {
    console.error(error);
    showAuthToast("Không thể gửi Feedback.", "error");
    return;
  }

  feedbackInput.value = "";

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
  if (currentUserRole !== "user" && currentUserRole !== "owner") {
    showToast("Bạn cần đăng nhập để gửi Recommend.");
    return;
  }

  const session = await getSession();

  if (!session) {
    showAuthToast("Hãy đăng nhập trước khi gửi Recommend.", "error");
    return;
  }

  const book = document.getElementById("book").value.trim();
  const media = document.getElementById("media").value.trim();
  const story = document.getElementById("story").value.trim();
  const explanation = document.getElementById("explanation").value.trim();

  const total =
    book.length +
    media.length +
    story.length +
    explanation.length;

  if (total < 5) {
    showToast("Vui lòng nhập thêm nội dung.");
    return;
  }

  const { error } = await supabaseClient
    .from("recommendations")
    .insert({
      user_id: session.user.id,
      book: book,
      media: media,
      story: story,
      explanation: explanation
    });

  if (error) {
    console.error(error);
    showAuthToast("Không thể gửi Recommend.", "error");
    return;
  }

  document.getElementById("book").value = "";
  document.getElementById("media").value = "";
  document.getElementById("story").value = "";
  document.getElementById("explanation").value = "";

  showToast("Cảm ơn bạn đã gửi lời giới thiệu!");
});

const changeAvatar = document.getElementById("changeAvatar");
const avatarInput = document.getElementById("avatarInput");
const changePortfolioAvatar =
    document.getElementById("changePortfolioAvatar");

const portfolioAvatarInput =
    document.getElementById("portfolioAvatarInput");

const profileAvatar =
    document.getElementById("profileAvatar");
const heroName = document.getElementById("heroName");
const heroSubtitle = document.getElementById("heroSubtitle");
const facebookLink = document.getElementById("facebookLink");
const instagramLink = document.getElementById("instagramLink");
const linkedinLink = document.getElementById("linkedinLink");
const snapchatLink = document.getElementById("snapchatLink");
const tiktokLink = document.getElementById("tiktokLink");
const accountAvatar = document.getElementById("accountAvatar");

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
function showAuthToast(message, type) {
    showToast(message);
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
  if (!session?.user) return null;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id,username,email,bio,avatar_url,role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
async function updatePortfolio(fields) {

    const { error } = await supabaseClient
        .from("portfolio")
        .update(fields)
        .eq("id", 1);

    if (error) {
        console.error("Update Portfolio:", error);
        return false;
    }

    return true;
}
/* ---------- Portfolio Avatar Upload ---------- */

changePortfolioAvatar?.addEventListener("click", async () => {

    const profile = await getCurrentProfile();

    if (!profile || profile.role !== "owner") {
        showAuthToast("Chỉ Owner mới có thể thay đổi ảnh Portfolio.", "error");
        return;
    }

    portfolioAvatarInput.click();

});

portfolioAvatarInput?.addEventListener("change", async () => {

    const file = portfolioAvatarInput.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showAuthToast("Vui lòng chọn một file ảnh.", "error");
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showAuthToast("Ảnh phải nhỏ hơn 2 MB.", "error");
        return;
    }

    const ext = file.name.split(".").pop().toLowerCase();

    const path = `profile.${ext}`;

    const { error: uploadError } =
        await supabaseClient.storage
            .from("Portfolio")
            .upload(path, file, {
                upsert: true,
                contentType: file.type,
                cacheControl: "3600"
            });

    if (uploadError) {

        console.error(uploadError);

        showAuthToast(uploadError.message, "error");

        return;

    }

    const { data } =
        supabaseClient.storage
            .from("Portfolio")
            .getPublicUrl(path);

    const imageUrl =
        data.publicUrl + "?t=" + Date.now();

    const saved = await updatePortfolio({
    profile_image: imageUrl
});

    if (!saved) {

        showAuthToast("Không thể lưu Portfolio Avatar.", "error");

        return;

    }

    const portfolio = await loadPortfolio();

    profileAvatar.src =
    portfolio.profile_image || "assets/profile.jpg";

    portfolioAvatarInput.value = "";

    showAuthToast("Đã cập nhật Portfolio Avatar.", "success");

});
async function loadPortfolio() {
  const { data, error } = await supabaseClient
    .from("portfolio")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Portfolio load error:", error);
    return null;
  }

  return data;
}
(async () => {
    const portfolio = await loadPortfolio();
    console.log("PORTFOLIO:", portfolio);
})();
let currentUserRole = "visitor";

function applyRoleUI(role) {
  currentUserRole = role || "visitor";

  const isOwner = currentUserRole === "owner";
  const isUser = currentUserRole === "user";
  if (dashboardTab) {
  dashboardTab.hidden = !isOwner;
  }
  if (isOwner) {
  renderOwnerFeedback();
  renderOwnerRecommendations();
}
  if (feedbackSend) {
    feedbackSend.disabled = !isUser && !isOwner;
  }

  if (recommendSend) {
    recommendSend.disabled = !isUser && !isOwner;
  }

  document.querySelectorAll(".edit-info").forEach(button => {
    button.hidden = !isOwner;
  });

  if (addInfoCard) {
    addInfoCard.hidden = !isOwner;
  }
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
    changePortfolioAvatar.hidden = true;
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
  changePortfolioAvatar.hidden = true;
   authBtn.hidden = false;
   avatarBtn.hidden = true;
   applyRoleUI("visitor");
   renderSignedInAccount(null);
   return;
  }
 authBtn.hidden = true;
 avatarBtn.hidden = false;
 navAvatar.src = profile.avatar_url || "assets/profile.jpg";

 applyRoleUI(profile.role);
 if (changePortfolioAvatar) {
    changePortfolioAvatar.hidden =
        profile.role !== "owner";
}
 renderSignedInAccount(profile);
}
async function loadOwnerFeedback() {
  if (currentUserRole !== "owner") {
    return [];
  }

  const { data, error } = await supabaseClient
    .from("feedback")
    .select("id,user_id,message,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}
async function loadOwnerRecommendations() {
  if (currentUserRole !== "owner") {
    return [];
  }

  const { data, error } = await supabaseClient
    .from("recommendations")
    .select("id,user_id,book,media,story,explanation,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}
async function renderOwnerRecommendations() {
  if (!ownerRecommendList) return;

  const recommendations = await loadOwnerRecommendations();

  if (!recommendations.length) {
    ownerRecommendList.innerHTML = "<p>Chưa có Recommend nào.</p>";
    return;
  }

  ownerRecommendList.innerHTML = recommendations.map(item => `
    <article class="feedback-box">
      <p><strong>Book:</strong> ${escapeHTML(item.book || "—")}</p>
      <p><strong>Media:</strong> ${escapeHTML(item.media || "—")}</p>
      <p><strong>Story:</strong> ${escapeHTML(item.story || "—")}</p>
      <p><strong>Explanation:</strong> ${escapeHTML(item.explanation || "—")}</p>
      <small>${new Date(item.created_at).toLocaleString("vi-VN")}</small>
    </article>
  `).join("");
}
async function renderOwnerFeedback() {
  if (!ownerFeedbackList) return;

  const feedbacks = await loadOwnerFeedback();

  if (!feedbacks.length) {
    ownerFeedbackList.innerHTML = "<p>Chưa có Feedback nào.</p>";
    return;
  }

  ownerFeedbackList.innerHTML = feedbacks.map(item => `
    <article class="feedback-box">
      <p>${escapeHTML(item.message)}</p>
      <small>${new Date(item.created_at).toLocaleString("vi-VN")}</small>
    </article>
  `).join("");
}
saveAccount?.addEventListener("click", async () => {
  const session=await getSession();
  if (!session) return showAuthToast("Hãy đăng nhập trước khi chỉnh sửa Account.","error");
  const username=accountUsername.value.trim(), email=accountEmail.value.trim(), bio=accountBio.value.trim(), pw=accountPassword.value;
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return showAuthToast("Username không hợp lệ.","error");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  return showAuthToast("Gmail chưa đúng định dạng.","error");
  if (pw && pw.length<6) return showAuthToast("Password phải có ít nhất 6 ký tự.","error");
  const {data: dup,error:dupErr}=await supabaseClient.from("profiles").select("id").eq("username",username).neq("id",session.user.id).maybeSingle();
  if (dupErr) return showAuthToast("Không thể kiểm tra Username.","error");
  if (dup) return showAuthToast("Username đã được sử dụng","error");
 const { data: updated, error } = await supabaseClient
  .from("profiles")
  .update({
    username,
    bio
  })
  .eq("id", session.user.id)
  .select("id,username,email,bio,avatar_url,role")
  .single();
  if (error) { console.error(error); return showAuthToast("Không thể lưu thông tin Account.","error"); }
  if (email && email !== session.user.email) {
  const { error: emailError } = await supabaseClient.auth.updateUser({
    email: email
  });

  if (emailError) {
    console.error(emailError);
    return showAuthToast(
      "Username và Bio đã lưu nhưng Gmail chưa cập nhật.",
      "error"
    );
  }
}
  if (pw) {
    
    const {error:pe}=await supabaseClient.auth.updateUser({password:pw});
    if (pe) return showAuthToast("Thông tin đã lưu nhưng Password chưa cập nhật.","error");
  }
  renderSignedInAccount({
  ...updated,
  email: email
}); await refreshAccountUI();
await updatePermissionUI();
  showAuthToast("Đã đồng bộ Account online.","success");
});
resetAccount?.addEventListener("click",async()=>{renderSignedInAccount(await getCurrentProfile());});
passwordToggle?.addEventListener("click",()=>{const h=accountPassword.type==="password";accountPassword.type=h?"text":"password";passwordToggle.textContent=h?"○":"◉";});
changeAvatar?.addEventListener("click",async()=>{if(await getSession()) avatarInput.click();else showAuthToast("Hãy đăng nhập trước.","error");});
avatarInput?.addEventListener("change",async()=>{
  const f=avatarInput.files?.[0], s=await getSession(); if(!f||!s)return;
  console.log("AVATAR USER ID:", s.user.id);
console.log("AVATAR EMAIL:", s.user.email);
console.log("AVATAR PATH:", `${s.user.id}/avatar.jpg`);

const { data: authData, error: authError } =
  await supabaseClient.auth.getUser();

console.log("AUTH USER ID:", authData?.user?.id);
console.log("AUTH ERROR:", authError);
const { data: sessionData } = await supabaseClient.auth.getSession();

console.log(
  "AUTH ROLE:",
  sessionData?.session?.user?.role
);
  if(!f.type.startsWith("image/")) return showAuthToast("Vui lòng chọn file ảnh.","error");
  if(f.size>2*1024*1024)return showAuthToast("Ảnh nên nhỏ hơn 2 MB.","error");
  const ext=f.name.split(".").pop().toLowerCase()||"jpg", path=`${s.user.id}/avatar.${ext}`;
  const {error:ue}=await supabaseClient.storage.from("Avatars").upload(path,f,{upsert:true,contentType:f.type,cacheControl:"3600"});
  if (ue) {
  console.error("Avatar upload error:", ue);
  return showAuthToast(
    `Upload thất bại: ${ue.message || "Unknown error"}`,
    "error"
  );
}
  const {data:pd}=supabaseClient.storage.from("Avatars").getPublicUrl(path);
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


const infoModal = document.getElementById("infoModal");
const closeInfoModal = document.getElementById("closeInfoModal");
const cancelInfoEdit = document.getElementById("cancelInfoEdit");
const saveInfoEdit = document.getElementById("saveInfoEdit");
const deleteInfoCard = document.getElementById("deleteInfoCard");
const infoTitleInput = document.getElementById("infoTitleInput");
const infoTextInput = document.getElementById("infoTextInput");
const heroNameInput =
    document.getElementById("heroNameInput");

const heroSubtitleInput =
    document.getElementById("heroSubtitleInput");
    const portfolioHeroTab =
    document.getElementById("portfolioHeroTab");

const portfolioAboutTab =
    document.getElementById("portfolioAboutTab");

const portfolioContactTab =
    document.getElementById("portfolioContactTab");
    const heroFields =
    document.getElementById("heroFields");

const infoTitleField =
    infoTitleInput.closest(".modal-field");

const infoTextField =
    infoTextInput.closest(".modal-field");
const addInfoCard = document.getElementById("addInfoCard");
const editPortfolioButton =
    document.getElementById("editPortfolioButton");
    const portfolioCMSModal =
  document.getElementById("portfolioCMSModal");

const closePortfolioCMS =
  document.getElementById("closePortfolioCMS");

const cancelPortfolioCMS =
  document.getElementById("cancelPortfolioCMS");

const savePortfolioCMS =
  document.getElementById("savePortfolioCMS");
  savePortfolioCMS?.addEventListener("click", async () => {

  const fields = {
    hero_name: cmsHeroName.value.trim(),
    hero_subtitle: cmsHeroSubtitle.value.trim(),

    education_title: cmsEducationTitle.value.trim(),
    education_text: cmsEducationText.value.trim(),

    profile_title: cmsProfileTitle.value.trim(),
    profile_text: cmsProfileText.value.trim(),

    more_title: cmsMoreTitle.value.trim(),
    more_text: cmsMoreText.value.trim()
  };

  if (!fields.hero_name || !fields.hero_subtitle) {
    showAuthToast(
      "Hero Name và Hero Subtitle không được để trống.",
      "error"
    );
    return;
  }

  const ok = await updatePortfolio(fields);

  if (!ok) {
    showAuthToast(
      "Không thể lưu Portfolio.",
      "error"
    );
    return;
  }

  await renderInfoCards();

  closePortfolioCMSModal();

  showAuthToast(
    "Đã lưu Portfolio thành công.",
    "success"
  );

});
const portfolioHeroPanel =
  document.getElementById("portfolioHeroPanel");

const portfolioAboutPanel =
  document.getElementById("portfolioAboutPanel");

const portfolioContactPanel =
  document.getElementById("portfolioContactPanel");
const cmsHeroName =
  document.getElementById("cmsHeroName");

const cmsHeroSubtitle =
  document.getElementById("cmsHeroSubtitle");

const cmsEducationTitle =
  document.getElementById("cmsEducationTitle");

const cmsEducationText =
  document.getElementById("cmsEducationText");

const cmsProfileTitle =
  document.getElementById("cmsProfileTitle");

const cmsProfileText =
  document.getElementById("cmsProfileText");

const cmsMoreTitle =
  document.getElementById("cmsMoreTitle");

const cmsMoreText =
  document.getElementById("cmsMoreText");

const cmsFacebook =
  document.getElementById("cmsFacebook");

const cmsInstagram =
  document.getElementById("cmsInstagram");

const cmsLinkedin =
  document.getElementById("cmsLinkedin");

const cmsSnapchat =
  document.getElementById("cmsSnapchat");

const cmsTiktok =
  document.getElementById("cmsTiktok");

const cmsEmail =
  document.getElementById("cmsEmail");
async function openPortfolioCMS() {

  if (!(await isOwner())) {
    showAuthToast(
      "Chỉ Owner mới được chỉnh Portfolio.",
      "error"
    );
    return;
  }

  const loaded = await loadPortfolioCMS();

  if (!loaded) return;

  portfolioCMSModal.classList.add("open");
  portfolioCMSModal.setAttribute(
    "aria-hidden",
    "false"
  );

}


async function loadPortfolioCMS() {

  const portfolio = await loadPortfolio();

  if (!portfolio) {
    showAuthToast(
      "Không thể tải dữ liệu Portfolio.",
      "error"
    );
    return false;
  }

  cmsHeroName.value =
    portfolio.hero_name || "";

  cmsHeroSubtitle.value =
    portfolio.hero_subtitle || "";

  cmsEducationTitle.value =
    portfolio.education_title || "";

  cmsEducationText.value =
    portfolio.education_text || "";

  cmsProfileTitle.value =
    portfolio.profile_title || "";

  cmsProfileText.value =
    portfolio.profile_text || "";

  cmsMoreTitle.value =
    portfolio.more_title || "";

  cmsMoreText.value =
    portfolio.more_text || "";

  return true;
}


function switchPortfolioCMSTab(tab) {

  portfolioHeroTab.classList.remove("active");
  portfolioAboutTab.classList.remove("active");
  portfolioContactTab.classList.remove("active");

  portfolioHeroPanel.hidden = true;
  portfolioAboutPanel.hidden = true;
  portfolioContactPanel.hidden = true;

  let activePanel = null;

  if (tab === "hero") {

    portfolioHeroTab.classList.add("active");
    activePanel = portfolioHeroPanel;

  }

  if (tab === "about") {

    portfolioAboutTab.classList.add("active");
    activePanel = portfolioAboutPanel;

  }

  if (tab === "contact") {

    portfolioContactTab.classList.add("active");
    activePanel = portfolioContactPanel;

  }

  if (!activePanel) return;

  activePanel.hidden = false;

  activePanel.style.animation = "none";

  requestAnimationFrame(() => {
    activePanel.style.animation =
      "portfolioPanelIn 0.35s ease both";
  });

}


portfolioHeroTab?.addEventListener("click", () => {
  switchPortfolioCMSTab("hero");
});

portfolioAboutTab?.addEventListener("click", () => {
  switchPortfolioCMSTab("about");
});

portfolioContactTab?.addEventListener("click", () => {
  switchPortfolioCMSTab("contact");
});

function closePortfolioCMSModal() {

  portfolioCMSModal.classList.remove("open");

  portfolioCMSModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


closePortfolioCMS?.addEventListener(
  "click",
  closePortfolioCMSModal
);

cancelPortfolioCMS?.addEventListener(
  "click",
  closePortfolioCMSModal
);


portfolioCMSModal?.addEventListener(
  "click",
  event => {

    if (event.target === portfolioCMSModal) {
      closePortfolioCMSModal();
    }

  }
);


editPortfolioButton?.addEventListener(
  "click",
  openPortfolioCMS
);
let editingCardId = null;

async function renderInfoCards() {
  const grid = document.querySelector(".about-grid");
  grid.innerHTML = "";
const portfolio = await loadPortfolio();

if (!portfolio) {
    showToast("Không thể tải Portfolio.");
    return;
}

if (portfolio.profile_image) {
    profileAvatar.src = portfolio.profile_image;
}
heroName.textContent =
    portfolio.hero_name || "Nguyen Dinh Bao";

heroSubtitle.textContent =
    portfolio.hero_subtitle || "Student · Learner · Creator";
facebookLink.href =
    portfolio.facebook || "#";

instagramLink.href =
    portfolio.instagram || "#";

linkedinLink.href =
    portfolio.linkedin || "#";

snapchatLink.href =
    portfolio.snapchat || "#";

tiktokLink.href =
    portfolio.tiktok || "#";
  const infoCards = [
    {
        id: "education",
        label: "EDUCATION",
        title: portfolio.education_title,
        text: portfolio.education_text
    },
    {
        id: "profile",
        label: "PROFILE",
        title: portfolio.profile_title,
        text: portfolio.profile_text
    },
    {
        id: "more",
        label: "MORE",
        title: portfolio.more_title,
        text: portfolio.more_text
    }
];

infoCards.forEach((card, index) => {
    const article = document.createElement("article");
    article.className = "info-card editable-info-card";
    article.dataset.cardId = card.id;

    article.innerHTML = `
  <div class="card-top">
    <span>${String(index + 1).padStart(2, "0")}</span>
    <span>${escapeHTML(card.label)}</span>
  </div>

  <h2 class="info-title">${escapeHTML(card.title)}</h2>

  <p class="info-text">${escapeHTML(card.text)}</p>
`;

    grid.appendChild(article);
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

  const portfolio = await loadPortfolio();
  heroNameInput.value = portfolio.hero_name || "";

    heroSubtitleInput.value =
    portfolio.hero_subtitle || "";

  if (!portfolio) {
    showAuthToast("Không thể tải dữ liệu Portfolio.", "error");
    return;
  }

  let title = "";
  let text = "";

  switch (id) {
    case "education":
      title = portfolio.education_title;
      text = portfolio.education_text;
      break;

    case "profile":
      title = portfolio.profile_title;
      text = portfolio.profile_text;
      break;

    case "more":
      title = portfolio.more_title;
      text = portfolio.more_text;
      break;

    default:
      return;
  }

  infoTitleInput.value = title;
  infoTextInput.value = text;

  // Không còn chức năng Delete
  deleteInfoCard.style.display = "none";

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

saveInfoEdit.addEventListener("click", async () => {
  const title = infoTitleInput.value.trim();
  const text = infoTextInput.value.trim();

  if (title.length < 2 || text.length < 5) {
    showToast("Tiêu đề và nội dung chưa đủ dài.");
    return;
  }

let fields = {

    hero_name: heroNameInput.value.trim(),

    hero_subtitle: heroSubtitleInput.value.trim()

};

switch (editingCardId) {

    case "education":
        fields.education_title = title;
        fields.education_text = text;
        break;

    case "profile":
        fields.profile_title = title;
        fields.profile_text = text;
        break;

    case "more":
        fields.more_title = title;
        fields.more_text = text;
        break;
}

const ok = await updatePortfolio(fields);

if (!ok) {
    showToast("Không thể lưu dữ liệu.");
    return;
}
  await renderInfoCards();
  closeEditor();
  showToast("Đã lưu thông tin About Me.");
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
    const {data,error}=await supabaseClient.auth.signUp({
    email:email.trim(),
    password,
    options:{
        emailRedirectTo:"https://nguyen-dinh-bao.github.io/portfolio/",
        data:{
            username:identity
        }
    }
});
    if(error){
    console.error(error);
    return showAuthToast(error.message,"error");
    }
    if(!data.user)return showAuthToast("Không thể tạo tài khoản.","error");
    closeAuth();
    if(data.session){await refreshAccountUI();goHome();showAuthToast("Bạn đã đăng kí thành công.","success");}
    else showAuthToast("Đăng kí thành công. Hãy xác nhận Gmail rồi đăng nhập.","success");
    return;
  }
  let loginEmail = identity;
  if(!identity.includes("@")){
    const {data,error}=await supabaseClient.from("profiles").select("email").eq("username",identity).maybeSingle();
    if(error||!data?.email)return showAuthToast("Thông tin đăng nhập chưa chính xác","error");
    loginEmail = data.email;
  }
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: loginEmail,
    password
  });
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