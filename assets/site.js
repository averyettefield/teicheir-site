const nav = document.querySelector("nav");
const menu = document.querySelector(".menu");
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
  menu.textContent = open ? "Close menu" : "Menu";
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav?.classList.contains("open")) {
    menu.click();
    menu.focus();
  }
});
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};
document.querySelectorAll("[data-bookmark]").forEach((button) => {
  const key = "teicheir-saved-" + button.dataset.bookmark;
  const paint = () => {
    const saved = storage.get(key) === "yes";
    button.setAttribute("aria-pressed", String(saved));
    button.textContent = saved ? "♥ Saved on this device" : "♡ Save for later";
  };
  paint();
  button.addEventListener("click", () => {
    const saved = storage.get(key) === "yes";
    if (!storage.set(key, saved ? "no" : "yes")) {
      button.textContent = "Saving is unavailable in this browser";
      return;
    }
    paint();
  });
});
document.querySelector(".charm")?.addEventListener("click", () => {
  const note = document.querySelector("#charm-note");
  note.textContent = note.textContent
    ? ""
    : "Thanks for stopping by. Stay a little while ♡";
});
const draft = document.querySelector("#draft-form");
if (draft) {
  const title = draft.querySelector("[name=title]"),
    body = draft.querySelector("[name=body]"),
    status = document.querySelector("#draft-status");
  try {
    const saved = JSON.parse(storage.get("teicheir-draft") || "{}");
    title.value = saved.title || "";
    body.value = saved.body || "";
  } catch {}
  draft.addEventListener("input", () => {
    status.textContent = storage.set(
      "teicheir-draft",
      JSON.stringify({ title: title.value, body: body.value }),
    )
      ? "Draft saved on this device."
      : "Browser storage is unavailable; download to keep your draft.";
  });
  draft.addEventListener("submit", (e) => {
    e.preventDefault();
    const blob = new Blob(
        ["# " + (title.value.trim() || "Untitled") + "\n\n" + body.value],
        { type: "text/markdown" },
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "teicheir-journal-draft.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = "Draft downloaded. It has not been published.";
  });
  document.querySelector("#clear-draft").addEventListener("click", () => {
    title.value = "";
    body.value = "";
    storage.remove("teicheir-draft");
    status.textContent = "Local draft cleared.";
  });
}
const upload = document.querySelector("#photo-upload");
if (upload) {
  const gallery = document.querySelector("#gallery"),
    status = document.querySelector("#photo-status"),
    dialog = document.querySelector("#photo-dialog"),
    image = dialog.querySelector("img");
  let urls = [];
  upload.addEventListener("change", () => {
    urls.forEach(URL.revokeObjectURL);
    urls = [];
    gallery.replaceChildren();
    const files = [...upload.files]
      .filter(
        (f) =>
          ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
            f.type,
          ) && f.size <= 15000000,
      )
      .slice(0, 24);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      urls.push(url);
      const button = document.createElement("button");
      button.className = "photo";
      button.type = "button";
      const thumb = document.createElement("img");
      thumb.src = url;
      thumb.alt = "Preview of " + file.name;
      const caption = document.createElement("span");
      caption.textContent = file.name;
      button.append(thumb, caption);
      button.addEventListener("click", () => {
        image.src = url;
        image.alt = "Preview of " + file.name;
        dialog.showModal();
      });
      gallery.append(button);
    });
    status.textContent = files.length
      ? `${files.length} photo${files.length === 1 ? "" : "s"} previewed locally. Nothing is uploaded or published.`
      : "Choose JPEG, PNG, WebP, or GIF images under 15 MB each (up to 24).";
  });
  dialog
    .querySelector(".close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  document.querySelector("#clear-photos").addEventListener("click", () => {
    urls.forEach(URL.revokeObjectURL);
    urls = [];
    upload.value = "";
    gallery.replaceChildren();
    status.textContent = "Local previews cleared.";
  });
}
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    const category = button.dataset.filter;
    document
      .querySelectorAll("[data-category]")
      .forEach(
        (item) =>
          (item.hidden =
            category !== "all" && item.dataset.category !== category),
      );
    const status = document.querySelector("#filter-status");
    if (status)
      status.textContent =
        category === "all"
          ? "Showing all creator projects."
          : `Showing ${category} projects.`;
  }),
);
