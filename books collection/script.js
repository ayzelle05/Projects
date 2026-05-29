/* ============================================================
   MY READING SPACE — APP.JS
   Full SPA logic: navigation, books, notes, documents, favorites
============================================================ */

/* ── State ─────────────────────────────────────────────── */
let state = {
  books:     [],
  notes:     [],
  documents: [],
  darkMode:  false,
  activeNote: null,
  activeDoc:  null,
};

/* ── Persistence ────────────────────────────────────────── */
function loadState() {
  const saved = localStorage.getItem('readingSpaceState');
  if (saved) {
    try { Object.assign(state, JSON.parse(saved)); } catch {}
  }
  // Seed demo books if empty
  if (!state.books.length) {
    state.books = [
      { id: uid(), title: 'The Alchemist',              author: 'Paulo Coelho',           genre: 'Fiction, Adventure', pages: 208, pagesRead: 145, status: 'reading',   color: '#8b6f6f', emoji: '🌅', favorite: true,  desc: 'A philosophical novel about following your dreams.',       added: '2024-05-12' },
      { id: uid(), title: 'Atomic Habits',               author: 'James Clear',            genre: 'Self-Help',          pages: 320, pagesRead: 320, status: 'completed', color: '#5f7d8a', emoji: '⚡', favorite: true,  desc: 'An easy guide to building good habits.',                  added: '2024-05-10' },
      { id: uid(), title: 'It Ends with Us',             author: 'Colleen Hoover',         genre: 'Romance',            pages: 384, pagesRead: 200, status: 'reading',   color: '#9b7ea6', emoji: '🌸', favorite: false, desc: 'A raw, honest portrayal of love and difficult choices.',   added: '2024-05-08' },
      { id: uid(), title: 'The Midnight Library',        author: 'Matt Haig',              genre: 'Fiction',            pages: 304, pagesRead: 304, status: 'completed', color: '#4a6b7a', emoji: '🌙', favorite: false, desc: 'A library between life and death.',                        added: '2024-05-06' },
      { id: uid(), title: 'Verity',                      author: 'Colleen Hoover',         genre: 'Thriller',           pages: 336, pagesRead: 336, status: 'completed', color: '#6b7a4a', emoji: '🔮', favorite: false, desc: 'A dark and twisting thriller.',                            added: '2024-05-04' },
      { id: uid(), title: 'Daisy Jones & The Six',       author: 'Taylor Jenkins Reid',    genre: 'Historical Fiction', pages: 368, pagesRead: 0,   status: 'wishlist',  color: '#8a7a4a', emoji: '🎸', favorite: false, desc: 'The rise and fall of an iconic rock band.',               added: '2024-05-02' },
      { id: uid(), title: 'Rich Dad Poor Dad',           author: 'Robert T. Kiyosaki',     genre: 'Finance',            pages: 336, pagesRead: 100, status: 'reading',   color: '#b08050', emoji: '💰', favorite: false, desc: 'What the rich teach their kids about money.',              added: '2024-04-30' },
      { id: uid(), title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', genre: 'Historical Fiction', pages: 400, pagesRead: 400, status: 'completed', color: '#9a5a5a', emoji: '🌹', favorite: true, desc: 'A reclusive Hollywood icon confesses all.', added: '2024-04-28' },
    ];
    state.notes = [
      { id: uid(), title: 'Morning Reading Reflection', content: "There's something magical about starting the day with a few pages of a book. It sets the tone for clarity, peace, and inspiration. Today I read a beautiful line that reminded me to enjoy the little things in life.", date: '2024-05-20', bookId: null },
      { id: uid(), title: 'Books That Changed My Life',  content: 'Atomic Habits completely rewired how I think about daily routines. The Alchemist taught me to listen to my heart. These books are sacred to me.', date: '2024-05-18', bookId: null },
      { id: uid(), title: 'Favorite Quotes',             content: '"When you want something, all the universe conspires in helping you to achieve it." — The Alchemist\n\n"The journey is what teaches you a lot about your destination." — Paulo Coelho', date: '2024-05-15', bookId: null },
    ];
    state.documents = [
      { id: uid(), title: 'Chapter Summaries', content: '<h2>Chapter Summaries</h2><p>Use this document to summarize chapters as you read.</p>', date: '2024-05-20', pages: 12 },
      { id: uid(), title: 'Essay Ideas',       content: '<h2>Essay Ideas</h2><p>Brainstorm essay topics inspired by your reading.</p>',          date: '2024-05-18', pages: 8 },
      { id: uid(), title: 'Reading Journal 2024', content: '<h2>Reading Journal 2024</h2><p>A personal log of thoughts, feelings, and insights from each book read this year.</p>', date: '2024-05-16', pages: 15 },
    ];
    saveState();
  }
}

function saveState() {
  localStorage.setItem('readingSpaceState', JSON.stringify(state));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ── Navigation ─────────────────────────────────────────── */
function navigate(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const sec = document.getElementById('section-' + sectionId);
  if (sec) sec.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (navItem) navItem.classList.add('active');

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');

  // Render section
  const renderMap = {
    'home':       renderHome,
    'library':    renderLibrary,
    'notes':      renderNotes,
    'documents':  renderDocuments,
    'favorites':  renderFavorites,
  };
  if (renderMap[sectionId]) renderMap[sectionId]();
}

/* ── Dark Mode ──────────────────────────────────────────── */
function applyDarkMode() {
  document.body.classList.toggle('dark-mode', state.darkMode);
  document.getElementById('darkIcon').textContent = state.darkMode ? '☀️' : '🌙';

  const st = document.getElementById('settingsDarkToggle');
  if (st) st.classList.toggle('on', state.darkMode);
}

function toggleDark() {
  state.darkMode = !state.darkMode;
  applyDarkMode();
  saveState();
}

/* ── HOME ───────────────────────────────────────────────── */
function renderHome() {
  const books     = state.books;
  const completed = books.filter(b => b.status === 'completed').length;
  const reading   = books.filter(b => b.status === 'reading').length;

  document.getElementById('statTotal').textContent     = books.length;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statReading').textContent   = reading;
  document.getElementById('statNotes').textContent     = state.notes.length;

  const grid = document.getElementById('homeRecentBooks');
  const recent = [...books].reverse().slice(0, 4);
  grid.innerHTML = recent.map(bookCardHTML).join('');
  attachBookCardEvents(grid);
}

/* ── LIBRARY ────────────────────────────────────────────── */
let libraryFilter = 'all';
let librarySearch = '';

function renderLibrary() {
  const grid = document.getElementById('libraryGrid');
  const empty = document.getElementById('libraryEmpty');

  let filtered = state.books.filter(b => {
    const matchFilter = libraryFilter === 'all' || b.status === libraryFilter;
    const q = librarySearch.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.genre || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (filtered.length) {
    grid.innerHTML = filtered.map(bookCardHTML).join('');
    grid.classList.remove('hidden');
    empty.classList.add('hidden');
    attachBookCardEvents(grid);
  } else {
    grid.innerHTML = '';
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
  }
}

function bookCardHTML(book) {
  const pct = book.pages ? Math.round((book.pagesRead / book.pages) * 100) : 0;
  const statusLabel = { reading: 'Currently Reading', completed: 'Completed', wishlist: 'Wishlist' };
  const statusClass = { reading: 'status-reading', completed: 'status-completed', wishlist: 'status-wishlist' };
  return `
    <div class="book-card" data-id="${book.id}">
      <div class="book-cover" style="background:${book.color}20; position:relative;">
        <div class="book-cover-shine"></div>
        <span style="font-size:3rem">${book.emoji || '📖'}</span>
      </div>
      <div class="book-info">
        <button class="book-fav-star" data-fav="${book.id}" title="Favorite">${book.favorite ? '⭐' : '☆'}</button>
        <div class="book-title-card">${esc(book.title)}</div>
        <div class="book-author-card">${esc(book.author)}</div>
        <span class="status-badge ${statusClass[book.status]}">${statusLabel[book.status]}</span>
      </div>
    </div>`;
}

function attachBookCardEvents(container) {
  container.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.book-fav-star')) return;
      openBookDetail(card.dataset.id);
    });
  });
  container.querySelectorAll('.book-fav-star').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.fav);
      btn.textContent = state.books.find(b => b.id === btn.dataset.fav)?.favorite ? '⭐' : '☆';
      renderHome();
    });
  });
}

