const $ = selector => document.querySelector(selector);

const currentUser = {
  username: "your_username",
  avatar: "https://i.pravatar.cc/100?img=47"
};

const users = [
  { username: "sana.xo", avatar: "https://i.pravatar.cc/100?img=5" },
  { username: "travel.diaries", avatar: "https://i.pravatar.cc/100?img=12" },
  { username: "booksandcoffee", avatar: "https://i.pravatar.cc/100?img=44" },
  { username: "aesthetic.diaries", avatar: "https://i.pravatar.cc/100?img=32" },
  { username: "rhea.travels", avatar: "https://i.pravatar.cc/100?img=49" }
];

const starterPosts = [
  {
    id: 1,
    username: "aesthetic.diaries",
    avatar: users[3].avatar,
    image: "pinkflowers.jpg",
    caption: "Pink flowers and little joys 🌸",
    likes: 128,
    liked: false,
    saved: false,
    comments: [{ username: "sana.xo", text: "So pretty! 💗" }]
  },
  {
    id: 2,
    username: "booksandcoffee",
    avatar: users[2].avatar,
    image: "books.jpg",
    caption: "A good book makes any day better ☕📚",
    likes: 86,
    liked: false,
    saved: false,
    comments: []
  },
  {
    id: 3,
    username: "rhea.travels",
    avatar: users[4].avatar,
    image: "nature.jpg",
    caption: "A little escape into nature 🌿",
    likes: 204,
    liked: false,
    saved: false,
    comments: []
  }
];

