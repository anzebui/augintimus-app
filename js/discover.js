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
    swipes.pop();
    App.saveSwipes(swipes);
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

  /* ---------- "Sutapimai" tab: animals you liked ---------- */
  function renderLikes() {
    var list = $('likes-list');
    list.innerHTML = '';
    var liked = App.getSwipes().filter(function (s) { return s.v === 'like'; }).reverse();
    list.hidden = liked.length === 0;
    $('likes-empty').hidden = liked.length > 0;

    liked.forEach(function (s) {
      var animal = byId(s.id);
      if (!animal) return;
      var li = el('li', 'like-row');
      var thumb = buildMedia(animal, 'like-thumb', 0);
      li.appendChild(thumb);
      var text = el('div', 'like-text');
      text.appendChild(el('p', 'like-name', animal.name));
      text.appendChild(el('p', 'like-sub', animal.shelter));
      li.appendChild(text);
      li.appendChild(el('span', 'chip', 'Laukiama atsakymo'));
      list.appendChild(li);
    });
  }

  /* ---------- Hook into the app ---------- */
  App.onShow.gyvunai = function () { closeSheet(); render(); };
  App.onShow.sutapimai = renderLikes;
})();