function toggleFavorite(id) {
  const book = state.books.find(b => b.id === id);
  if (book) { book.favorite = !book.favorite; saveState(); }
}

/* ── BOOK DETAIL ────────────────────────────────────────── */
function openBookDetail(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;
  navigate('book-detail');

  const pct = book.pages ? Math.round((book.pagesRead / book.pages) * 100) : 0;
  const statusLabel = { reading: 'Currently Reading', completed: 'Completed', wishlist: 'Wishlist' };
  const bookNotes = state.notes.filter(n => n.bookId === id);

  const html = `
    <div class="detail-cover" style="background:${book.color}22;">
      <span style="font-size:5rem">${book.emoji || '📖'}</span>
    </div>
    <div class="detail-info">
      <div>
        <div class="detail-title">${esc(book.title)}</div>
        <div class="detail-author">by ${esc(book.author)}</div>
      </div>
      <div class="detail-meta">
        <div class="meta-item"><span class="meta-label">Genre</span><span class="meta-val">${esc(book.genre || '—')}</span></div>
        <div class="meta-item"><span class="meta-label">Status</span><span class="meta-val">${statusLabel[book.status]}</span></div>
        <div class="meta-item"><span class="meta-label">Pages</span><span class="meta-val">${book.pagesRead || 0} / ${book.pages || '?'}</span></div>
        <div class="meta-item"><span class="meta-label">Added</span><span class="meta-val">${book.added || '—'}</span></div>
      </div>
      ${book.status === 'reading' ? `
      <div class="progress-section">
        <div class="progress-label">Reading Progress — ${pct}%</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>` : ''}
      ${book.desc ? `<p style="color:var(--text2);font-size:0.88rem;line-height:1.7">${esc(book.desc)}</p>` : ''}
      <div class="detail-actions">
        <button class="btn-primary" onclick="markComplete('${id}')">✅ Mark Complete</button>
        <button class="btn-outline" onclick="toggleFavoriteDetail('${id}')" id="favDetailBtn">
          ${book.favorite ? '⭐ Favorited' : '☆ Add to Favorites'}
        </button>
        <button class="btn-ghost" onclick="addNoteForBook('${id}')">📝 Add Note</button>
        <button class="btn-ghost" style="color:var(--rose);" onclick="deleteBook('${id}')">🗑 Delete</button>
      </div>
      <div class="detail-notes-section">
        <h3>Notes for this book</h3>
        ${bookNotes.length
          ? bookNotes.map(n => `<div class="detail-note-item"><strong>${esc(n.title)}</strong>${esc(n.content).slice(0,200)}${n.content.length > 200 ? '…' : ''}</div>`).join('')
          : '<p style="color:var(--text3);font-size:0.85rem">No notes yet. Add one above!</p>'}
      </div>
    </div>`;

  document.getElementById('detailLayout').innerHTML = html;
}

