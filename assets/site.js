const nav = document.querySelector("nav");
// Decorative cursor dust: no pointer interception, storage, or touch tracking.
const dustMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dustPointer = window.matchMedia("(any-pointer: fine)");
const dustLayer = document.createElement("div");
dustLayer.className = "fairy-dust-layer";
dustLayer.setAttribute("aria-hidden", "true");
document.body.append(dustLayer);
let lastDustTime = 0;
let lastDustPoint = null;
function clearDust() {
  dustLayer.replaceChildren();
  lastDustPoint = null;
}
dustMotion.addEventListener("change", clearDust);
dustPointer.addEventListener("change", clearDust);
document.addEventListener("visibilitychange", clearDust);
document.addEventListener("pointerleave", () => { lastDustPoint = null; });
document.addEventListener("pointermove", (event) => {
  if (dustMotion.matches || !dustPointer.matches || event.pointerType !== "mouse") return;
  const now = performance.now();
  if (now - lastDustTime < 30) return;
  if (lastDustPoint && Math.hypot(event.clientX - lastDustPoint.x, event.clientY - lastDustPoint.y) < 5) return;
  lastDustTime = now;
  lastDustPoint = { x: event.clientX, y: event.clientY };
  for (let i = 0; i < 2 && dustLayer.childElementCount < 64; i++) {
    const dust = document.createElement("span");
    dust.className = "fairy-dust " + (i === 0 ? "fairy-dust-star" : "fairy-dust-dot");
    dust.style.left = `${event.clientX + (Math.random() - 0.5) * 14}px`;
    dust.style.top = `${event.clientY + (Math.random() - 0.5) * 14}px`;
    dust.style.setProperty("--dust-x", `${(Math.random() - 0.5) * 36}px`);
    dust.style.setProperty("--dust-y", `${18 + Math.random() * 24}px`);
    dust.style.setProperty("--dust-turn", `${(Math.random() - 0.5) * 120}deg`);
    dust.style.setProperty("--dust-size", `${i === 0 ? 6 + Math.random() * 5 : 2 + Math.random() * 2}px`);
    dustLayer.append(dust);
    dust.addEventListener("animationend", () => dust.remove(), { once: true });
    // Fallback cleanup when animations are disabled or interrupted.
    setTimeout(() => dust.remove(), 900);
  }
}, { passive: true });
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
    : "Thanks for stopping by. Stay a little while!";
  document.querySelector(".charm").setAttribute("aria-expanded",String(Boolean(note.textContent)));
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

