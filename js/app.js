/* =====================================================
   AUGINTIMUS APP - screens, tabs, routing and the demo "account"
   For now everything is a demo: no real login, no real data.
   The onboarding questions live in js/onboarding.js
   ===================================================== */
(function () {
  'use strict';

  var SCREENS = {
    welcome:   document.getElementById('screen-welcome'),
    anketa:    document.getElementById('screen-anketa'),
    gyvunai:   document.getElementById('screen-gyvunai'),
    sutapimai: document.getElementById('screen-sutapimai'),
    profilis:  document.getElementById('screen-profilis')
  };
  var TITLES = {
    welcome: 'Augintimus',
    anketa: 'Anketa · Augintimus',
    gyvunai: 'Gyvūnai · Augintimus',
    sutapimai: 'Sutapimai · Augintimus',
    profilis: 'Profilis · Augintimus'
  };
  var NO_TABBAR = { welcome: true, anketa: true };

  var tabbar = document.getElementById('tabbar');
  var tabs = tabbar.querySelectorAll('.tab');

  /* ---------- Saving things in the browser ----------
     If the browser blocks storage, we remember them in memory instead. */
  var KEY_LOGIN = 'augintimus_demo_login';
  var KEY_PROFILE = 'augintimus_demo_profile';
  var KEY_SWIPES = 'augintimus_demo_swipes';
  var KEY_MATCHES = 'augintimus_demo_matches';
  var memory = {};

  function read(key) {
    try {
      var v = localStorage.getItem(key);
      if (v !== null) return v;
    } catch (e) { /* ignore */ }
    return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
  }
  function write(key, value) {
    if (value === null) delete memory[key]; else memory[key] = value;
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* ignore */ }
  }

  function isSignedIn() { return read(KEY_LOGIN) === '1'; }
  function setSignedIn(on) { write(KEY_LOGIN, on ? '1' : null); }

  function getProfile() {
    var raw = read(KEY_PROFILE);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function saveProfile(profile) { write(KEY_PROFILE, JSON.stringify(profile)); }

  // Swipe history: [{ id: 'rudis', v: 'like' | 'pass' }, ...]
  function getSwipes() {
    try { var list = JSON.parse(read(KEY_SWIPES) || '[]'); return Array.isArray(list) ? list : []; }
    catch (e) { return []; }
  }
  function saveSwipes(list) { write(KEY_SWIPES, JSON.stringify(list)); }

  // Matches = likes the shelter approved: { rudis: { seen: false }, ... }
  function getMatches() {
    try { var m = JSON.parse(read(KEY_MATCHES) || '{}'); return m && typeof m === 'object' ? m : {}; }
    catch (e) { return {}; }
  }
  function saveMatches(m) { write(KEY_MATCHES, JSON.stringify(m)); }

  /* ---------- Shared object, so onboarding.js can talk to this file ---------- */
  var App = window.App = {
    onShow: {},                       // onboarding.js registers App.onShow.anketa
    user: { name: 'Vardenis Pavardenis', email: 'demo@augintimus.lt' },   // fake Google account
    getProfile: getProfile,
    saveProfile: saveProfile,
    getSwipes: getSwipes,
    saveSwipes: saveSwipes,
    getMatches: getMatches,
    saveMatches: saveMatches,
    go: go,
    describeProfile: function () { return []; }   // replaced by onboarding.js
  };

  /* ---------- Router: the part after # in the address decides the screen ---------- */
  var lastName = null;

  function currentName() {
    var name = (location.hash || '').replace(/^#\/?/, '');
    return SCREENS[name] ? name : 'welcome';
  }

  function go(name) {
    if (location.hash === '#/' + name) { route(); return; }
    location.hash = '#/' + name;   // triggers route() through the hashchange event
  }

  function route() {
    var name = currentName();
    var hasProfile = !!getProfile();

    if (!isSignedIn()) {
      name = 'welcome';                                   // not logged in -> only the welcome screen
    } else if (!hasProfile) {
      name = 'anketa';                                    // logged in, questions not answered yet
    } else if (name === 'welcome') {
      name = 'gyvunai';                                   // all done -> straight to the animals
    }

    // Keep the address tidy without adding a history entry
    var wanted = '#/' + name;
    if (location.hash !== wanted) history.replaceState(null, '', wanted);

    Object.keys(SCREENS).forEach(function (key) {
      SCREENS[key].hidden = key !== name;
    });
    SCREENS[name].scrollTop = 0;

    tabbar.hidden = !!NO_TABBAR[name];
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-tab') === name) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });

    document.title = TITLES[name];

    if (name === 'profilis') renderProfile();
    if (name !== lastName && App.onShow[name]) App.onShow[name]();
    lastName = name;
  }

  /* ---------- Profile tab ---------- */
  function renderProfile() {
    var profile = getProfile() || {};
    var name = profile.name || App.user.name;
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-mail').textContent = App.user.email;
    document.getElementById('profile-avatar').textContent = name.charAt(0).toUpperCase();

    var box = document.getElementById('profile-chips');
    box.innerHTML = '';
    App.describeProfile(profile).forEach(function (text) {
      var span = document.createElement('span');
      span.className = 'tag';
      span.textContent = text;
      box.appendChild(span);
    });
  }

  /* ---------- Buttons ---------- */
  document.getElementById('btn-google').addEventListener('click', function () {
    // Later: the real Google sign-in goes here
    setSignedIn(true);
    go('gyvunai');   // the router sends new users to the questions first
  });

  document.getElementById('btn-logout').addEventListener('click', function () {
    setSignedIn(false);
    lastName = null;
    go('welcome');
  });

  document.getElementById('btn-reset').addEventListener('click', function () {
    // Demo helper: forget the login AND the answers, so you can test the first-time flow again
    setSignedIn(false);
    write(KEY_PROFILE, null);
    write(KEY_SWIPES, null);
    write(KEY_MATCHES, null);
    lastName = null;
    go('welcome');
  });

  window.addEventListener('hashchange', route);

  // Wait until onboarding.js has also loaded before showing the first screen
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route);
  else route();
})();
