/* =====================================================
   DISCOVER - the swipeable animal cards, the details sheet,
   and the list of liked animals on the "Sutapimai" tab.
   Data comes from js/animals.js (fake for now).
   ===================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var deck = $('a-deck');
  var emptyBox = $('a-empty');
  var hint = $('a-hint');
  var actions = $('a-actions');
  var undoBtn = $('a-undo');
  var sheet = $('a-sheet');

  var canUndo = false;     // only the very last swipe can be taken back
  var busy = false;        // true while a card is flying away
  var sheetAnimal = null;  // animal shown in the details sheet

  var THRESHOLD = 90;      // how far (px) a card must be dragged to count as a swipe

  /* ---------- Helpers ---------- */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function byId(id) {
    for (var i = 0; i < window.ANIMALS.length; i++) if (window.ANIMALS[i].id === id) return window.ANIMALS[i];
    return null;
  }
  function photoUrl(file) { return 'img/animals/' + file; }

  // Animals the person has not decided on yet, filtered by what they said they like
  function queue() {
    var profile = App.getProfile() || {};
    var want = profile.animals && profile.animals.length ? profile.animals : null;
    var done = {};
    App.getSwipes().forEach(function (s) { done[s.id] = true; });
    return window.ANIMALS.filter(function (a) {
      var kind = a.type === 'cat' ? 'cats' : 'dogs';
      return !done[a.id] && (!want || want.indexOf(kind) !== -1);
    });
  }

  // Big picture area: colored background + emoji, with the real photo on top if it exists
  function buildMedia(animal, className, photoIndex) {
    var media = el('div', className);
    media.style.background = animal.color;
    media.appendChild(el('span', 'a-emoji', animal.emoji));
    var file = animal.photos && animal.photos[photoIndex || 0];
    if (file) {
      var img = new Image();
      img.className = 'a-img';
      img.alt = animal.name;
      img.draggable = false;
      img.onload = function () { media.classList.add('has-photo'); };
      img.onerror = function () { img.remove(); };
      img.src = photoUrl(file);
      media.appendChild(img);
    }
    return media;
  }

  /* ---------- Cards ---------- */
  function buildCard(animal) {
    var card = el('article', 'a-card');
    card.setAttribute('data-id', animal.id);
    card.appendChild(buildMedia(animal, 'a-media', 0));

    var yes = el('div', 'a-stamp a-stamp-yes', 'TINKA');
    var no = el('div', 'a-stamp a-stamp-no', 'NE');
    card.appendChild(yes);
    card.appendChild(no);

    var info = el('div', 'a-info');
    var title = el('h3', 'a-name', animal.name);
    title.appendChild(el('span', 'a-age', animal.age));
    info.appendChild(title);
    info.appendChild(el('p', 'a-where', '📍 ' + animal.city));
    var tags = el('div', 'a-tags');
    animal.tags.slice(0, 2).forEach(function (t) { tags.appendChild(el('span', 'a-tag', t)); });
    info.appendChild(tags);
    card.appendChild(info);

    card._yes = yes;
    card._no = no;
    return card;
  }

  function render() {
    deck.innerHTML = '';
    var list = queue();
    var hasCards = list.length > 0;

    deck.style.display = hasCards ? '' : 'none';
    emptyBox.hidden = hasCards;
    actions.hidden = !hasCards;
    hint.hidden = !hasCards || App.getSwipes().length > 0;

    if (hasCards) {
      // Back card first so the front card sits on top
      if (list[1]) deck.appendChild(buildCard(list[1])).classList.add('is-back');
      var front = buildCard(list[0]);
      front.classList.add('is-front');
      deck.appendChild(front);
      attachDrag(front, list[0]);
    }
    undoBtn.disabled = !canUndo;
  }

  /* ---------- Deciding ---------- */
  function frontCard() { return deck.querySelector('.is-front'); }

  function decide(verdict) {
    var card = frontCard();
    if (!card || busy) return;
    busy = true;
    var id = card.getAttribute('data-id');
    var dir = verdict === 'like' ? 1 : -1;

    card.classList.add('is-leaving');
    card.style.transform = 'translate(' + dir * 520 + 'px, -40px) rotate(' + dir * 26 + 'deg)';
    card._yes.style.opacity = verdict === 'like' ? 1 : 0;
    card._no.style.opacity = verdict === 'like' ? 0 : 1;

    setTimeout(function () {
      var swipes = App.getSwipes();
      swipes.push({ id: id, v: verdict });
      App.saveSwipes(swipes);
      canUndo = true;
      busy = false;
      render();
    }, 260);
  }

  function undo() {
    if (!canUndo || busy) return;
    var swipes = App.getSwipes();
    if (!swipes.length) return;
    var undone = swipes.pop();
    App.saveSwipes(swipes);
    var m = App.getMatches();
    if (undone && m[undone.id]) { delete m[undone.id]; App.saveMatches(m); }
    canUndo = false;
    render();
    var card = frontCard();
    if (card) card.classList.add('is-returning');
  }

  /* ---------- Dragging with finger or mouse ---------- */
  function attachDrag(card, animal) {
    var startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, moved = false, t0 = 0;

    card.addEventListener('pointerdown', function (e) {
      if (busy || e.button > 0) return;
      dragging = true; moved = false; dx = 0; dy = 0;
      startX = e.clientX; startY = e.clientY; t0 = Date.now();
      card.classList.add('is-dragging');
      try { card.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });

    card.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
      card.style.transform = 'translate(' + dx + 'px,' + dy * 0.35 + 'px) rotate(' + dx / 18 + 'deg)';
      var strength = Math.min(Math.abs(dx) / THRESHOLD, 1);
      card._yes.style.opacity = dx > 0 ? strength : 0;
      card._no.style.opacity = dx < 0 ? strength : 0;
      deck.style.setProperty('--lift', strength.toFixed(2));
    });

    function finish() {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('is-dragging');
      deck.style.setProperty('--lift', 0);
      var fast = Math.abs(dx) / Math.max(Date.now() - t0, 1) > 0.6;   // a quick flick also counts

      if (dx > THRESHOLD || (fast && dx > 30)) decide('like');
      else if (dx < -THRESHOLD || (fast && dx < -30)) decide('pass');
      else {
        card.style.transform = '';          // spring back
        card._yes.style.opacity = 0;
        card._no.style.opacity = 0;
        if (!moved) openSheet(animal);      // just a tap -> show details
      }
    }
    card.addEventListener('pointerup', finish);
    card.addEventListener('pointercancel', finish);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') openSheet(animal);
    });
    card.tabIndex = 0;
  }

  /* ---------- Details sheet ---------- */
  function openSheet(animal) {
    if (busy) return;
    sheetAnimal = animal;

    var gallery = $('sheet-gallery');
    var dots = $('sheet-dots');
    gallery.innerHTML = '';
    dots.innerHTML = '';
    var count = Math.max(1, (animal.photos || []).length);
    for (var i = 0; i < count; i++) {
      gallery.appendChild(buildMedia(animal, 'slide', i));
      dots.appendChild(el('span', i === 0 ? 'dot on' : 'dot'));
    }
    dots.hidden = count < 2;
    gallery.scrollLeft = 0;

    $('sheet-name').textContent = animal.name;
    $('sheet-sub').textContent = [animal.age, animal.sex, animal.size, animal.city].join(' · ');
    var tags = $('sheet-tags');
    tags.innerHTML = '';
    animal.tags.forEach(function (t) { tags.appendChild(el('span', 'tag', t)); });
    $('sheet-desc').textContent = animal.description;
    $('sheet-shelter').textContent = animal.shelter;

    $('sheet-scroll').scrollTop = 0;
    sheet.hidden = false;
    $('sheet-close').focus();
  }

  function closeSheet() {
    sheet.hidden = true;
    sheetAnimal = null;
  }

  $('sheet-gallery').addEventListener('scroll', function () {
    var g = $('sheet-gallery');
    var index = Math.round(g.scrollLeft / Math.max(g.clientWidth, 1));
    var all = $('sheet-dots').children;
    for (var i = 0; i < all.length; i++) all[i].className = i === index ? 'dot on' : 'dot';
  });

  /* ---------- Buttons ---------- */
  $('a-yes').addEventListener('click', function () { decide('like'); });
  $('a-no').addEventListener('click', function () { decide('pass'); });
  undoBtn.addEventListener('click', undo);
  $('sheet-close').addEventListener('click', closeSheet);
  $('sheet-yes').addEventListener('click', function () { closeSheet(); setTimeout(function () { decide('like'); }, 120); });
  $('sheet-no').addEventListener('click', function () { closeSheet(); setTimeout(function () { decide('pass'); }, 120); });

  $('a-restart').addEventListener('click', function () {
    App.saveSwipes([]);     // demo only: start from the beginning
    App.saveMatches({});
    canUndo = false;
    render();
  });

  document.addEventListener('keydown', function (e) {
    if (document.getElementById('screen-gyvunai').hidden) return;
    if (e.key === 'Escape' && !sheet.hidden) { closeSheet(); return; }
    if (!sheet.hidden || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') decide('like');
    if (e.key === 'ArrowLeft') decide('pass');
  });

  /* ---------- "Sutapimai" tab ---------- */
  var party = $('m-party');
  var msheet = $('m-sheet');
  var partyAnimal = null;

  function likeRow(animal, status) {
    var li = el('li', 'like-row');
    li.appendChild(buildMedia(animal, 'like-thumb', 0));
    var text = el('div', 'like-text');
    text.appendChild(el('p', 'like-name', animal.name));
    text.appendChild(el('p', 'like-sub', animal.shelter.replace(' (demo)', '')));
    li.appendChild(text);
    var label = { match: 'Patvirtinta', rejected: 'Nepavyko', pending: 'Laukiama' }[status];
    li.appendChild(el('span', status === 'match' ? 'chip chip-yes' : status === 'rejected' ? 'chip chip-no' : 'chip', label));
    return li;
  }

  function renderLikes() {
    var matches = App.getMatches();
    var liked = App.getSwipes().filter(function (s) { return s.v === 'like'; }).reverse();
    var mList = $('matches-list');
    var pList = $('likes-list');
    var rList = $('rejected-list');
    mList.innerHTML = '';
    pList.innerHTML = '';
    rList.innerHTML = '';
    var mCount = 0, pCount = 0, rCount = 0;

    liked.forEach(function (s) {
      var animal = byId(s.id);
      if (!animal) return;
      if (matches[s.id] && matches[s.id].status === 'rejected') {
        var rrow = likeRow(animal, 'rejected');
        rrow.classList.add('is-dim');
        rList.appendChild(rrow);
        rCount++;
      } else if (matches[s.id]) {
        var row = likeRow(animal, 'match');
        row.classList.add('is-tappable');
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        row.addEventListener('click', function () { openContacts(animal); });
        row.addEventListener('keydown', function (e) { if (e.key === 'Enter') openContacts(animal); });
        mList.appendChild(row);
        mCount++;
      } else {
        var li = likeRow(animal, 'pending');
        // Demo only: pretend the shelter answered
        var demoRow = el('div', 'demo-row');
        var demo = el('button', 'demo-approve', 'Demo: patvirtino');
        demo.type = 'button';
        demo.addEventListener('click', function () { answer(animal, 'approved'); });
        var demoNo = el('button', 'demo-approve', 'Demo: atmetė');
        demoNo.type = 'button';
        demoNo.addEventListener('click', function () { answer(animal, 'rejected'); });
        demoRow.appendChild(demo);
        demoRow.appendChild(demoNo);
        li.appendChild(demoRow);
        pList.appendChild(li);
        pCount++;
      }
    });

    $('matches-block').hidden = mCount === 0;
    $('pending-block').hidden = pCount === 0;
    $('rejected-block').hidden = rCount === 0;
    $('likes-empty').hidden = mCount + pCount + rCount > 0;
    updateBadge();
  }

  // Red dot on the tab for matches the person has not opened yet
  function updateBadge() {
    var m = App.getMatches();
    var unseen = Object.keys(m).filter(function (id) { return !m[id].seen; }).length;
    var badge = $('tab-badge');
    badge.hidden = unseen === 0;
    badge.textContent = unseen;
  }

  function answer(animal, status) {
    var m = App.getMatches();
    m[animal.id] = { status: status, seen: false };
    App.saveMatches(m);
    canUndo = false;
    renderLikes();
    showAnswer(animal);
  }

  // Shows the right screen for the shelter's answer
  function showAnswer(animal) {
    var m = App.getMatches()[animal.id];
    if (m && m.status === 'rejected') showSorry(animal);
    else showParty(animal);
  }

  /* gentle "no" */
  var sorry = $('m-sorry');
  function showSorry(animal) {
    var m = App.getMatches();
    if (m[animal.id]) { m[animal.id].seen = true; App.saveMatches(m); }
    updateBadge();
    var pic = $('m-sorry-pic');
    pic.innerHTML = '';
    pic.appendChild(buildMedia(animal, 'party-media', 0));
    $('m-sorry-title').textContent = 'Šį kartą nepavyko';
    $('m-sorry-text').textContent = animal.shelter.replace(' (demo)', '') + ' nusprendė, kad ' + animal.name + ' galbūt geriau tiks kitoje šeimoje. Tai nereiškia, kad tau kažko trūksta. Daug kitų gyvūnų irgi laukia tavęs.';
    sorry.hidden = false;
    $('m-sorry-more').focus();
  }
  $('m-sorry-close').addEventListener('click', function () { sorry.hidden = true; });
  $('m-sorry-more').addEventListener('click', function () { sorry.hidden = true; App.go('gyvunai'); });

  /* celebration */
  function showParty(animal) {
    partyAnimal = animal;
    var m = App.getMatches();
    if (m[animal.id]) { m[animal.id].seen = true; App.saveMatches(m); }
    updateBadge();

    var pic = $('m-party-pic');
    pic.innerHTML = '';
    pic.appendChild(buildMedia(animal, 'party-media', 0));
    $('m-party-text').textContent = animal.shelter.replace(' (demo)', '') + ' patvirtino tavo anketą. ' + animal.name + ' nekantrauja susipažinti!';

    var box = $('m-confetti');
    box.innerHTML = '';
    var colors = ['#FF6B1A', '#FFD3E6', '#FFE27A', '#1FB37A', '#ECE6FF', '#F0475B'];
    for (var i = 0; i < 38; i++) {
      var bit = el('span', 'bit');
      bit.style.left = Math.round(Math.random() * 100) + '%';
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = (Math.random() * 0.9).toFixed(2) + 's';
      bit.style.animationDuration = (2.2 + Math.random() * 1.6).toFixed(2) + 's';
      bit.style.setProperty('--drift', Math.round(Math.random() * 120 - 60) + 'px');
      bit.style.setProperty('--spin', Math.round(Math.random() * 720 - 360) + 'deg');
      box.appendChild(bit);
    }
    party.hidden = false;
    $('m-party-open').focus();
  }

  function closeParty() { party.hidden = true; partyAnimal = null; }

  $('m-party-open').addEventListener('click', function () {
    var a = partyAnimal;
    closeParty();
    if (a) openContacts(a);
  });
  $('m-party-later').addEventListener('click', closeParty);

  /* contacts sheet */
  function openContacts(animal) {
    var info = (window.SHELTERS || {})[animal.shelter] || { phone: '', email: '', address: animal.city };
    var pic = $('m-pic');
    pic.innerHTML = '';
    pic.appendChild(buildMedia(animal, 'slide', 0));

    $('m-name').textContent = animal.name;
    $('m-lead').textContent = animal.shelter.replace(' (demo)', '');

    $('m-phone').href = 'tel:' + info.phone.replace(/\s/g, '');
    $('m-phone-t').textContent = info.phone;
    $('m-email').href = 'mailto:' + info.email;
    $('m-email-t').textContent = info.email;
    $('m-addr').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(info.address);
    $('m-addr-t').textContent = info.address;

    var hours = $('m-hours');
    hours.innerHTML = '';
    (window.SHELTER_HOURS || []).forEach(function (h) {
      var row = el('div', 'hours-row');
      row.appendChild(el('dt', '', h[0]));
      row.appendChild(el('dd', '', h[1]));
      hours.appendChild(row);
    });

    msheet.hidden = false;
    msheet.querySelector('.sheet-scroll').scrollTop = 0;
    $('m-close').focus();
  }
  $('m-close').addEventListener('click', function () { msheet.hidden = true; });

  /* ---------- Hook into the app ---------- */
  App.onShow.gyvunai = function () { closeSheet(); render(); updateBadge(); };
  App.onShow.sutapimai = function () {
    party.hidden = true;
    sorry.hidden = true;
    msheet.hidden = true;
    renderLikes();
    // A match the person has not seen yet gets the celebration
    var m = App.getMatches();
    var firstNew = Object.keys(m).filter(function (id) { return !m[id].seen; })[0];
    if (firstNew && byId(firstNew)) showAnswer(byId(firstNew));
  };
  updateBadge();
})();
