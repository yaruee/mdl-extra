// ==UserScript==
// @name         MDL Extra v1.1.0
// @namespace    https://github.com/yaruee/mdl-extra
// @version      1.1.0
// @description  Adds extra functions to MyDramaList: quick +/– episode buttons (profile-only), shortcut panel, and floating search window.
// @author       yaruee
// @icon          https://github.com/yaruee/mdl-extra/blob/main/images/icon.png?raw=true
// @match        https://mydramalist.com/*
// @updateURL    https://raw.githubusercontent.com/yaruee/mdl-extra/main/mdl-extra.user.js
// @downloadURL  https://raw.githubusercontent.com/yaruee/mdl-extra/main/mdl-extra.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  // =========================
  // 🔹 Config + Settings Panel
  // =========================
  let username = GM_getValue('username', '');
  let shortcuts = GM_getValue('shortcuts', {
    profile: 'p',
    dramalist: 'd',
    lists: 'l',
    focusSearch: 's'
  });

  function openSettingsPanel() {
    const overlayPanel = document.createElement('div');
    overlayPanel.style.position = 'fixed';
    overlayPanel.style.top = 0;
    overlayPanel.style.left = 0;
    overlayPanel.style.width = '100%';
    overlayPanel.style.height = '100%';
    overlayPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlayPanel.style.display = 'flex';
    overlayPanel.style.justifyContent = 'center';
    overlayPanel.style.alignItems = 'center';
    overlayPanel.style.zIndex = 9999;

    const panel = document.createElement('div');
    panel.style.backgroundColor = '#1e1e1e';
    panel.style.color = '#f1f1f1';
    panel.style.padding = '20px';
    panel.style.borderRadius = '12px';
    panel.style.width = '350px';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.innerHTML = `
      <h2 style="text-align:center; margin-top:0;">MDL Extra Settings</h2>
      <label>Username:<br><input id="mdl-extra-username" type="text" value="${username}" style="width:100%; padding:5px; border-radius:5px; border:1px solid #555; background:#2b2b2b; color:#f1f1f1"></label><br><br>
      <label>Profile key:<br><input id="mdl-extra-profile" type="text" value="${shortcuts.profile}" maxlength="1" style="width:100%; padding:5px; border-radius:5px; border:1px solid #555; background:#2b2b2b; color:#f1f1f1"></label><br><br>
      <label>Dramalist key:<br><input id="mdl-extra-dramalist" type="text" value="${shortcuts.dramalist}" maxlength="1" style="width:100%; padding:5px; border-radius:5px; border:1px solid #555; background:#2b2b2b; color:#f1f1f1"></label><br><br>
      <label>Lists key:<br><input id="mdl-extra-lists" type="text" value="${shortcuts.lists}" maxlength="1" style="width:100%; padding:5px; border-radius:5px; border:1px solid #555; background:#2b2b2b; color:#f1f1f1"></label><br><br>
      <label>Open Search Window key:<br><input id="mdl-extra-focus" type="text" value="${shortcuts.focusSearch}" maxlength="1" style="width:100%; padding:5px; border-radius:5px; border:1px solid #555; background:#2b2b2b; color:#f1f1f1"></label><br><br>
      <button id="mdl-extra-save" style="width:100%; padding:10px; background-color:#007bff; color:#fff; border:none; border-radius:5px; font-size:16px;">Save</button>
    `;

    overlayPanel.appendChild(panel);
    document.body.appendChild(overlayPanel);

    document.getElementById('mdl-extra-save').addEventListener('click', () => {
      username = document.getElementById('mdl-extra-username').value.trim();
      shortcuts.profile = document.getElementById('mdl-extra-profile').value.toLowerCase();
      shortcuts.dramalist = document.getElementById('mdl-extra-dramalist').value.toLowerCase();
      shortcuts.lists = document.getElementById('mdl-extra-lists').value.toLowerCase();
      shortcuts.focusSearch = document.getElementById('mdl-extra-focus').value.toLowerCase();

      GM_setValue('username', username);
      GM_setValue('shortcuts', shortcuts);

      alert('Settings saved!');
      document.body.removeChild(overlayPanel);
    });

    overlayPanel.addEventListener('click', (e) => {
      if (e.target === overlayPanel) document.body.removeChild(overlayPanel);
    });
  }

  GM_registerMenuCommand('MDL Extra Settings', openSettingsPanel);

  // =========================
  // 🔹 Quick +/– Episode Buttons (Profile Only)
  // =========================
  if (window.location.pathname.startsWith('/profile/')) {
    const profileUser = window.location.pathname.split('/')[2];
    if (username && profileUser.toLowerCase() === username.toLowerCase()) {
      const style = document.createElement('style');
      style.textContent = `
        .episode-quick-buttons {
          display:inline-flex;
          gap:6px;
          margin-left:6px;
          vertical-align:middle;
        }
        .mdl-quick-btn {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:22px;
          height:22px;
          font-size:13px;
          font-weight:700;
          border-radius:8px;
          cursor:pointer;
          transition:background .15s ease,transform .05s ease;
          user-select:none;
          border:1px solid;
        }
        .mdl-quick-btn:active { transform:translateY(1px); }
      `;
      document.head.appendChild(style);

      function isDarkMode() {
        const toggle = document.querySelector('.btn-dark-mode .btn-success');
        if (toggle && toggle.textContent.trim().toUpperCase() === 'ON') return true;
        return document.body.classList.contains('dark') || document.body.dataset.theme === 'dark';
      }

      function applyThemeStyles() {
        const dark = isDarkMode();
        document.querySelectorAll('.mdl-quick-btn').forEach(btn => {
          if (dark) {
            btn.style.background = '#2b2b2b';
            btn.style.color = '#f0f0f0';
            btn.style.borderColor = '#444';
          } else {
            btn.style.background = '#f5f5f5';
            btn.style.color = '#222';
            btn.style.borderColor = '#ccc';
          }
        });
      }

      function waitFor(selector, root = document, timeout = 6000) {
        return new Promise((resolve, reject) => {
          const found = root.querySelector(selector);
          if (found) return resolve(found);
          const obs = new MutationObserver(() => {
            const el = root.querySelector(selector);
            if (el) { obs.disconnect(); resolve(el); }
          });
          obs.observe(root, { childList: true, subtree: true });
          setTimeout(() => { obs.disconnect(); reject(new Error('Timeout: ' + selector)); }, timeout);
        });
      }

      function createButtons() {
        const wrap = document.createElement('span');
        wrap.className = 'episode-quick-buttons';

        const btnPlus = document.createElement('button');
        btnPlus.className = 'mdl-quick-btn';
        btnPlus.type = 'button';
        btnPlus.textContent = '+';

        const btnMinus = document.createElement('button');
        btnMinus.className = 'mdl-quick-btn';
        btnMinus.type = 'button';
        btnMinus.textContent = '–';

        wrap.appendChild(btnPlus);
        wrap.appendChild(btnMinus);
        applyThemeStyles();

        return { wrap, btnPlus, btnMinus };
      }

      function addButtons(activityEl, editBtn) {
        if (!/Currently\s*watching/i.test(activityEl.textContent || '')) return;
        if (activityEl.parentNode.querySelector('.episode-quick-buttons')) return;

        activityEl.style.display = 'inline-block';
        activityEl.style.verticalAlign = 'middle';

        const { wrap, btnPlus, btnMinus } = createButtons();
        activityEl.parentNode.insertBefore(wrap, activityEl.nextSibling);

        const updateEpisodes = async (delta) => {
          editBtn.click();
          try {
            const input = await waitFor('.el-input__inner');
            const current = parseInt(input.value || '0', 10) || 0;
            const next = Math.max(0, current + delta);
            input.value = next;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            const submitBtn = await waitFor('.el-button.btn.btn-success.el-button--primary');
            submitBtn.click();
            setTimeout(() => {
              const closeBtn = document.querySelector('.el-dialog__headerbtn');
              if (closeBtn) closeBtn.click();
              else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, which: 27 }));
            }, 600);
          } catch (e) { console.error('[MDL Extra]', e); }
        };

        btnPlus.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); updateEpisodes(1); });
        btnMinus.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); updateEpisodes(-1); });
      }

      function processNewNode(node) {
        if (node.nodeType !== 1) return;
        const editBtn = node.querySelector?.('.btn.simple.btn-manage-list');
        const activityEl = node.querySelector?.('div.activity');
        if (editBtn && activityEl) addButtons(activityEl, editBtn);
        node.querySelectorAll?.('.list-item, .box, tr, li, .card, .clearfix').forEach(row => {
          const edit = row.querySelector('.btn.simple.btn-manage-list');
          const act = row.querySelector('div.activity');
          if (edit && act) addButtons(act, edit);
        });
      }

      document.querySelectorAll('.list-item, .box, tr, li, .card, .clearfix').forEach(row => {
        const editBtn = row.querySelector('.btn.simple.btn-manage-list');
        const activityEl = row.querySelector('div.activity');
        if (editBtn && activityEl) addButtons(activityEl, editBtn);
      });

      const mo = new MutationObserver(mutations => {
        mutations.forEach(m => m.addedNodes.forEach(processNewNode));
        applyThemeStyles();
      });
      mo.observe(document.body, { childList: true, subtree: true });

      const themeToggle = document.querySelector('.btn-dark-mode');
      if (themeToggle) {
        const themeObs = new MutationObserver(applyThemeStyles);
        themeObs.observe(themeToggle, { childList: true, subtree: true });
      }

      window.addEventListener('load', () => setTimeout(applyThemeStyles, 300));
    }
  }

  // =========================
  // 🔹 Floating Search + Keyboard Shortcuts
  // =========================
  const overlaySearch = document.createElement('div');
  overlaySearch.style.position = "fixed";
  overlaySearch.style.top = "0";
  overlaySearch.style.left = "0";
  overlaySearch.style.width = "100%";
  overlaySearch.style.height = "100%";
  overlaySearch.style.background = "rgba(0,0,0,0.6)";
  overlaySearch.style.zIndex = "99998";
  overlaySearch.style.display = "none";
  document.body.appendChild(overlaySearch);

  const floatDiv = document.createElement('div');
  floatDiv.style.position = 'fixed';
  floatDiv.style.top = '33%';
  floatDiv.style.left = '50%';
  floatDiv.style.transform = 'translateX(-50%)';
  floatDiv.style.zIndex = '99999';
  floatDiv.style.background = '#1e1e1e';
  floatDiv.style.padding = '10px';
  floatDiv.style.borderRadius = '10px';
  floatDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
  floatDiv.style.width = '500px';
  floatDiv.style.display = 'none';

  const input = document.createElement('input');
  input.type = "text";
  input.placeholder = "Search dramas...";
  input.style.width = "100%";
  input.style.padding = "10px";
  input.style.border = "1px solid #444";
  input.style.borderRadius = "6px";
  input.style.background = "#2a2a2a";
  input.style.color = "#eee";
  input.style.fontSize = "16px";

  const suggestionBox = document.createElement('div');
  suggestionBox.style.position = "absolute";
  suggestionBox.style.top = "60px";
  suggestionBox.style.left = "0";
  suggestionBox.style.width = "100%";
  suggestionBox.style.background = "#2a2a2a";
  suggestionBox.style.border = "1px solid #444";
  suggestionBox.style.borderRadius = "6px";
  suggestionBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
  suggestionBox.style.maxHeight = "300px";
  suggestionBox.style.overflowY = "auto";
  suggestionBox.style.display = "none";
  suggestionBox.style.color = "#ddd";

  floatDiv.appendChild(input);
  floatDiv.appendChild(suggestionBox);
  document.body.appendChild(floatDiv);

  async function fetchSuggestions(query) {
    if (!query.trim()) {
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
      return;
    }
    try {
      const res = await fetch(`https://mydramalist.com/search?q=${encodeURIComponent(query)}&type=drama`);
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const items = doc.querySelectorAll(".box .title a");

      suggestionBox.innerHTML = "";
      let hasResults = false;

      items.forEach(a => {
        const title = a.textContent.trim();
        if (!title) return;
        hasResults = true;
        const div = document.createElement("div");
        div.textContent = title;
        div.style.padding = "8px";
        div.style.cursor = "pointer";
        div.style.borderBottom = "1px solid #333";
        div.addEventListener("mouseover", () => div.style.background = "#3a3a3a");
        div.addEventListener("mouseout", () => div.style.background = "#2a2a2a");
        div.addEventListener("click", () => window.location.href = a.href);
        suggestionBox.appendChild(div);
      });
      suggestionBox.style.display = hasResults ? "block" : "none";
    } catch (err) { console.error("Suggestion fetch failed", err); }
  }

  function openSearch() {
    overlaySearch.style.display = "block";
    floatDiv.style.display = "block";
    input.focus();
    input.value = "";
    suggestionBox.innerHTML = "";
    suggestionBox.style.display = "none";
  }

  function closeSearch() {
    overlaySearch.style.display = "none";
    floatDiv.style.display = "none";
    suggestionBox.style.display = "none";
    input.value = "";
  }

  overlaySearch.addEventListener("click", closeSearch);
  input.addEventListener("input", () => fetchSuggestions(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = suggestionBox.querySelector("div");
      if (first) first.click();
      else window.location.href = `https://mydramalist.com/search?q=${encodeURIComponent(input.value)}&type=drama`;
    }
    if (e.key === "Escape") closeSearch();
  });

  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (!username) return;
    const key = e.key.toLowerCase();
    if (key === shortcuts.profile) {
      e.preventDefault();
      window.location.href = `https://mydramalist.com/profile/${username}`;
    } else if (key === shortcuts.dramalist) {
      e.preventDefault();
      window.location.href = `https://mydramalist.com/dramalist/${username}`;
    } else if (key === shortcuts.lists) {
      e.preventDefault();
      window.location.href = `https://mydramalist.com/profile/${username}/lists`;
    } else if (key === shortcuts.focusSearch) {
      e.preventDefault();
      openSearch();
    }
  });

})();
