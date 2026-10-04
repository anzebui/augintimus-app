/* =====================================================
   AUGINTIMUS APP - onboarding questions ("anketa")
   One question per screen. To change a question, edit STEPS below.
   Pictures go in img/onboarding/ - if a picture is missing, an emoji is shown instead.
   ===================================================== */
(function () {
  'use strict';

  var App = window.App;
  var IMG_DIR = 'img/onboarding/';

  /* ---------- The questions ---------- */
  var STEPS = [
    {
      id: 'purpose', type: 'cards', multi: true,
      title: 'Ko ieškai?',
      hint: 'Gali pasirinkti kelis variantus',
      options: [
        { value: 'look',   label: 'Tik apsidairau',  img: 'purpose-look.png',   emoji: '👀' },
        { value: 'foster', label: 'Laikinai globoti', img: 'purpose-foster.png', emoji: '🏡' },
        { value: 'adopt',  label: 'Įvaikinti',        img: 'purpose-adopt.png',  emoji: '💞' }
      ]
    },
    {
      id: 'animals', type: 'cards', multi: true,
      title: 'Kas tave domina?',
      hint: 'Gali pasirinkti abu',
      options: [
        { value: 'cats', label: 'Katės', img: 'animals-cat.png', emoji: '🐱' },
        { value: 'dogs', label: 'Šunys', img: 'animals-dog.png', emoji: '🐶' }
      ]
    },
    {
      id: 'housing', type: 'cards', multi: false,
      title: 'Kur gyveni?',
      hint: 'Tai padės rasti tinkamą augintinį',
      options: [
        { value: 'flat',  label: 'Bute',   img: 'housing-flat.png',  emoji: '🏢' },
        { value: 'house', label: 'Name',   img: 'housing-house.png', emoji: '🏠' }
      ]
    },
    {
      id: 'city', type: 'city',
      title: 'Kuriame mieste gyveni?',
      hint: 'Pirmiausia parodysime artimiausias prieglaudas'
    },
    {
      id: 'more', type: 'questions',
      title: 'Dar kelios smulkmenos',
      hint: 'Atsakyk nuoširdžiai, tai padeda prieglaudoms',
      questions: [
        { id: 'kids', icon: '👶', text: 'Ar namuose yra vaikų iki 14 metų?',
          options: [['yes', 'Taip'], ['no', 'Ne']] },
        { id: 'pets', icon: '🐾', text: 'Ar jau turi kitų augintinių?',
          options: [['yes', 'Taip'], ['no', 'Ne']] },
        { id: 'disabled', icon: '💛', text: 'Ar galėtum priimti neįgalų augintinį?',
          options: [['yes', 'Taip'], ['maybe', 'Priklauso'], ['no', 'Ne']] }
      ]
    },
    {
      id: 'contact', type: 'contact',
      title: 'Beveik viskas!',
      hint: 'Šiuos kontaktus matys tik tos prieglaudos, kurių gyvūnams paspausi ♥'
    }
  ];

  /* ---------- Towns: [name, county]. The county is for matching with shelters later ---------- */
  var TOWNS = [
    ['Alytus','Alytaus'], ['Anykščiai','Utenos'], ['Biržai','Panevėžio'], ['Birštonas','Kauno'],
    ['Druskininkai','Alytaus'], ['Elektrėnai','Vilniaus'], ['Gargždai','Klaipėdos'], ['Garliava','Kauno'],
    ['Grigiškės','Vilniaus'], ['Ignalina','Utenos'], ['Jonava','Kauno'], ['Joniškis','Šiaulių'],
    ['Jurbarkas','Tauragės'], ['Kaišiadorys','Kauno'], ['Kalvarija','Marijampolės'], ['Kaunas','Kauno'],
    ['Kazlų Rūda','Marijampolės'], ['Kėdainiai','Kauno'], ['Kelmė','Šiaulių'], ['Klaipėda','Klaipėdos'],
    ['Kretinga','Klaipėdos'], ['Kupiškis','Panevėžio'], ['Kuršėnai','Šiaulių'], ['Lazdijai','Alytaus'],
    ['Lentvaris','Vilniaus'], ['Marijampolė','Marijampolės'], ['Mažeikiai','Telšių'], ['Molėtai','Utenos'],
    ['Naujoji Akmenė','Šiaulių'], ['Nemenčinė','Vilniaus'], ['Pagėgiai','Tauragės'], ['Pakruojis','Šiaulių'],
    ['Palanga','Klaipėdos'], ['Panevėžys','Panevėžio'], ['Pasvalys','Panevėžio'], ['Plungė','Telšių'],
    ['Prienai','Kauno'], ['Radviliškis','Šiaulių'], ['Raseiniai','Kauno'], ['Rietavas','Telšių'],
    ['Rokiškis','Panevėžio'], ['Šakiai','Marijampolės'], ['Šalčininkai','Vilniaus'], ['Šiauliai','Šiaulių'],
    ['Šilalė','Tauragės'], ['Šilutė','Klaipėdos'], ['Širvintos','Vilniaus'], ['Skuodas','Klaipėdos'],
    ['Švenčionys','Vilniaus'], ['Tauragė','Tauragės'], ['Telšiai','Telšių'], ['Trakai','Vilniaus'],
    ['Ukmergė','Vilniaus'], ['Utena','Utenos'], ['Varėna','Alytaus'], ['Vievis','Vilniaus'],
    ['Vilkaviškis','Marijampolės'], ['Vilnius','Vilniaus'], ['Visaginas','Utenos'], ['Zarasai','Utenos']
  ];
  var BIG_CITIES = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Utena'];
  var OTHER_PLACE = 'Kita vietovė';

  /* ---------- Small helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // "Šiauliai" and "siauliai" should match
  function norm(text) {
    return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function countyOf(city) {
    for (var i = 0; i < TOWNS.length; i++) if (TOWNS[i][0] === city) return TOWNS[i][1];
    return '';
  }

  function findOption(stepId, value) {
    for (var i = 0; i < STEPS.length; i++) {
      if (STEPS[i].id !== stepId) continue;
      var opts = STEPS[i].options || [];
      for (var j = 0; j < opts.length; j++) if (opts[j].value === value) return opts[j];
    }
    return null;
  }

  /* ---------- Elements ---------- */
  var screen = $('screen-anketa');
  var body = $('wiz-body');
  var backBtn = $('wiz-back');
  var nextBtn = $('wiz-next');
  var bar = $('wiz-bar');
  var progress = $('wiz-progress');
  var count = $('wiz-count');

  /* ---------- State ---------- */
  var answers = {};
  var stepIndex = 0;
  var editing = false;      // true when a finished profile is being changed
  var view = 'step';        // 'step' or 'done'
  var direction = 1;        // 1 = moving forward, -1 = moving back (for the slide animation)
  var cityRefresh = null;   // set by the city step

  /* ---------- Start (called every time the anketa screen is opened) ---------- */
  function start() {
    var existing = App.getProfile();
    editing = !!existing;
    answers = existing ? answersFromProfile(existing) : {};
    stepIndex = 0;
    view = 'step';
    direction = 1;
    render();
  }
  App.onShow.anketa = start;

  function answersFromProfile(p) {
    return {
      purpose: (p.purpose || []).slice(),
      animals: (p.animals || []).slice(),
      housing: p.housing,
      city: p.city,
      kids: p.kids, pets: p.pets, disabled: p.disabled,
      name: p.name, phone: p.phone,
      adult: !!p.adult, consent: !!p.consent
    };
  }

  /* ---------- Drawing one step ---------- */
  function render() {
    var step = STEPS[stepIndex];
    cityRefresh = null;
    body.innerHTML = '';

    var head = el('div', 'wiz-head');
    var title = el('h2', 'wiz-title', step.title);
    title.tabIndex = -1;
    head.appendChild(title);
    head.appendChild(el('p', 'wiz-hint', step.hint));
    body.appendChild(head);

    if (step.type === 'cards') buildCards(step);
    if (step.type === 'city') buildCity();
    if (step.type === 'questions') buildQuestions(step);
    if (step.type === 'contact') buildContact();

    // progress + buttons
    var total = STEPS.length;
    bar.style.width = ((stepIndex + 1) / total * 100) + '%';
    progress.setAttribute('aria-valuenow', String(stepIndex + 1));
    count.textContent = (stepIndex + 1) + '/' + total;
    backBtn.style.visibility = (stepIndex === 0 && !editing) ? 'hidden' : 'visible';
    nextBtn.textContent = step.type === 'contact' ? (editing ? 'Išsaugoti' : 'Baigti') : 'Toliau';
    updateNext();

    // slide-in animation
    body.classList.remove('in-fwd', 'in-back');
    void body.offsetWidth;                      // restart the animation
    body.classList.add(direction > 0 ? 'in-fwd' : 'in-back');
    body.scrollTop = 0;
    try { title.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  function isValid(step) {
    if (step.type === 'cards') {
      var v = answers[step.id];
      return step.multi ? !!(v && v.length) : !!v;
    }
    if (step.type === 'city') return !!answers.city;
    if (step.type === 'questions') {
      return step.questions.every(function (q) { return !!answers[q.id]; });
    }
    return true;   // the contact step checks itself when "Baigti" is pressed
  }

  function updateNext() {
    if (view === 'done') { nextBtn.disabled = false; return; }
    nextBtn.disabled = !isValid(STEPS[stepIndex]);
  }

  /* ---------- Step type 1: big picture cards ---------- */
  function buildCards(step) {
    var wrap = el('div', 'cards' + (step.options.length === 2 ? ' two' : ''));
    wrap.setAttribute('role', step.multi ? 'group' : 'radiogroup');
    wrap.setAttribute('aria-label', step.title);
    var buttons = [];

    step.options.forEach(function (opt) {
      var b = el('button', 'opt-card');
      b.type = 'button';
      if (!step.multi) b.setAttribute('role', 'radio');

      var media = el('span', 'opt-media');
      media.appendChild(el('span', 'opt-emoji', opt.emoji));
      var img = new Image();
      img.className = 'opt-img';
      img.alt = '';
      img.onload = function () { b.classList.add('has-img'); };     // picture found -> hide the emoji
      img.src = IMG_DIR + opt.img;
      media.appendChild(img);

      b.appendChild(media);
      b.appendChild(el('span', 'opt-label', opt.label));
      var tick = el('span', 'opt-tick', '✓');
      tick.setAttribute('aria-hidden', 'true');
      b.appendChild(tick);

      b.addEventListener('click', function () {
        if (step.multi) {
          var list = answers[step.id] || [];
          var at = list.indexOf(opt.value);
          if (at === -1) list.push(opt.value); else list.splice(at, 1);
          answers[step.id] = list;
        } else {
          answers[step.id] = opt.value;
        }
        refresh();
        updateNext();
      });

      buttons.push({ node: b, value: opt.value });
      wrap.appendChild(b);
    });

    function refresh() {
      buttons.forEach(function (item) {
        var on = step.multi ? (answers[step.id] || []).indexOf(item.value) !== -1
                            : answers[step.id] === item.value;
        item.node.setAttribute(step.multi ? 'aria-pressed' : 'aria-checked', on ? 'true' : 'false');
      });
    }
    refresh();
    body.appendChild(wrap);
  }

  /* ---------- Step type 2: choose a town ---------- */
  function buildCity() {
    var wrap = el('div', 'city');

    var input = el('input', 'text-input');
    input.type = 'text';
    input.setAttribute('enterkeyhint', 'search');
    input.placeholder = 'Ieškok savo miesto…';
    input.setAttribute('aria-label', 'Ieškoti miesto');
    input.autocomplete = 'off';
    wrap.appendChild(input);

    var popularTitle = el('p', 'city-label', 'Populiariausi');
    var chips = el('div', 'city-chips');
    var results = el('div', 'city-results');
    results.setAttribute('role', 'listbox');
    var chipButtons = [];

    function choose(name) {
      answers.city = name;
      refresh();
      updateNext();
    }

    BIG_CITIES.concat([OTHER_PLACE]).forEach(function (name) {
      var b = el('button', 'pill', name);
      b.type = 'button';
      b.addEventListener('click', function () { choose(name); });
      chipButtons.push({ node: b, value: name });
      chips.appendChild(b);
    });

    function showResults() {
      var q = norm(input.value.trim());
      results.innerHTML = '';
      var searching = q.length > 0;
      popularTitle.hidden = searching;
      chips.hidden = searching;
      results.hidden = !searching;
      if (!searching) return;

      var found = TOWNS.filter(function (t) { return norm(t[0]).indexOf(q) !== -1; }).slice(0, 8);
      found.forEach(function (t) {
        var row = el('button', 'result-row');
        row.type = 'button';
        row.setAttribute('role', 'option');
        row.appendChild(el('span', 'result-name', t[0]));
        row.appendChild(el('span', 'result-county', t[1] + ' apskr.'));
        row.setAttribute('aria-selected', answers.city === t[0] ? 'true' : 'false');
        row.addEventListener('click', function () {
          choose(t[0]);
          input.value = '';
          showResults();
        });
        results.appendChild(row);
      });
      if (!found.length) {
        var none = el('div', 'result-none');
        none.appendChild(el('p', null, 'Tokio miesto nerandame.'));
        var other = el('button', 'pill', OTHER_PLACE);
        other.type = 'button';
        other.addEventListener('click', function () { choose(OTHER_PLACE); input.value = ''; showResults(); });
        none.appendChild(other);
        results.appendChild(none);
      }
    }

    input.addEventListener('input', showResults);

    // shows what is currently chosen, even when it is not one of the popular chips
    var chosenBox = el('div', 'chosen');
    function refresh() {
      chipButtons.forEach(function (item) {
        item.node.setAttribute('aria-pressed', answers.city === item.value ? 'true' : 'false');
      });
      chosenBox.innerHTML = '';
      if (answers.city) {
        chosenBox.appendChild(el('span', 'chosen-label', 'Pasirinkta:'));
        chosenBox.appendChild(el('span', 'chosen-value', '📍 ' + answers.city));
      }
    }

    wrap.appendChild(chosenBox);
    wrap.appendChild(popularTitle);
    wrap.appendChild(chips);
    wrap.appendChild(results);
    body.appendChild(wrap);
    showResults();
    refresh();
    cityRefresh = refresh;
  }

  /* ---------- Step type 3: a few yes/no questions on one screen ---------- */
  function buildQuestions(step) {
    var wrap = el('div', 'qs');

    step.questions.forEach(function (q) {
      var card = el('div', 'q-card');
      var head = el('div', 'q-head');
      head.appendChild(el('span', 'q-icon', q.icon));
      var text = el('p', 'q-text', q.text);
      text.id = 'q-' + q.id;
      head.appendChild(text);
      card.appendChild(head);

      var seg = el('div', 'seg');
      seg.setAttribute('role', 'radiogroup');
      seg.setAttribute('aria-labelledby', text.id);
      var segButtons = [];

      q.options.forEach(function (pair) {
        var b = el('button', 'seg-btn', pair[1]);
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.addEventListener('click', function () {
          answers[q.id] = pair[0];
          paint();
          updateNext();
        });
        segButtons.push({ node: b, value: pair[0] });
        seg.appendChild(b);
      });

      function paint() {
        segButtons.forEach(function (item) {
          item.node.setAttribute('aria-checked', answers[q.id] === item.value ? 'true' : 'false');
        });
      }
      paint();
      card.appendChild(seg);
      wrap.appendChild(card);
    });

    body.appendChild(wrap);
  }

  /* ---------- Step type 4: name, phone and consent ---------- */
  function buildContact() {
    var wrap = el('div', 'contact-form');
    // only fixed text here (no user data), so innerHTML is safe
    wrap.innerHTML =
      '<div class="field">' +
        '<label for="f-name">Vardas ir pavardė</label>' +
        '<input id="f-name" class="text-input" type="text" autocomplete="name" maxlength="80">' +
        '<p class="err" id="e-name" role="alert"></p>' +
      '</div>' +
      '<div class="field">' +
        '<label for="f-phone">Telefono numeris</label>' +
        '<input id="f-phone" class="text-input" type="tel" inputmode="tel" autocomplete="tel" placeholder="+370 6xx xxxxx" maxlength="20">' +
        '<p class="err" id="e-phone" role="alert"></p>' +
      '</div>' +
      '<label class="check"><input id="f-adult" type="checkbox"><span>Man jau yra 18 metų</span></label>' +
      '<p class="err" id="e-adult" role="alert"></p>' +
      '<label class="check"><input id="f-consent" type="checkbox"><span>Sutinku, kad mano vardas, telefonas ir anketos atsakymai būtų perduoti prieglaudoms, kurių gyvūnams paspausiu ♥.</span></label>' +
      '<p class="err" id="e-consent" role="alert"></p>';
    body.appendChild(wrap);

    var name = $('f-name'), phone = $('f-phone'), adult = $('f-adult'), consent = $('f-consent');
    name.value = answers.name || App.user.name || '';
    phone.value = answers.phone || '';
    adult.checked = !!answers.adult;
    consent.checked = !!answers.consent;

    // remember what was typed, so going back and forth does not lose it
    name.addEventListener('input', function () { answers.name = name.value; });
    phone.addEventListener('input', function () { answers.phone = phone.value; });
    adult.addEventListener('change', function () { answers.adult = adult.checked; });
    consent.addEventListener('change', function () { answers.consent = consent.checked; });
    answers.name = name.value;

    [name, phone].forEach(function (input) {
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') nextBtn.click(); });
    });
  }

  // "8 612 34567", "612 34567" and "+370 612 34567" all become +370 612 34567.
  // Numbers from other countries are kept as +number. Returns '' when it does not look like a phone number.
  function normalizePhone(raw) {
    var s = String(raw).replace(/[\s\-()]/g, '');
    var m;
    if ((m = /^(?:\+370|00370)(\d{8})$/.exec(s)) || (m = /^8(\d{8})$/.exec(s)) || (m = /^(\d{8})$/.exec(s))) {
      return '+370 ' + m[1].slice(0, 3) + ' ' + m[1].slice(3);
    }
    if (/^\+\d{9,15}$/.test(s)) return s;
    return '';
  }

  function validateContact() {
    var ok = true, firstBad = null;
    function fail(inputId, errId, message) {
      $(errId).textContent = message;
      ok = false;
      if (!firstBad) firstBad = $(inputId);
    }
    ['e-name', 'e-phone', 'e-adult', 'e-consent'].forEach(function (id) { $(id).textContent = ''; });

    var name = $('f-name').value.trim().replace(/\s+/g, ' ');
    if (name.length < 3 || name.indexOf(' ') === -1) fail('f-name', 'e-name', 'Įrašyk vardą ir pavardę.');

    var phone = normalizePhone($('f-phone').value);
    if (!phone) fail('f-phone', 'e-phone', 'Įrašyk telefono numerį, pvz. +370 612 34567.');

    if (!$('f-adult').checked) fail('f-adult', 'e-adult', 'Programėle gali naudotis tik pilnamečiai.');
    if (!$('f-consent').checked) fail('f-consent', 'e-consent', 'Be sutikimo prieglaudos negalės su tavimi susisiekti.');

    if (!ok) { firstBad.focus(); return false; }
    answers.name = name;
    answers.phone = phone;
    $('f-phone').value = phone;
    answers.adult = true;
    answers.consent = true;
    return true;
  }

  /* ---------- Finishing ---------- */
  function buildProfile() {
    return {
      purpose: answers.purpose || [],
      animals: answers.animals || [],
      housing: answers.housing,
      city: answers.city,
      county: countyOf(answers.city),
      kids: answers.kids,
      pets: answers.pets,
      disabled: answers.disabled,
      name: answers.name,
      phone: answers.phone,
      adult: true,
      consent: true,
      updatedAt: new Date().toISOString()
    };
  }

  function showDone() {
    view = 'done';
    body.innerHTML = '';
    var box = el('div', 'done');
    var art = el('div', 'empty-art pop', '🎉');
    art.setAttribute('aria-hidden', 'true');
    box.appendChild(art);
    var h = el('h2', 'wiz-title', 'Viskas paruošta!');
    h.tabIndex = -1;
    box.appendChild(h);
    box.appendChild(el('p', 'wiz-hint', 'Dabar gali peržiūrėti gyvūnus. Kai prieglauda pritars, čia atsiras jos kontaktai.'));
    body.appendChild(box);

    bar.style.width = '100%';
    count.textContent = '✓';
    backBtn.style.visibility = 'hidden';
    nextBtn.textContent = 'Pradėti';
    nextBtn.disabled = false;

    body.classList.remove('in-fwd', 'in-back');
    void body.offsetWidth;
    body.classList.add('in-fwd');
    try { h.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  /* ---------- Buttons ---------- */
  nextBtn.addEventListener('click', function () {
    if (view === 'done') { App.go('gyvunai'); return; }

    var step = STEPS[stepIndex];
    if (step.type === 'contact') {
      if (!validateContact()) return;
      App.saveProfile(buildProfile());
      if (editing) App.go('profilis'); else showDone();
      return;
    }
    if (!isValid(step)) return;
    stepIndex += 1;
    direction = 1;
    render();
  });

  backBtn.addEventListener('click', function () {
    if (view === 'done') return;
    if (stepIndex > 0) {
      stepIndex -= 1;
      direction = -1;
      render();
    } else if (editing) {
      App.go('profilis');
    }
  });

  /* ---------- Text for the profile tab ("chips") ---------- */
  App.describeProfile = function (p) {
    var out = [];
    if (p.city) out.push('📍 ' + p.city);
    if (p.housing) out.push(p.housing === 'flat' ? '🏢 Butas' : '🏠 Namas');
    (p.animals || []).forEach(function (v) {
      var o = findOption('animals', v);
      if (o) out.push(o.emoji + ' ' + o.label);
    });
    (p.purpose || []).forEach(function (v) {
      var o = findOption('purpose', v);
      if (o) out.push(o.emoji + ' ' + o.label);
    });
    if (p.kids) out.push(p.kids === 'yes' ? '👶 Namuose yra vaikų' : '👶 Vaikų nėra');
    if (p.pets) out.push(p.pets === 'yes' ? '🐾 Turi augintinių' : '🐾 Augintinių neturi');
    if (p.disabled) {
      out.push({ yes: '💛 Priimtų neįgalų', maybe: '💛 Neįgalų gal priimtų', no: '💛 Neįgalaus nepriimtų' }[p.disabled]);
    }
    return out.filter(Boolean);
  };
})();