function markComplete(id) {
  const book = state.books.find(b => b.id === id);
  if (book) { book.status = 'completed'; book.pagesRead = book.pages; saveState(); openBookDetail(id); }
}

function toggleFavoriteDetail(id) {
  toggleFavorite(id);
  openBookDetail(id);
}

function deleteBook(id) {
  if (!confirm('Delete this book from your library?')) return;
  state.books = state.books.filter(b => b.id !== id);
  saveState();
  navigate('library');
}

function addNoteForBook(bookId) {
  const book = state.books.find(b => b.id === bookId);
  createNote(`Note on ${book?.title || 'Book'}`, bookId);
  navigate('notes');
}

/* ── ADD BOOK ───────────────────────────────────────────── */
function initAddBook() {
  const colorInput = document.getElementById('coverColor');
  const emojiInput = document.getElementById('coverEmoji');
  const preview    = document.getElementById('coverPreview');

  function updatePreview() {
    preview.style.background = colorInput.value + '33';
    preview.innerHTML = `<span style="font-size:3rem">${emojiInput.value || '📖'}</span>`;
  }

  colorInput.addEventListener('input', updatePreview);
  emojiInput.addEventListener('input', updatePreview);

  document.getElementById('addBookForm').addEventListener('submit', e => {
    e.preventDefault();
    const book = {
      id:        uid(),
      title:     document.getElementById('bookTitle').value.trim(),
      author:    document.getElementById('bookAuthor').value.trim(),
      genre:     document.getElementById('bookGenre').value.trim(),
      pages:     parseInt(document.getElementById('bookPages').value) || 0,
      pagesRead: parseInt(document.getElementById('bookPagesRead').value) || 0,
      status:    document.getElementById('bookStatus').value,
      color:     colorInput.value,
      emoji:     emojiInput.value || '📖',
      desc:      document.getElementById('bookDesc').value.trim(),
      favorite:  false,
      added:     new Date().toISOString().slice(0, 10),
    };
    state.books.unshift(book);
    saveState();
    e.target.reset();
    updatePreview();
    navigate('library');
  });
}