function load(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

let posts = load("instagram-clone-posts", starterPosts);
let following = load("instagram-clone-following", []);
let activePostId = null;
let selectedPhoto = "";

function persist() {
  try {
    localStorage.setItem("instagram-clone-posts", JSON.stringify(posts));
    localStorage.setItem("instagram-clone-following", JSON.stringify(following));
  } catch {
    alert("Browser storage is full. Try a smaller photo.");
  }
}

function escapeHTML(text = "") {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function renderStories() {
  $("#stories").innerHTML = `
    <button class="story" id="addStory">
      <img src="${currentUser.avatar}" alt="">
      <span>Your story ＋</span>
    </button>
    ${users.map(user => `
      <button class="story" data-story="${user.username}">
        <img src="${user.avatar}" alt="">
        <span>${user.username}</span>
      </button>
    `).join("")}
  `;
}

function renderSuggestions() {
  $("#suggestions").innerHTML = users.map(user => {
    const isFollowing = following.includes(user.username);

    return `
      <div class="suggestion">
        <img src="${user.avatar}" alt="">
        <div>
          <b>${user.username}</b>
          <p>Suggested for you</p>
        </div>
        <button class="${isFollowing ? "following" : ""}"
                data-follow="${user.username}">
          ${isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    `;
  }).join("");
}

function renderPosts() {
  const query = $("#search").value.trim().toLowerCase();

  const filtered = posts.filter(post =>
    `${post.username} ${post.caption}`.toLowerCase().includes(query)
  );

  $("#feed").innerHTML = filtered.length ? filtered.map(post => `
    <article class="post">
      <div class="post-header">
        <img class="avatar" src="${post.avatar}" alt="">
        <div class="user">
          ${escapeHTML(post.username)}
          <small>Suggested post</small>
        </div>
        <button data-more="${post.id}" aria-label="Post options">•••</button>
      </div>

      ${post.image ? `
        <img class="post-image"
             src="${post.image}"
             alt="Photo posted by ${escapeHTML(post.username)}">
      ` : ""}

      <div class="post-actions">
        <button data-like="${post.id}"
                class="${post.liked ? "liked" : ""}"
                aria-label="Like post">
          ${post.liked ? "♥" : "♡"}
        </button>

        <button data-comment="${post.id}" aria-label="Comments">♧</button>

        <button data-share="${post.id}" aria-label="Share post">➤</button>

        <button class="save ${post.saved ? "liked" : ""}"
                data-save="${post.id}"
                aria-label="Save post">
          ${post.saved ? "▣" : "♧"}
        </button>
      </div>

      <div class="post-caption">
        <b>${escapeHTML(post.username)}</b>
        ${escapeHTML(post.caption)}
        <p><b>${post.likes + (post.liked ? 1 : 0)}</b> likes</p>
      </div>

      <button class="post-comments" data-comment="${post.id}">
        ${post.comments.length
          ? `View all ${post.comments.length} comments`
          : "Add a comment..."}
      </button>
    </article>
  `).join("") : `<div class="empty">No posts found.</div>`;
}

function openCreateDialog() {
  $("#postForm").reset();
  $("#preview").style.display = "none";
  $("#preview").removeAttribute("src");
  selectedPhoto = "";
  $("#createDialog").showModal();
}

function renderComments(post) {
  $("#comments").innerHTML = post.comments.length
    ? post.comments.map(comment => `
        <div class="comment">
          <b>${escapeHTML(comment.username)}</b>
          ${escapeHTML(comment.text)}
        </div>
      `).join("")
    : "<p>No comments yet. Start the conversation!</p>";
}

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.id === "openCreate" ||
      button.id === "headerCreate" ||
      button.id === "createPrompt") {
    openCreateDialog();
  }

  if (button.id === "cancelCreate") {
    $("#createDialog").close();
  }

  if (button.id === "cancelComments") {
    $("#commentDialog").close();
  }

  if (button.dataset.like) {
    const post = posts.find(item => item.id == button.dataset.like);
    if (!post) return;

    post.liked = !post.liked;
    persist();
    renderPosts();
  }

  if (button.dataset.save) {
    const post = posts.find(item => item.id == button.dataset.save);
    if (!post) return;

    post.saved = !post.saved;
    persist();
    renderPosts();
  }

  if (button.dataset.comment) {
    activePostId = Number(button.dataset.comment);
    const post = posts.find(item => item.id === activePostId);
    if (!post) return;

    renderComments(post);
    $("#commentDialog").showModal();
  }

  if (button.dataset.follow) {
    const username = button.dataset.follow;

    following = following.includes(username)
      ? following.filter(name => name !== username)
      : [...following, username];

    persist();
    renderSuggestions();
  }

  if (button.dataset.share) {
    const post = posts.find(item => item.id == button.dataset.share);
    if (!post) return;

    const text = `${post.username}: ${post.caption}`;

    if (navigator.share) {
      navigator.share({ title: "Instagram post", text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => alert("Post caption copied!"))
        .catch(() => alert(text));
    } else {
      alert(text);
    }
  }

  if (button.id === "addStory") {
    $("#storyPhoto").click();
  }

  if (button.dataset.story) {
    alert(`Viewing ${button.dataset.story}'s demo story.`);
  }

  if (button.dataset.page) {
    const page = button.dataset.page;

    if (page === "Home") {
      $("#search").value = "";
      renderPosts();
    } else if (page === "Search") {
      $("#search").focus();
    } else if (page === "Profile") {
      $("#search").value = currentUser.username;
      renderPosts();
    } else {
      alert(`${page} is not connected yet.`);
    }
  }

  if (button.dataset.more) {
    alert("Post options are not available in this demo.");
  }
});

$("#photo").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Choose an image smaller than 2 MB for this demo.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    selectedPhoto = reader.result;
    $("#preview").src = selectedPhoto;
    $("#preview").style.display = "block";
  };

  reader.readAsDataURL(file);
});

$("#postForm").addEventListener("submit", event => {
  event.preventDefault();

  const caption = $("#caption").value.trim();

  if (!caption && !selectedPhoto) {
    alert("Choose a photo or write a caption.");
    return;
  }

  posts.unshift({
    id: Date.now(),
    username: currentUser.username,
    avatar: currentUser.avatar,
    image: selectedPhoto,
    caption,
    likes: 0,
    liked: false,
    saved: false,
    comments: []
  });

  persist();
  renderPosts();
  $("#createDialog").close();
});

$("#commentForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = $("#commentText");
  const text = input.value.trim();

  const post = posts.find(item => item.id === activePostId);
  if (!post || !text) return;

  post.comments.push({
    username: currentUser.username,
    text
  });

  input.value = "";
  persist();
  renderComments(post);
  renderPosts();
});

$("#search").addEventListener("input", renderPosts);

$("#storyPhoto").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    alert("Your story photo was selected. Connecting stories to a shared backend is a future step.");
  };
  reader.readAsDataURL(file);
});

$("#seeAll").addEventListener("click", event => {
  event.preventDefault();
  alert("You're viewing all suggested users.");
});

renderStories();
renderSuggestions();
renderPosts();