const newspaperPages = [...document.querySelectorAll('.newspaper-page')];
if (newspaperPages.length) {
  const previous = document.querySelector('#newspaper-prev');
  const next = document.querySelector('#newspaper-next');
  const status = document.querySelector('#newspaper-status');
  let page = 0;
  function turnPage(target) {
    if (target < 0 || target >= newspaperPages.length) return;
    const direction = target > page ? 1 : -1;
    newspaperPages[page].hidden = true;
    page = target;
    const current = newspaperPages[page];
    current.hidden = false;
    const cover = newspaperPages[0];
    cover.hidden = false;
    cover.inert = page !== 0;
    cover.setAttribute("aria-hidden", String(page !== 0));
    document.querySelector(".brand-edit").classList.toggle("newspaper-open", page !== 0);
    if (!dustMotion.matches && page !== 0) current.animate([
      { opacity: 0, transform: `perspective(900px) rotateY(${direction * 32}deg)` },
      { opacity: 1, transform: 'perspective(900px) rotateY(0deg)' }
    ], { duration: 420, easing: 'ease-out' });
    previous.disabled = page === 0;
    next.disabled = page === newspaperPages.length - 1;
    status.textContent = `Page ${page + 1} of ${newspaperPages.length}`;
    if (document.activeElement === next && next.disabled) previous.focus();
    if (document.activeElement === previous && previous.disabled) next.focus();
  }
  previous.addEventListener('click', () => turnPage(page - 1));
  next.addEventListener('click', () => turnPage(page + 1));
  document.querySelector('.newspaper-controls').addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      turnPage(page + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
}

const newspaperSheet = document.querySelector('.brand-edit');
if (newspaperSheet) {
  const matchSheetSize = () => {
    const styles = getComputedStyle(newspaperSheet);
    newspaperSheet.style.setProperty('--sheet-width', `${newspaperSheet.offsetWidth}px`);
    newspaperSheet.style.setProperty('--sheet-height', `${newspaperSheet.offsetHeight}px`);
    newspaperSheet.style.setProperty('--sheet-padding-x', styles.paddingLeft);
    newspaperSheet.style.setProperty('--sheet-padding-y', styles.paddingTop);
  };
  new ResizeObserver(matchSheetSize).observe(newspaperSheet);
  matchSheetSize();
}

const journalSheets=[...document.querySelectorAll('.journal-sheet')];
if(journalSheets.length){
  const open=document.querySelector('#journal-open'),close=document.querySelector('#journal-close');
  const showJournal=inside=>{
    journalSheets[0].hidden=inside;journalSheets[1].hidden=!inside;
    open.disabled=inside;close.disabled=!inside;
    document.querySelector('#journal-page-status').textContent=inside?'Guestbook':'Cover';
    const page=journalSheets[inside?1:0];
    if(!dustMotion.matches)page.animate([{transform:'rotateY(-65deg)',opacity:0},{transform:'rotateY(0)',opacity:1}],{duration:550,easing:'ease-out'});
    (inside?close:open).focus();
  };
  open.addEventListener('click',()=>showJournal(true));close.addEventListener('click',()=>showJournal(false));
}

const guestShelf=document.querySelector('#guest-book-shelf');
if(guestShelf){
  const booksById=new Map();let snapshot='',refreshing=false;
  const refreshGuestBooks=()=>{if(refreshing)return;refreshing=true;return fetch('https://averyettefield.github.io/teicheir-site/data/guestbook.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('Guestbook unavailable');return response.json();}).then(data=>{
    const entries=Array.isArray(data.entries)?data.entries:[];const nextSnapshot=JSON.stringify(entries);if(nextSnapshot===snapshot)return;snapshot=nextSnapshot;const activeIds=new Set();const occurrences=new Map();
    document.querySelector('#guest-books-status').textContent=entries.length?`${entries.length} guest book${entries.length===1?'':'s'}. Turn a corner to read.`:'No guest entries yet. Leave the first hello below.';
    entries.forEach((entry,index)=>{
      const fallback=JSON.stringify([entry.name,entry.message]);const occurrence=occurrences.get(fallback)||0;occurrences.set(fallback,occurrence+1);const key=entry.id||fallback+'#'+occurrence;activeIds.add(key);
      if(booksById.has(key)){const existing=booksById.get(key);existing.querySelector('.guest-book-name').textContent=entry.name||'Guest';existing.querySelector('.guest-book-message p').textContent=entry.message||'';guestShelf.append(existing);return;}
      const book=document.createElement('article');book.className='guest-entry-book guest-flip-book';book.setAttribute('aria-label','Guest book from '+(entry.name||'Guest'));
      const cover=document.createElement('div');cover.className='guest-book-cover';
      const number=document.createElement('span');number.className='guest-book-number';number.textContent=`GUEST BOOK ${String(index+1).padStart(2,'0')}`;
      const name=document.createElement('span');name.className='guest-book-name';name.textContent=entry.name||'Guest';
      const hint=document.createElement('span');hint.className='guest-book-hint';hint.textContent='Turn the corner to read';
      cover.append(number,name,hint);
      const pages=document.createElement('div');pages.className='guest-book-message';
      const text=document.createElement('p');text.textContent=entry.message||'';pages.append(text);pages.hidden=true;
      const controls=document.createElement('div');controls.className='guest-page-controls';
      const back=document.createElement('button');back.type='button';back.className='guest-page-prev';back.setAttribute('aria-label','Return to cover of '+(entry.name||'Guest')+"'s book");back.disabled=true;
      const forward=document.createElement('button');forward.type='button';forward.className='guest-page-next';forward.setAttribute('aria-label','Read entry from '+(entry.name||'Guest'));
      const turn=open=>{cover.hidden=open;pages.hidden=!open;back.disabled=!open;forward.disabled=open;book.classList.toggle('guest-book-open',open);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)(open?pages:cover).animate([{opacity:0,transform:'perspective(700px) rotateY('+(open?'-25':'25')+'deg)'},{opacity:1,transform:'rotateY(0deg)'}],{duration:450,easing:'ease-out'});(open?back:forward).focus();};
      forward.addEventListener('click',()=>turn(true));back.addEventListener('click',()=>turn(false));controls.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();turn(event.key==='ArrowRight');}});
      controls.append(back,forward);book.append(cover,pages,controls);guestShelf.append(book);booksById.set(key,book);
    });for(const [key,book] of booksById){if(!activeIds.has(key)){book.remove();booksById.delete(key);}}
  }).catch(()=>{if(!booksById.size)document.querySelector('#guest-books-status').textContent='';}).finally(()=>{refreshing=false;});};
  refreshGuestBooks();setInterval(()=>{if(!document.hidden)refreshGuestBooks();},60000);window.addEventListener('focus',refreshGuestBooks);
}

// Swap outfits only while a mouse pointer is over the avatar image.
const aboutAvatar=document.querySelector('.avatar-hover img');
if(aboutAvatar){
  const original=aboutAvatar.getAttribute('src');
  const originalAlt=aboutAvatar.alt;
  const alternate='https://averyettefield.github.io/teicheir-site/assets/teicheir-about-cutout.png';
  const preload=new Image();preload.src=alternate;
  aboutAvatar.addEventListener('mouseenter',()=>{
    if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    aboutAvatar.src=alternate;
    aboutAvatar.alt='Teicheir in a cat-patterned sweater and dark skirt';
    aboutAvatar.classList.add('alternate-outfit');
  });
  aboutAvatar.addEventListener('mouseleave',()=>{
    aboutAvatar.src=original;aboutAvatar.alt=originalAlt;
    aboutAvatar.classList.remove('alternate-outfit');
  });
}

