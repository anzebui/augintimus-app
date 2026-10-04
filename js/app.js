/* =====================================================
   AUGINTIMUS APP - Step 1: screens, tabs and routing
   For now everything is a demo: no real login, no real data.
   ===================================================== */
(function () {
  'use strict';

  var SCREENS = {
    welcome:   document.getElementById('screen-welcome'),
    gyvunai:   document.getElementById('screen-gyvunai'),
    sutapimai: document.getElementById('screen-sutapimai'),
    profilis:  document.getElementById('screen-profilis')
  };
  var TITLES = {
    welcome: 'Augintimus',
    gyvunai: 'Gyvūnai · Augintimus',
    sutapimai: 'Sutapimai · Augintimus',
    profilis: 'Profilis · Augintimus'
  };
  var tabbar = document.getElementById('tabbar');
  var tabs = tabbar.querySelectorAll('.tab');

  /* ---------- "Logged in" flag (demo only) ----------
     Saved in the browser. If the browser blocks storage we remember it in memory. */
  var memoryFlag = false;

  function isSignedIn() {
    try { return localStorage.getItem('augintimus_demo_login') === '1'; }
    catch (e) { return memoryFlag; }
  }
  function setSignedIn(value) {
    memoryFlag = value;
    try {
      if (value) localStorage.setItem('augintimus_demo_login', '1');
      else localStorage.removeItem('augintimus_demo_login');
    } catch (e) { /* ignore */ }
  }

  /* ---------- Router: the part after # in the address decides the screen ---------- */
  function currentName() {
    var name = (location.hash || '').replace(/^#\/?/, '');
    return SCREENS[name] ? name : 'welcome';
  }

  function go(name) {
    if (currentName() === name && location.hash === '#/' + name) { route(); return; }
    location.hash = '#/' + name;   // triggers route() through the hashchange event
  }

  function route() {
    var name = currentName();

    // Not logged in -> only the welcome screen is allowed
    if (!isSignedIn() && name !== 'welcome') name = 'welcome';
    // Already logged in -> skip the welcome screen
    if (isSignedIn() && name === 'welcome') name = 'gyvunai';

    // Keep the address tidy without adding a history entry
    var wanted = '#/' + name;
    if (location.hash !== wanted) history.replaceState(null, '', wanted);

    Object.keys(SCREENS).forEach(function (key) {
      SCREENS[key].hidden = key !== name;
    });
    SCREENS[name].scrollTop = 0;

    var showTabs = name !== 'welcome';
    tabbar.hidden = !showTabs;
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-tab') === name) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });

    document.title = TITLES[name];
  }

  /* ---------- Buttons ---------- */
  document.getElementById('btn-google').addEventListener('click', function () {
    // Later: the real Google sign-in goes here
    setSignedIn(true);
    go('gyvunai');
  });

  document.getElementById('btn-logout').addEventListener('click', function () {
    setSignedIn(false);
    go('welcome');
  });

  window.addEventListener('hashchange', route);
  route();
})();