/* ── NOTES ──────────────────────────────────────────────── */
function renderNotes() {
  const list = document.getElementById('notesList');
  if (!state.notes.length) {
    list.innerHTML = '<div style="padding:24px;color:var(--text3);font-size:0.85rem;text-align:center">No notes yet. Create one!</div>';
    return;
  }
  list.innerHTML = state.notes.map(n => `
    <div class="note-list-item ${state.activeNote === n.id ? 'active' : ''}" data-note="${n.id}">
      <div class="note-list-title">${esc(n.title)}</div>
      <div class="note-list-date">${n.date}</div>
      <div class="note-list-actions">
        <button class="icon-btn" data-del-note="${n.id}" title="Delete">🗑️</button>
      </div>
    </div>`).join('');

  list.querySelectorAll('.note-list-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('[data-del-note]')) return;
      openNote(item.dataset.note);
    });
  });

  list.querySelectorAll('[data-del-note]').forEach(btn => {
    btn.addEventListener('click', () => deleteNote(btn.dataset.delNote));
  });

  if (state.activeNote) openNote(state.activeNote);
}

function openNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  state.activeNote = id;

  const editor = document.getElementById('notesEditor');
  editor.innerHTML = `
    <input class="note-editor-title" id="noteTitle" value="${esc(note.title)}" placeholder="Note title…"/>
    <div class="note-editor-date">${note.date}</div>
    <textarea class="note-editor-body" id="noteBody" placeholder="Start writing…">${esc(note.content)}</textarea>
    <div class="note-editor-actions">
      <button class="btn-primary btn-sm" id="saveNoteBtn">Save Note</button>
      <button class="btn-ghost" onclick="deleteNote('${id}')">Delete</button>
    </div>`;

  document.getElementById('saveNoteBtn').addEventListener('click', () => {
    note.title   = document.getElementById('noteTitle').value.trim() || 'Untitled';
    note.content = document.getElementById('noteBody').value;
    note.date    = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    saveState();
    renderNotes();
  });

  // Autosave on type
  let autoTimer;
  ['noteTitle','noteBody'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => {
        note.title   = document.getElementById('noteTitle')?.value.trim() || 'Untitled';
        note.content = document.getElementById('noteBody')?.value || '';
        saveState();
      }, 1200);
    });
  });

  // Highlight active in list
  document.querySelectorAll('.note-list-item').forEach(el => el.classList.remove('active'));
  const activeEl = document.querySelector(`.note-list-item[data-note="${id}"]`);
  if (activeEl) activeEl.classList.add('active');
}

function createNote(title = 'Untitled Note', bookId = null) {
  const note = {
    id:      uid(),
    title:   title,
    content: '',
    date:    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    bookId,
  };
  state.notes.unshift(note);
  state.activeNote = note.id;
  saveState();
  renderNotes();
}

function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  state.notes = state.notes.filter(n => n.id !== id);
  if (state.activeNote === id) {
    state.activeNote = null;
    document.getElementById('notesEditor').innerHTML = `
      <div class="editor-placeholder">
        <div class="editor-ph-icon">✏️</div>
        <p>Select a note to edit, or create a new one.</p>
      </div>`;
  }
  saveState();
  renderNotes();
}

/* ── DOCUMENTS ──────────────────────────────────────────── */
function renderDocuments() {
  const grid   = document.getElementById('docsGrid');
  const editor = document.getElementById('docsEditor');
  const layout = document.getElementById('docsLayout');

  editor.classList.add('hidden');
  grid.parentElement.style.display = '';

  if (!state.documents.length) {
    grid.innerHTML = '<div style="color:var(--text3);font-size:0.85rem;padding:20px">No documents yet. Create one!</div>';
    return;
  }

  grid.innerHTML = state.documents.map(doc => `
    <div class="doc-card" data-doc="${doc.id}">
      <div class="doc-card-icon">📄</div>
      <div class="doc-card-title">${esc(doc.title)}</div>
      <div class="doc-card-meta">${doc.date} · ${doc.pages || 1} pages</div>
      <div class="doc-card-actions">
        <button class="btn-ghost btn-sm" data-open-doc="${doc.id}">Open</button>
        <button class="icon-btn" data-del-doc="${doc.id}">🗑️</button>
      </div>
    </div>`).join('');

  grid.querySelectorAll('[data-open-doc]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openDoc(btn.dataset.openDoc); });
  });
  grid.querySelectorAll('.doc-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-del-doc]') || e.target.closest('[data-open-doc]')) return;
      openDoc(card.dataset.doc);
    });
  });
  grid.querySelectorAll('[data-del-doc]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteDoc(btn.dataset.delDoc); });
  });
}

function openDoc(id) {
  const doc    = state.documents.find(d => d.id === id);
  if (!doc) return;
  state.activeDoc = id;

  const grid   = document.getElementById('docsGrid');
  const editor = document.getElementById('docsEditor');

  grid.style.display = 'none';
  editor.classList.remove('hidden');

  document.getElementById('docTitleInput').value = doc.title;
  document.getElementById('docBody').innerHTML   = doc.content || '';
  document.getElementById('autosaveLabel').textContent = 'All changes saved';

  // Autosave
  let autoTimer;
  const triggerSave = () => {
    clearTimeout(autoTimer);
    document.getElementById('autosaveLabel').textContent = 'Saving…';
    autoTimer = setTimeout(() => {
      doc.title   = document.getElementById('docTitleInput').value.trim() || 'Untitled';
      doc.content = document.getElementById('docBody').innerHTML;
      doc.date    = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      saveState();
      document.getElementById('autosaveLabel').textContent = 'All changes saved';
    }, 900);
  };

  document.getElementById('docTitleInput').addEventListener('input', triggerSave);
  document.getElementById('docBody').addEventListener('input', triggerSave);
  document.getElementById('saveDocBtn').addEventListener('click', () => {
    doc.title   = document.getElementById('docTitleInput').value.trim() || 'Untitled';
    doc.content = document.getElementById('docBody').innerHTML;
    doc.date    = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    saveState();
    document.getElementById('autosaveLabel').textContent = 'All changes saved';
  });
}

function createDoc() {
  const doc = {
    id:      uid(),
    title:   'Untitled Document',
    content: '',
    date:    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    pages:   1,
  };
  state.documents.unshift(doc);
  saveState();
  renderDocuments();
  openDoc(doc.id);
}

function deleteDoc(id) {
  if (!confirm('Delete this document?')) return;
  state.documents = state.documents.filter(d => d.id !== id);
  saveState();
  renderDocuments();
}

function execFmt(cmd, val) {
  document.getElementById('docBody').focus();
  document.execCommand(cmd, false, val || null);
}

/* ── FAVORITES ──────────────────────────────────────────── */
function renderFavorites() {
  const grid  = document.getElementById('favoritesGrid');
  const empty = document.getElementById('favoritesEmpty');
  const favs  = state.books.filter(b => b.favorite);

  if (favs.length) {
    grid.innerHTML = favs.map(b => `
      <div class="book-card fav-glow" data-id="${b.id}">
        <div class="book-cover" style="background:${b.color}22; position:relative;">
          <div class="book-cover-shine"></div>
          <span style="font-size:3rem">${b.emoji || '📖'}</span>
        </div>
        <div class="book-info">
          <button class="book-fav-star" data-fav="${b.id}">⭐</button>
          <div class="book-title-card">${esc(b.title)}</div>
          <div class="book-author-card">${esc(b.author)}</div>
          <span class="status-badge status-completed">Favorite</span>
        </div>
      </div>`).join('');
    grid.classList.remove('hidden');
    empty.classList.add('hidden');
    attachBookCardEvents(grid);
  } else {
    grid.innerHTML = '';
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
  }
}

/* ── SETTINGS ───────────────────────────────────────────── */
function initSettings() {
  const settingsToggle = document.getElementById('settingsDarkToggle');
  if (settingsToggle) {
    settingsToggle.classList.toggle('on', state.darkMode);
    settingsToggle.addEventListener('click', toggleDark);
  }

  const clearBtn = document.getElementById('clearDataBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('This will delete ALL books, notes, and documents. Are you sure?')) return;
      state.books     = [];
      state.notes     = [];
      state.documents = [];
      saveState();
      navigate('home');
    });
  }
}

/* ── Utility ─────────────────────────────────────────────── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Boot ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  applyDarkMode();

  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigate(item.dataset.section);
    });
  });

  // Dark mode toggle (sidebar)
  document.getElementById('darkToggle').addEventListener('click', toggleDark);

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // Add book form
  initAddBook();

  // New note button
  document.getElementById('newNoteBtn').addEventListener('click', () => createNote());

  // New document button
  document.getElementById('newDocBtn').addEventListener('click', createDoc);

  // Close doc editor button
  document.getElementById('closeDocEditor').addEventListener('click', () => {
    document.getElementById('docsEditor').classList.add('hidden');
    document.getElementById('docsGrid').style.display = '';
  });

  // Library search
  document.getElementById('librarySearch').addEventListener('input', e => {
    librarySearch = e.target.value;
    renderLibrary();
  });

  // Library filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      libraryFilter = tab.dataset.filter;
      renderLibrary();
    });
  });

  // Settings section listener
  document.querySelector('[data-section="settings"]').addEventListener('click', () => {
    setTimeout(initSettings, 50);
  });

  // Intersection observer for fade-in animation on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.style.opacity = '1';
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-card, .book-card').forEach(el => observer.observe(el));

  // Initial render
  navigate('home');
});