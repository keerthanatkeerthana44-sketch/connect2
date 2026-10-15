/* CONNECT — script.js
   All behaviour: data, storage, hash routing, games and guided activities.
   Vanilla JavaScript only. index.html supplies the page structure; this file fills it in. */
'use strict';

/* ==================== Data ==================== */

const STORAGE_KEYS = {
  savedActivities: 'mindnest.savedActivities',
  moodEntries: 'mindnest.moodEntries',
  journal: 'mindnest.journal',
  ratings: 'mindnest.ratings',
};

const EMOTIONS = [
  { id: 'stressed', label: 'Stressed', emoji: '😰', hint: 'Tense or under pressure' },
  { id: 'anxious', label: 'Anxious', emoji: '😟', hint: 'Worried or on edge' },
  { id: 'sad', label: 'Sad', emoji: '😢', hint: 'Low or heavy-hearted' },
  { id: 'angry', label: 'Angry', emoji: '😡', hint: 'Frustrated or irritated' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵', hint: 'Too much at once' },
  { id: 'exhausted', label: 'Tired', emoji: '😴', hint: 'Drained or worn out' },
  { id: 'numb', label: 'Numb', emoji: '😶', hint: 'Far away or flat' },
  { id: 'happy', label: 'Happy', emoji: '😊', hint: 'Lighter than usual' },
  { id: 'calm', label: 'Calm', emoji: '😌', hint: 'Settled and at ease' },
  { id: 'motivated', label: 'Motivated', emoji: '🤩', hint: 'Ready to move forward' },
];

const EMOTION_MOTION = {
  stressed: 'wobble', anxious: 'tremble', sad: 'sway', angry: 'shake', overwhelmed: 'wobble',
  exhausted: 'sway', numb: 'fade', happy: 'bounce', calm: 'sway', motivated: 'bounce',
};

const ACTIVITIES = {
  counting: { id: 'counting', name: 'Counting Exercise', description: 'Count slowly from 1 to 10 and let your attention settle on the numbers.', duration: '2 min' },
  breathing: { id: 'breathing', name: 'Guided Breathing', description: 'A gentle, comfortable breathing guide. You set the pace; nothing is forced.', duration: '3 min' },
  grounding: { id: 'grounding', name: 'Grounding Exercise', description: 'Notice your surroundings through your senses. Skip any step you like.', duration: '4 min' },
  journaling: { id: 'journaling', name: 'Journaling', description: 'Write a few honest lines about what is on your mind. You choose whether to save.', duration: '5 min' },
  taskBreakdown: { id: 'taskBreakdown', name: 'Task Breakdown', description: 'Split one task into small steps and pick only the first one.', duration: '5 min' },
  creative: { id: 'creative', name: 'Creative Reset', description: 'A small creative prompt to shift your focus for a few minutes.', duration: '5 min' },
  movement: { id: 'movement', name: 'Gentle Movement', description: 'Short, optional movement ideas. Only do what feels okay for your body today.', duration: '3 min' },
  positive: { id: 'positive', name: 'Positive Reflection', description: 'Recall one moment that felt good and note what made it so.', duration: '3 min' },
  restBreak: { id: 'restBreak', name: 'Short Rest Break', description: 'Step away from demands for a few minutes. Rest is a valid activity.', duration: '5 min' },
  focusSession: { id: 'focusSession', name: 'Short Focus Session', description: 'Work on one thing for a short, defined stretch, then pause.', duration: '10 min' },
  trustedContact: { id: 'trustedContact', name: 'Reach Out to Someone You Trust', description: 'Consider sharing how you feel with a person you trust. Optional.', duration: 'Varies' },
};

// Rule-based suggestions per emotion, in order. No AI is involved.
const RULES = {
  stressed: ['breathing', 'counting', 'journaling', 'movement'],
  anxious: ['grounding', 'breathing', 'taskBreakdown', 'counting'],
  sad: ['journaling', 'creative', 'positive', 'trustedContact'],
  angry: ['restBreak', 'breathing', 'journaling', 'movement'],
  overwhelmed: ['taskBreakdown', 'restBreak', 'focusSession', 'counting'],
  exhausted: ['restBreak', 'movement', 'grounding', 'breathing'],
  numb: ['grounding', 'creative', 'movement', 'trustedContact'],
  happy: ['positive', 'journaling', 'creative', 'focusSession'],
  calm: ['positive', 'journaling', 'creative', 'focusSession'],
  motivated: ['taskBreakdown', 'focusSession', 'positive', 'journaling'],
};

// Games for each mood. "Let's Play" starts the first; "Try Another Activity" moves on.
const EXPERIENCES = {
  stressed: ['popBubbles', 'breathingBubble', 'garden'],
  anxious: ['breathingBubble', 'colorGame', 'grounding'],
  sad: ['moodMatch', 'garden', 'kindWords'],
  angry: ['tapRelease', 'breathingBubble', 'colorGame'],
  overwhelmed: ['oneStep', 'breathingBubble', 'restTimer'],
  exhausted: ['breathingBubble', 'floatingShapes', 'restTimer'],
  numb: ['sensory', 'garden', 'colorGame'],
  happy: ['confetti', 'happyMemory', 'moodMatch'],
  calm: ['floatingShapes', 'garden', 'colorGame'],
  motivated: ['goalGame', 'fiveMinute', 'confetti'],
};

const EXPERIENCE_TITLES = {
  popBubbles: 'Pop the bubbles',
  breathingBubble: 'Breathing bubble',
  garden: 'Virtual garden',
  colorGame: 'Calm colouring',
  grounding: 'Grounding challenge',
  moodMatch: 'Mood match',
  kindWords: 'Kind words',
  tapRelease: 'Tap to release',
  oneStep: 'One step at a time',
  restTimer: 'Short rest timer',
  floatingShapes: 'Floating shapes',
  sensory: 'Sensory explore',
  confetti: 'Confetti celebration',
  happyMemory: 'Happy-memory journal',
  fiveMinute: 'Five-minute challenge',
  goalGame: 'Goal game',
};

// Friendly, non-judgmental messages. None of them promise a cure or a mood change.
const MOOD_MESSAGES = {
  stressed: "That sounds like a lot is pressing on you right now. You're allowed to take the pressure down a notch.",
  anxious: "Anxious feelings can feel loud. Let's slow things down together, one small thing at a time.",
  sad: "It's okay to feel low. You don't have to feel better right away, and you don't have to explain it.",
  angry: "Anger often means something matters to you. Let's let some of it out safely.",
  overwhelmed: "When everything piles up, it helps to shrink the list. Let's find just one small step.",
  exhausted: 'Feeling tired is your body asking for care. A little rest is a good place to start.',
  numb: "Sometimes feelings feel far away. That's okay. We can gently notice the world around you.",
  happy: "It's lovely to feel happy. Let's take a moment to enjoy it and remember it.",
  calm: "You feel settled right now. Let's enjoy this calm for a little while.",
  motivated: "You have energy to move forward. Let's turn it into small, doable wins.",
};

// Emoji answers for "How are you feeling now?" on the emotion screen.
const FEELING_OPTIONS = [
  { id: 'better', emoji: '😊', label: 'I feel better' },
  { id: 'little', emoji: '🙂', label: 'A little better' },
  { id: 'same', emoji: '😐', label: 'About the same' },
  { id: 'worse', emoji: '😣', label: 'I feel worse' },
  { id: 'rather', emoji: '🤐', label: "I'd rather not say" },
];

const FEELING_RESPONSES = {
  better: "I'm glad this felt good. You can finish here, or try another activity.",
  little: "That's a good sign. You can stop here, or keep going with another activity.",
  same: "That's okay. Some moments need a different approach. You might like to try something else.",
  worse: "I'm sorry it feels harder right now. You can stop now. If you need support, please reach out to someone now.",
  rather: "That's completely fine. You don't have to share anything.",
};

// Text answers for the feedback step after a guided activity.
const ACTIVITY_FEEDBACK = [
  { id: 'better', label: 'I feel better.' },
  { id: 'a-little-better', label: 'I feel a little better.' },
  { id: 'same', label: 'I feel the same.' },
  { id: 'worse', label: 'I feel worse.' },
  { id: 'rather-not', label: "I'd rather not say." },
];

const ACTIVITY_FEEDBACK_RESPONSES = {
  better: "I'm glad this helped. You can finish here, or try another activity.",
  'a-little-better': "That's a good sign. You can stop here, or continue with another activity if you like.",
  same: "That's okay. Some moments need a different approach. You might like to try another activity.",
  worse: "I'm sorry it feels harder right now. You can stop now. If you need support, please reach out to someone now.",
  'rather-not': "That's completely fine. You don't have to share anything.",
};

const GROUNDING_STEPS = [
  { sense: 'See', prompt: 'Name 5 things you can see around you. Take your time.' },
  { sense: 'Touch', prompt: 'Notice 4 things you can feel, like your feet on the floor or the fabric of your clothes.' },
  { sense: 'Hear', prompt: 'Notice 3 sounds near you or farther away.' },
  { sense: 'Smell', prompt: "Notice 2 smells. If you can't notice any, think of a smell you like." },
  { sense: 'Taste', prompt: "Notice 1 taste, or take a sip of water if you'd like." },
];

const JOURNAL_PROMPT = 'What is on your mind right now? Write as much or as little as you like. Nothing needs to be neat or finished.';

const CREATIVE_PROMPTS = [
  'Describe a place you would like to be right now, using all five senses.',
  "Doodle or sketch something simple on paper. It doesn't need to look like anything.",
  'Write three words that describe the color of this moment.',
  'Hum or sing a song you know by heart, or a few lines of it.',
  'Name an everyday object near you and describe it as if you were seeing it for the first time.',
];

const MOVEMENT_OPTIONS = [
  'Roll your shoulders slowly, forward and then back.',
  'Stretch your neck gently from side to side, only as far as feels comfortable.',
  'Stand up and take a short walk around your room or a quiet space.',
  'Stretch your arms up overhead, or reach down toward your knees if that feels better.',
  'Sit comfortably and wiggle your fingers and toes for a few seconds.',
];

const MOVEMENT_NOTE = 'Only do what feels okay for your body today. If a movement causes pain or discomfort, skip it. Sitting still counts too.';

const POSITIVE_PROMPT = 'Think of one small moment from recently that felt good, even slightly. What was happening?';

const GENERIC_STEPS = {
  restBreak: {
    title: 'Short Rest Break',
    intro: 'Rest is a valid activity. Take as long as you need, and you can stop at any point.',
    steps: [
      'Step away from your screen or current task if you can.',
      'Sit or lie down somewhere comfortable.',
      'Let your body be still for a few minutes. No goal needed.',
      "When you're ready, notice how the room feels around you.",
    ],
  },
  focusSession: {
    title: 'Short Focus Session',
    intro: 'Work on one thing for a short, defined stretch, then pause. You decide when to stop.',
    steps: [
      'Pick one small task you can finish in about 10 minutes.',
      'Set a gentle timer for 10 minutes, or simply begin.',
      "Work on that one thing only. Don't worry about the rest yet.",
      'When the time is up, pause and notice what you got done, however small.',
    ],
  },
  trustedContact: {
    title: 'Reach Out to Someone You Trust',
    intro: 'This is optional. Sharing how you feel with someone you trust can help. Only do it if it feels right.',
    steps: [
      'Think of one person you feel safe with.',
      'You could send them a short message, such as "I\'m having a hard day. Can we talk later?"',
      "You don't have to explain everything. A sentence is enough.",
      'If you need to talk to someone right away, use the urgent help page.',
    ],
  },
};

/* ==================== Small helpers ==================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/**
 * Creates an element. props may include class, htmlFor, value, style (object),
 * event handlers named onClick / onInput / onChange / onSubmit, and any attribute.
 * children can be strings, nodes, arrays, or null/false (skipped).
 */
function el(tag, props, ...children) {
  const node = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key === 'htmlFor') node.setAttribute('for', value);
      else if (key === 'value') node.value = value;
      else if (key === 'style') {
        for (const [prop, v] of Object.entries(value)) {
          if (prop.startsWith('--')) node.style.setProperty(prop, v);
          else node.style[prop] = v;
        }
      } else if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value === true) node.setAttribute(key, '');
      else node.setAttribute(key, String(value));
    }
  }
  const items = children
    .flat(Infinity)
    .filter((c) => c !== null && c !== undefined && c !== false)
    .map((c) => (c instanceof Node ? c : document.createTextNode(String(c))));
  node.append(...items);
  return node;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

// Cleanup list: timers and listeners that must stop when the screen changes.
const disposers = [];
function onDispose(fn) {
  disposers.push(fn);
}
function disposeAll() {
  while (disposers.length) disposers.pop()();
}

function goBack(fallback = '#/') {
  if (history.length > 1) history.back();
  else location.hash = fallback;
}

function notFoundCard(title, href, linkLabel, text = '') {
  return el('div', { class: 'page' },
    el('div', { class: 'card' },
      el('h1', null, title),
      text ? el('p', null, text) : null,
      el('a', { class: 'btn btn--primary', href }, linkLabel)));
}

/* ==================== Storage ==================== */

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// Mood check-ins: newest first. Only what the person saves is stored.
function loadEntries() {
  const list = loadJSON(STORAGE_KEYS.moodEntries, []);
  return Array.isArray(list) ? list : [];
}

function addEntry(emotionId, note) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    emotionId,
    note: (note || '').trim(),
    createdAt: new Date().toISOString(),
  };
  saveJSON(STORAGE_KEYS.moodEntries, [entry, ...loadEntries()]);
}

function deleteEntry(id) {
  saveJSON(STORAGE_KEYS.moodEntries, loadEntries().filter((e) => e.id !== id));
}

function appendJournal(text) {
  const list = loadJSON(STORAGE_KEYS.journal, []);
  return saveJSON(STORAGE_KEYS.journal, [
    ...(Array.isArray(list) ? list : []),
    { id: Date.now().toString(), text, createdAt: new Date().toISOString() },
  ]);
}

function loadRatings() {
  const r = loadJSON(STORAGE_KEYS.ratings, {});
  return r && typeof r === 'object' && !Array.isArray(r) ? r : {};
}

function recordRating(activityId, helped) {
  const ratings = loadRatings();
  const current = ratings[activityId] || { helped: 0, notHelped: 0 };
  ratings[activityId] = {
    helped: current.helped + (helped ? 1 : 0),
    notHelped: current.notHelped + (helped ? 0 : 1),
  };
  saveJSON(STORAGE_KEYS.ratings, ratings);
}

function helpfulScore(ratings, id) {
  const r = ratings[id];
  return r ? r.helped - r.notHelped : 0;
}

/* ==================== Mood and insight helpers ==================== */

function getEmotion(id) {
  return EMOTIONS.find((e) => e.id === id) || null;
}

function filterEntries(entries, { emotionId = 'all', days = 'all' } = {}) {
  const cutoff = days === 'all' ? 0 : Date.now() - Number(days) * 86400000;
  return entries.filter(
    (e) => (emotionId === 'all' || e.emotionId === emotionId) && new Date(e.createdAt).getTime() >= cutoff
  );
}

function countByEmotion(entries) {
  const counts = {};
  entries.forEach((e) => {
    counts[e.emotionId] = (counts[e.emotionId] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, emotion: getEmotion(id), count }))
    .filter((x) => x.emotion);
}

// Check-ins per day for the last `days` days, oldest first.
function dailyCounts(entries, days = 14) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(today.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const count = entries.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    out.push({ label: start.getDate(), count });
  }
  return out;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/* ==================== Recommendations ==================== */

// Activities the person found helpful move up; ties keep the rule order.
function getActivitiesForEmotion(emotionId, exclude = []) {
  const ratings = loadRatings();
  return (RULES[emotionId] || [])
    .map((id, index) => ({ activity: ACTIVITIES[id], index }))
    .filter(({ activity }) => activity && !exclude.includes(activity.id))
    .sort((a, b) => helpfulScore(ratings, b.activity.id) - helpfulScore(ratings, a.activity.id) || a.index - b.index)
    .map(({ activity }) => activity);
}

function getDifferentActivities(emotionId, shownIds = []) {
  const all = getActivitiesForEmotion(emotionId);
  const fresh = all.filter((a) => !shownIds.includes(a.id));
  return fresh.length ? fresh : all;
}

/* ==================== Router (hash-based) ==================== */

const ROUTES = [
  { pattern: /^\/$/, page: 'page-home' },
  { pattern: /^\/feel\/([^/]+)$/, page: 'page-feel', enter: ([id]) => renderFeel(id) },
  { pattern: /^\/activities\/([^/]+)$/, page: 'page-activities', enter: ([id]) => renderActivities(id) },
  { pattern: /^\/activity\/([^/]+)$/, page: 'page-activity', enter: ([id], query) => renderActivity(id, query) },
  { pattern: /^\/mood$/, page: 'page-mood', enter: () => renderMood() },
  { pattern: /^\/insights$/, page: 'page-insights', enter: () => renderInsights() },
  { pattern: /^\/relax$/, page: 'page-relax', enter: () => setRelaxTab('breathing') },
  { pattern: /^\/urgent-help$/, page: 'page-urgent' },
];

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  const withSlash = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  return {
    path: withSlash.replace(/\/+$/, '') || '/',
    query: Object.fromEntries(new URLSearchParams(queryPart)),
  };
}

function updateNav(path) {
  $$('[data-nav]').forEach((link) => {
    const target = link.dataset.nav;
    const active = target === '/' ? path === '/' : path.startsWith(target);
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function render() {
  disposeAll();
  const { path, query } = parseHash();
  let match = null;
  for (const route of ROUTES) {
    const m = path.match(route.pattern);
    if (m) {
      match = { route, params: m.slice(1) };
      break;
    }
  }
  $$('.page-section').forEach((section) => {
    section.hidden = true;
  });
  if (match) {
    document.getElementById(match.route.page).hidden = false;
    if (match.route.enter) match.route.enter(match.params, query);
  } else {
    document.getElementById('page-notfound').hidden = false;
  }
  updateNav(path);
  window.scrollTo(0, 0);
}

/* ==================== Home: mood cards ==================== */

function renderMoodGrid() {
  const grid = document.getElementById('mood-grid');
  grid.replaceChildren(
    ...EMOTIONS.map((e) =>
      el('button', {
        type: 'button',
        class: 'mood-card',
        'data-mood': e.id,
        onClick: () => { location.hash = `#/feel/${e.id}`; },
      },
        el('span', { class: 'mood-card__emoji', 'aria-hidden': 'true' }, e.emoji),
        el('span', { class: 'mood-card__label' }, e.label),
        el('span', { class: 'mood-card__hint' }, e.hint)))
  );
}

/* ==================== Emotion screen (/feel/:id) ==================== */

function renderGame(id, onDone) {
  switch (id) {
    case 'popBubbles': return renderPopBubbles();
    case 'breathingBubble': return renderBreathingBubble();
    case 'garden': return renderGarden();
    case 'colorGame': return renderColorGame();
    case 'grounding': return renderGrounding(onDone);
    case 'moodMatch': return renderMoodMatch();
    case 'kindWords': return renderKindWords();
    case 'tapRelease': return renderTapRelease();
    case 'oneStep': return renderOneStep();
    case 'restTimer':
      return renderRestTimer({
        seconds: 180,
        intro: 'A three-minute rest. You can pause, reset, or stop any time.',
        prompts: ['Let your shoulders drop.', 'Breathe slowly, at your own pace.', 'Notice how the chair or floor supports you.', 'Rest a little longer if you like.'],
      });
    case 'floatingShapes': return renderFloatingShapes();
    case 'sensory': return renderSensory();
    case 'confetti': return renderConfetti();
    case 'happyMemory': return renderHappyMemory();
    case 'fiveMinute':
      return renderRestTimer({
        seconds: 300,
        intro: 'A five-minute challenge. Pick one small thing and work on it, then pause when you like.',
        prompts: ['Choose one small thing to start.', 'Keep going at a comfortable pace.', 'Notice what you have already done.', 'Pause whenever you need to.'],
      });
    case 'goalGame': return renderGoalGame();
    default: return el('p', null, "This activity isn't available.");
  }
}

function renderFeel(emotionId) {
  const section = document.getElementById('page-feel');
  const root = document.getElementById('feel-root');
  const emotion = getEmotion(emotionId);
  const experiences = EXPERIENCES[emotionId] || [];

  if (!emotion || experiences.length === 0) {
    section.removeAttribute('data-mood');
    root.replaceChildren(notFoundCard("We couldn't find that mood.", '#/', 'Back to my mood'));
    return;
  }

  section.dataset.mood = emotion.id;
  const body = el('div', { class: 'feel-body' });
  root.replaceChildren(body);

  const motion = EMOTION_MOTION[emotion.id];
  let stage = 'intro';
  let index = 0;

  const nextExperience = () => {
    index = (index + 1) % experiences.length;
    stage = 'playing';
    draw();
  };

  const introView = () => el('section', { class: 'card feel-hero' },
    el('div', { class: `feel-emoji feel-emoji--${motion}`, 'aria-hidden': 'true' }, emotion.emoji),
    el('p', { class: 'eyebrow' }, `You chose ${emotion.label.toLowerCase()}`),
    el('h1', { class: 'feel-title' }, emotion.label),
    el('p', { class: 'feel-message' }, MOOD_MESSAGES[emotion.id]),
    el('p', { class: 'fun-label' }, 'Want to try a little game to explore this feeling?'),
    el('div', { class: 'feel-buttons' },
      el('button', { type: 'button', class: 'btn btn--primary btn--big', onClick: () => { stage = 'playing'; draw(); } }, "Let's Play 🎮"),
      el('button', { type: 'button', class: 'btn btn--ghost', onClick: nextExperience }, 'Try Another Activity 🌿'),
      el('a', { class: 'btn btn--ghost', href: '#/' }, 'Change My Mood')),
    el('p', { class: 'muted small' },
      'You can skip any game and come back anytime. ',
      el('a', { href: `#/activities/${emotion.id}` }, 'See all gentle activities')));

  const playingView = () => el('div', { class: 'feel-playing' },
    el('section', { class: 'card feel-game' },
      el('div', { class: 'feel-game__head' },
        el('span', { class: `feel-emoji-small feel-emoji--${motion}`, 'aria-hidden': 'true' }, emotion.emoji),
        el('div', null,
          el('p', { class: 'eyebrow' }, EXPERIENCE_TITLES[experiences[index]]),
          el('p', { class: 'muted small' }, 'Explore this feeling at your own pace.'))),
      renderGame(experiences[index], () => { stage = 'feedback'; draw(); })),
    el('div', { class: 'page-actions' },
      el('button', { type: 'button', class: 'btn btn--primary', onClick: () => { stage = 'feedback'; draw(); } }, "I'm done"),
      el('button', { type: 'button', class: 'btn btn--ghost', onClick: nextExperience }, 'Try another activity 🌿'),
      el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { stage = 'intro'; draw(); } }, 'Back to my options'),
      el('a', { class: 'btn btn--ghost', href: '#/' }, 'Return home')));

  const feedbackView = () => renderFeelingCheck({
    emotionId: emotion.id,
    activityTitle: EXPERIENCE_TITLES[experiences[index]],
    onAnother: nextExperience,
    onOptions: () => { stage = 'intro'; draw(); },
  });

  const draw = () => {
    disposeAll();
    const views = { intro: introView, playing: playingView, feedback: feedbackView };
    body.replaceChildren(views[stage]());
  };

  draw();
}

function renderFeelingCheck({ emotionId, activityTitle, onAnother, onOptions }) {
  let choice = null;
  let saved = false;
  const box = el('section', { class: 'card feedback', 'aria-labelledby': 'check-heading' });

  const draw = () => {
    box.replaceChildren(
      el('h2', { id: 'check-heading', class: 'section-title' }, 'How are you feeling now?'),
      el('p', { class: 'section-subtitle' }, 'Optional. Tap an emoji, or skip this.'),
      el('div', { class: 'emoji-answers', role: 'group', 'aria-label': 'How you feel now' },
        FEELING_OPTIONS.map((o) =>
          el('button', {
            type: 'button',
            class: `emoji-answer${choice === o.id ? ' is-selected' : ''}`,
            'aria-pressed': String(choice === o.id),
            onClick: () => { choice = o.id; saved = false; draw(); },
          },
            el('span', { class: 'emoji-answer__face', 'aria-hidden': 'true' }, o.emoji),
            el('span', null, o.label)))),
      choice ? el('p', { class: 'feedback-response', role: 'status' }, FEELING_RESPONSES[choice]) : null,
      choice
        ? el('div', { class: 'page-actions' },
          saved
            ? el('p', { class: 'form-success', role: 'status' }, 'Saved to My Mood on this device.')
            : el('button', {
              type: 'button',
              class: 'btn btn--ghost',
              onClick: () => {
                const option = FEELING_OPTIONS.find((o) => o.id === choice);
                addEntry(emotionId, `After "${activityTitle}": ${option.label}`);
                saved = true;
                draw();
              },
            }, 'Save to My Mood'))
        : null,
      el('div', { class: 'page-actions' },
        el('button', { type: 'button', class: 'btn btn--primary', onClick: onAnother }, 'Try another activity 🌿'),
        el('button', { type: 'button', class: 'btn btn--ghost', onClick: onOptions }, 'Back to my options'),
        el('a', { class: 'btn btn--ghost', href: '#/' }, 'Return home'),
        el('a', { class: `btn ${choice === 'worse' ? 'btn--urgent' : 'btn--urgent-soft'}`, href: '#/urgent-help' }, 'Get urgent help')));
  };

  draw();
  return box;
}

/* ==================== Games ==================== */

function renderBreathingBubble() {
  const IN_MS = 4000;
  const OUT_MS = 6000;
  let running = false;
  let phase = 'in';
  let timer = null;

  const bubble = el('div', { class: 'bubble bubble--in is-idle', 'aria-hidden': 'true' });
  const label = el('p', { class: 'fun-label', 'aria-live': 'polite' });
  const button = el('button', { type: 'button', class: 'btn btn--primary' }, 'Start');

  const update = () => {
    bubble.className = `bubble bubble--${phase}${running ? '' : ' is-idle'}`;
    button.textContent = running ? 'Pause' : 'Start';
    label.textContent = !running
      ? 'Press start when you are ready.'
      : phase === 'in' ? 'Breathe in... the bubble grows.' : 'Breathe out... the bubble softens.';
  };

  const schedule = () => {
    clearTimeout(timer);
    if (!running) return;
    const wait = phase === 'in' ? IN_MS : OUT_MS;
    timer = setTimeout(() => {
      phase = phase === 'in' ? 'out' : 'in';
      update();
      schedule();
    }, wait);
  };

  button.addEventListener('click', () => {
    running = !running;
    update();
    schedule();
  });
  onDispose(() => clearTimeout(timer));
  update();

  return el('div', { class: 'fun-panel' }, bubble, label, button);
}

function renderPopBubbles() {
  const COLORS = ['#f9d3e0', '#d3f3e4', '#d9ccf7', '#ffe2cc', '#fff1b8', '#cfe8fb'];
  const COUNT = 14;
  const makeBubbles = () => Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    x: 4 + Math.random() * 82,
    y: 4 + Math.random() * 76,
    size: 50 + Math.random() * 46,
    color: COLORS[i % COLORS.length],
    popped: false,
  }));

  let bubbles = makeBubbles();
  const label = el('p', { class: 'fun-label', 'aria-live': 'polite' });
  const field = el('div', { class: 'pop-field' });

  const draw = () => {
    const popped = bubbles.filter((b) => b.popped).length;
    label.textContent = popped === COUNT
      ? 'All popped. Take one slow breath.'
      : `Popped ${popped} of ${COUNT}. Pop as many as you like.`;
    field.replaceChildren(...bubbles.filter((b) => !b.popped).map((b) => {
      const node = el('button', {
        type: 'button',
        class: 'pop-bubble',
        'aria-label': 'Pop this bubble',
        onClick: () => { b.popped = true; draw(); },
      });
      Object.assign(node.style, {
        left: `${b.x}%`,
        top: `${b.y}%`,
        width: `${b.size}px`,
        height: `${b.size}px`,
        background: b.color,
      });
      return node;
    }));
  };

  draw();
  return el('div', { class: 'fun-panel' },
    label,
    field,
    el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { bubbles = makeBubbles(); draw(); } }, 'New bubbles'));
}

function renderGarden() {
  const CELLS = 20;
  const STAGES = [
    { label: 'Empty soil', symbol: '' },
    { label: 'Sprout', symbol: '•' },
    { label: 'Bud', symbol: '✿' },
    { label: 'In bloom', symbol: '❀' },
  ];
  let cells = Array(CELLS).fill(0);
  const label = el('p', { class: 'fun-label', 'aria-live': 'polite' });
  const grid = el('div', { class: 'garden-grid' });

  const draw = () => {
    const blooms = cells.filter((c) => c === 3).length;
    label.textContent = blooms === 0
      ? 'Tap a patch of soil to plant something.'
      : `${blooms} ${blooms === 1 ? 'flower is' : 'flowers are'} blooming. Tap a flower to start again.`;
    grid.replaceChildren(...cells.map((stage, i) =>
      el('button', {
        type: 'button',
        class: `garden-cell garden-cell--${stage}`,
        'aria-label': `Patch ${i + 1}: ${STAGES[stage].label}`,
        onClick: () => { cells[i] = (cells[i] + 1) % 4; draw(); },
      }, el('span', { 'aria-hidden': 'true' }, STAGES[stage].symbol))));
  };

  draw();
  return el('div', { class: 'fun-panel' },
    label,
    grid,
    el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { cells = Array(CELLS).fill(0); draw(); } }, 'Clear garden'));
}

function renderColorGame() {
  const PALETTE = ['#f9d3e0', '#d3f3e4', '#d9ccf7', '#ffe2cc', '#fff1b8', '#cfe8fb'];
  const SIZE = 25;
  let chosen = 0;
  let tiles = Array(SIZE).fill(null);
  const palette = el('div', { class: 'palette', role: 'group', 'aria-label': 'Choose a colour' });
  const grid = el('div', { class: 'tile-grid' });

  const draw = () => {
    palette.replaceChildren(...PALETTE.map((color, i) => {
      const swatch = el('button', {
        type: 'button',
        class: `swatch${chosen === i ? ' is-chosen' : ''}`,
        'aria-label': `Colour ${i + 1}`,
        'aria-pressed': String(chosen === i),
        onClick: () => { chosen = i; draw(); },
      });
      swatch.style.background = color;
      return swatch;
    }));
    grid.replaceChildren(...tiles.map((color, i) => {
      const tile = el('button', {
        type: 'button',
        class: 'tile',
        'aria-label': `Tile ${i + 1}${color ? ' coloured' : ' blank'}`,
        onClick: () => { tiles[i] = PALETTE[chosen]; draw(); },
      });
      tile.style.background = color || 'var(--surface)';
      return tile;
    }));
  };

  draw();
  return el('div', { class: 'fun-panel' },
    el('p', { class: 'fun-label' }, 'Pick a colour, then tap the tiles. Colour freely.'),
    palette,
    grid,
    el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { tiles = Array(SIZE).fill(null); draw(); } }, 'Clear canvas'));
}

function renderMoodMatch() {
  const FEELINGS = [
    { word: 'Calm', emoji: '😌' },
    { word: 'Happy', emoji: '😊' },
    { word: 'Tired', emoji: '😴' },
    { word: 'Anxious', emoji: '😟' },
    { word: 'Sad', emoji: '😢' },
  ];
  const ROUNDS = 5;

  const pickRound = (prev) => {
    let target;
    do {
      target = FEELINGS[Math.floor(Math.random() * FEELINGS.length)];
    } while (prev && prev.target.word === target.word);
    const others = FEELINGS.filter((f) => f.word !== target.word).sort(() => Math.random() - 0.5).slice(0, 2);
    return { target, options: [target, ...others].sort(() => Math.random() - 0.5) };
  };

  let round = pickRound(null);
  let count = 1;
  let picked = null;
  const box = el('div', { class: 'fun-panel' });

  const draw = () => {
    if (count > ROUNDS) {
      box.replaceChildren(
        el('p', { class: 'fun-label' }, `You explored ${ROUNDS} feelings. Every one of them is worth noticing.`),
        el('button', { type: 'button', class: 'btn btn--primary', onClick: () => { count = 1; picked = null; draw(); } }, 'Play again'));
      return;
    }
    const correct = picked && picked.word === round.target.word;
    box.replaceChildren(
      el('p', { class: 'progress-text' }, `Round ${count} of ${ROUNDS}`),
      el('p', { class: 'fun-label' }, 'Which face matches ', el('strong', null, round.target.word), '?'),
      el('div', { class: 'match-options' },
        round.options.map((o) => el('button', {
          type: 'button',
          class: `match-option${picked === o ? ' is-picked' : ''}`,
          'aria-label': `${o.word} face`,
          disabled: !!picked,
          onClick: () => { picked = o; draw(); },
        }, o.emoji))),
      picked ? el('p', { class: 'fun-label', role: 'status' }, correct ? 'Nice match!' : "Not quite, and that's fine. Feelings can be hard to name.") : null,
      picked ? el('button', {
        type: 'button',
        class: 'btn btn--primary',
        onClick: () => { round = pickRound(round); count++; picked = null; draw(); },
      }, 'Next') : null);
  };

  draw();
  return box;
}

function renderKindWords() {
  const WORDS = [
    "Feeling low doesn't mean something is wrong with you.",
    'You are allowed to take things slowly today.',
    "It's okay not to have the words yet.",
    'Small kindness to yourself counts.',
    "You don't have to be okay right now to be worth caring for.",
    'Rest, water, or a warm drink are all good choices.',
  ];
  let index = -1;
  const box = el('div', { class: 'fun-panel' });

  const draw = () => {
    box.replaceChildren(
      index === -1
        ? el('p', { class: 'fun-label' }, "Tap the button when you'd like a gentle word. Take them one at a time.")
        : el('p', { class: 'kind-word', 'aria-live': 'polite' }, WORDS[index]),
      el('button', {
        type: 'button',
        class: 'btn btn--primary',
        onClick: () => { index = (index + 1) % WORDS.length; draw(); },
      }, index === -1 ? 'Show me a kind word' : 'Another kind word'),
      el('p', { class: 'muted small' }, 'These are general reminders, not advice for your situation.'));
  };

  draw();
  return box;
}

function renderTapRelease() {
  const TARGET = 15;
  const COLORS = ['#f9d3e0', '#ffe2cc', '#d9ccf7', '#fff1b8'];
  let taps = 0;
  const pending = new Set();
  onDispose(() => pending.forEach((t) => clearTimeout(t)));

  const label = el('p', { class: 'fun-label', 'aria-live': 'polite' },
    `Tap as many times as you like. 0 of ${TARGET} released.`);
  const zone = el('div', { class: 'release-zone' });
  const wrap = el('div', { class: 'tap-wrap' }, zone);
  zone.append(el('button', {
    type: 'button',
    class: 'release-button',
    'aria-label': 'Release tension',
    onClick: release,
  }, 'Tap to release'));

  function release() {
    taps++;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spark = el('span', { class: 'spark', 'aria-hidden': 'true' });
      spark.style.background = COLORS[i % COLORS.length];
      spark.style.setProperty('--dx', `${Math.cos(angle) * 90}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * 90}px`);
      zone.append(spark);
      const t = setTimeout(() => { spark.remove(); pending.delete(t); }, 700);
      pending.add(t);
    }
    if (taps >= TARGET) {
      label.textContent = "Nice release. Let's slow things down now.";
      wrap.replaceChildren(renderBreathingBubble());
    } else {
      label.textContent = `Tap as many times as you like. ${taps} of ${TARGET} released.`;
    }
  }

  return el('div', { class: 'fun-panel' }, label, wrap);
}

function renderOneStep() {
  const STEPS = [
    "Stand up and stretch your arms for ten seconds.",
    "Drink a glass of water, or a few sips if that's all you can manage.",
    'Put one thing back where it belongs.',
    'Set a two-minute timer and write one line about what is on your mind.',
    'Look out of a window or at the sky for a moment.',
  ];
  let index = 0;
  const box = el('div', { class: 'fun-panel' });

  const draw = () => {
    if (index >= STEPS.length) {
      box.replaceChildren(
        el('p', { class: 'fun-label' }, 'You took things one step at a time. That counts.'),
        el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { index = 0; draw(); } }, 'Start again'));
      return;
    }
    const next = () => { index++; draw(); };
    box.replaceChildren(
      el('p', { class: 'progress-text' }, `Step ${index + 1} of ${STEPS.length}`),
      el('p', { class: 'step-card' }, STEPS[index]),
      el('p', { class: 'muted small' }, 'Only this one. The rest can wait.'),
      el('div', { class: 'page-actions' },
        el('button', { type: 'button', class: 'btn btn--ghost', onClick: next }, 'Skip'),
        el('button', { type: 'button', class: 'btn btn--primary', onClick: next }, 'Done')));
  };

  draw();
  return box;
}

function renderRestTimer({ seconds, intro, prompts }) {
  let left = seconds;
  let running = false;
  let interval = null;

  const stop = () => {
    clearInterval(interval);
    interval = null;
    running = false;
  };
  onDispose(stop);

  const timer = el('div', { class: 'timer', 'aria-live': 'polite' });
  const fill = el('div', { class: 'progress-fill' });
  const prompt = el('p', { class: 'fun-label' });
  const controls = el('div', { class: 'page-actions' });

  const draw = () => {
    const elapsed = seconds - left;
    timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    fill.style.width = `${(elapsed / seconds) * 100}%`;
    const idx = Math.min(Math.floor((elapsed / seconds) * prompts.length), prompts.length - 1);
    prompt.textContent = left === 0 ? 'Time is up. Nothing needs to change right now.' : prompts[idx];
    controls.replaceChildren();
    if (left !== 0) {
      controls.append(running
        ? el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { stop(); draw(); } }, 'Pause')
        : el('button', { type: 'button', class: 'btn btn--primary', onClick: start }, elapsed > 0 ? 'Resume' : 'Start'));
    }
    controls.append(el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { stop(); left = seconds; draw(); } }, 'Reset'));
  };

  function start() {
    running = true;
    clearInterval(interval);
    interval = setInterval(() => {
      left = Math.max(0, left - 1);
      if (left === 0) stop();
      draw();
    }, 1000);
    draw();
  }

  draw();
  return el('div', { class: 'fun-panel' },
    el('p', { class: 'fun-label' }, intro),
    timer,
    el('div', { class: 'progress-track', 'aria-hidden': 'true' }, fill),
    prompt,
    controls);
}

function renderFloatingShapes() {
  const SHAPES = [
    { id: 1, size: 70, left: 8, top: 12, color: '#f9d3e0', delay: 0 },
    { id: 2, size: 96, left: 62, top: 8, color: '#d3f3e4', delay: 1.2 },
    { id: 3, size: 60, left: 30, top: 48, color: '#d9ccf7', delay: 0.6 },
    { id: 4, size: 84, left: 74, top: 52, color: '#ffe2cc', delay: 2 },
    { id: 5, size: 50, left: 14, top: 72, color: '#fff1b8', delay: 1.6 },
    { id: 6, size: 66, left: 48, top: 76, color: '#cfe8fb', delay: 0.3 },
  ];
  const big = {};
  let paused = false;
  const field = el('div', { class: 'shape-field' });

  const nodes = SHAPES.map((s) => {
    const node = el('button', {
      type: 'button',
      class: 'shape',
      'aria-label': 'Gently grow this shape',
      onClick: () => { big[s.id] = !big[s.id]; sync(); },
    });
    Object.assign(node.style, {
      left: `${s.left}%`,
      top: `${s.top}%`,
      background: s.color,
      animationDelay: `${s.delay}s`,
    });
    field.append(node);
    return { s, node };
  });

  const toggle = el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { paused = !paused; sync(); } }, 'Pause motion');

  function sync() {
    nodes.forEach(({ s, node }) => {
      const size = big[s.id] ? s.size * 1.25 : s.size;
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.classList.toggle('is-paused', paused);
    });
    toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
  }

  sync();
  return el('div', { class: 'fun-panel' },
    el('p', { class: 'fun-label' }, 'Let your eyes wander. Tap any shape if you like.'),
    field,
    toggle);
}

function renderSensory() {
  const SENSES = [
    { id: 'see', label: 'See', emoji: '👀', prompt: 'Find something nearby that has a color you like.' },
    { id: 'touch', label: 'Touch', emoji: '✋', prompt: 'Touch something soft or smooth, and notice its texture.' },
    { id: 'hear', label: 'Hear', emoji: '👂', prompt: 'Listen for the quietest sound you can find.' },
    { id: 'smell', label: 'Smell', emoji: '👃', prompt: 'Notice any smell, or think of one you enjoy.' },
    { id: 'taste', label: 'Taste', emoji: '👅', prompt: 'If you have a drink nearby, notice its taste slowly.' },
  ];
  let active = null;
  const explored = new Set();
  const box = el('div', { class: 'fun-panel' });

  const draw = () => {
    const current = SENSES.find((s) => s.id === active);
    box.replaceChildren(
      el('p', { class: 'fun-label' }, 'Choose a sense to explore. You can come back to any of them.'),
      el('div', { class: 'sense-grid' },
        SENSES.map((s) => el('button', {
          type: 'button',
          class: `sense-btn${active === s.id ? ' is-active' : ''}${explored.has(s.id) ? ' is-explored' : ''}`,
          'aria-pressed': String(active === s.id),
          onClick: () => { active = s.id; explored.add(s.id); draw(); },
        }, el('span', { 'aria-hidden': 'true' }, s.emoji), s.label))),
      current ? el('p', { class: 'step-card', 'aria-live': 'polite' }, current.prompt) : null,
      el('p', { class: 'muted small' }, `Explored ${explored.size} of ${SENSES.length} senses.`));
  };

  draw();
  return box;
}

function renderConfetti() {
  const COLORS = ['#f9d3e0', '#ffe2cc', '#d9ccf7', '#d3f3e4', '#fff1b8', '#cfe8fb'];
  let count = 0;
  let timer = null;
  onDispose(() => clearTimeout(timer));

  const layer = el('div', { class: 'confetti-layer', 'aria-hidden': 'true' });
  const status = el('p', { class: 'muted small' });

  const celebrate = () => {
    count++;
    layer.replaceChildren(...Array.from({ length: 36 }, (_, i) => {
      const piece = el('span', { class: 'confetti-piece' });
      Object.assign(piece.style, {
        left: `${Math.random() * 100}%`,
        background: COLORS[i % COLORS.length],
        animationDelay: `${Math.random() * 0.4}s`,
      });
      piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
      return piece;
    }));
    status.textContent = `Celebrated ${count} ${count === 1 ? 'time' : 'times'}.`;
    clearTimeout(timer);
    timer = setTimeout(() => layer.replaceChildren(), 3500);
  };

  return el('div', { class: 'fun-panel confetti-wrap' },
    el('p', { class: 'fun-label' }, 'Celebrate this moment, however big or small it is.'),
    el('button', { type: 'button', class: 'btn btn--primary btn--big', onClick: celebrate }, 'Celebrate 🎉'),
    status,
    layer);
}

function renderHappyMemory() {
  const input = el('textarea', {
    id: 'happy-memory',
    class: 'textarea',
    rows: '4',
    placeholder: 'For example: The sunset on the walk home',
  });
  const status = el('p', { class: 'form-success', role: 'status' });

  const save = () => {
    const text = input.value.trim();
    if (!text) {
      status.textContent = 'Write a few words first, or try again later.';
      return;
    }
    const ok = appendJournal(`Happy memory: ${text}`);
    status.textContent = ok ? 'Saved to your happy memories on this device.' : 'This could not be saved in your browser.';
    if (ok) input.value = '';
  };

  return el('div', { class: 'fun-panel' },
    el('label', { htmlFor: 'happy-memory', class: 'fun-label' }, 'What is one happy memory you want to keep?'),
    input,
    el('div', { class: 'page-actions' }, el('button', { type: 'button', class: 'btn btn--primary', onClick: save }, 'Save memory')),
    status);
}

function renderGoalGame() {
  let goals = [];
  let nextId = 1;
  let confetti = null;

  const input = el('input', { id: 'goal-input', class: 'input', placeholder: 'For example: Reply to one message' });
  const addBtn = el('button', { type: 'submit', class: 'btn btn--primary', disabled: true }, 'Add');
  input.addEventListener('input', () => { addBtn.disabled = !input.value.trim(); });
  const form = el('form', {
    class: 'inline-form',
    onSubmit: (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      goals.push({ id: nextId++, text, done: false });
      input.value = '';
      addBtn.disabled = true;
      draw();
      input.focus();
    },
  },
    el('label', { htmlFor: 'goal-input', class: 'sr-only' }, 'New goal'),
    input,
    addBtn);

  const box = el('div', { class: 'fun-panel' });

  const draw = () => {
    const done = goals.filter((g) => g.done).length;
    const allDone = goals.length > 0 && done === goals.length;
    if (!allDone) confetti = null;
    else if (!confetti) confetti = renderConfetti();

    box.replaceChildren(
      el('p', { class: 'fun-label' }, "Add a small goal, then tap it when it's done."),
      form,
      goals.length ? el('div', { class: 'progress-track', 'aria-hidden': 'true' },
        el('div', { class: 'progress-fill', style: { width: `${(done / goals.length) * 100}%` } })) : null,
      goals.length ? el('p', { class: 'muted small' }, `${done} of ${goals.length} done`) : null,
      goals.length ? el('ul', { class: 'goal-list' }, goals.map((g) =>
        el('li', null, el('button', {
          type: 'button',
          class: `goal-item${g.done ? ' is-done' : ''}`,
          'aria-pressed': String(g.done),
          onClick: () => { g.done = !g.done; draw(); },
        }, el('span', { 'aria-hidden': 'true' }, g.done ? '✅' : '⬜'), ` ${g.text}`)))) : null,
      allDone ? el('p', { class: 'fun-label', role: 'status' }, 'All goals done. Nice work on finishing them.') : null,
      allDone ? confetti : null);
  };

  draw();
  return box;
}

/* ==================== Guided activities (/activity/:id) ==================== */

function renderGrounding(onFinish) {
  let index = 0;
  const box = el('section', { class: 'activity-body', 'aria-label': 'Grounding exercise' });

  const draw = () => {
    const step = GROUNDING_STEPS[index];
    const last = index === GROUNDING_STEPS.length - 1;
    const advance = () => {
      if (last) onFinish();
      else { index++; draw(); }
    };
    box.replaceChildren(
      el('p', { class: 'progress-text' }, `Step ${index + 1} of ${GROUNDING_STEPS.length}`),
      el('h2', { class: 'sense-title' }, step.sense),
      el('p', null, step.prompt),
      el('div', { class: 'page-actions' },
        el('button', { type: 'button', class: 'btn btn--ghost', onClick: advance }, 'Skip this step'),
        el('button', { type: 'button', class: 'btn btn--primary', onClick: advance }, last ? 'Finish' : 'Next')));
  };

  draw();
  return box;
}

function renderCounting(onFinish) {
  let n = 1;
  const box = el('section', { class: 'activity-body', 'aria-label': 'Counting exercise' });

  const draw = () => {
    box.replaceChildren(
      el('p', { class: 'progress-text' }, `Step ${n} of 10`),
      el('div', { class: 'big-number', 'aria-live': 'polite' }, String(n)),
      el('p', { class: 'muted' }, 'Count slowly. Let each number be enough.'),
      el('div', { class: 'page-actions' },
        el('button', {
          type: 'button',
          class: 'btn btn--primary',
          onClick: () => { if (n === 10) onFinish(); else { n++; draw(); } },
        }, n === 10 ? 'Finish' : 'Next')));
  };

  draw();
  return box;
}

function renderBreathingActivity(onFinish) {
  const IN_MS = 4000;
  const OUT_MS = 6000;
  let phase = 'in';
  let paused = false;
  let timer = null;

  const circle = el('div', { class: 'breath-circle is-in', 'aria-hidden': 'true' });
  const label = el('p', { class: 'breath-label', 'aria-live': 'polite' });
  const toggleBtn = el('button', { type: 'button', class: 'btn btn--ghost' }, 'Pause');

  const update = () => {
    circle.className = `breath-circle is-${phase}${paused ? ' is-paused' : ''}`;
    label.textContent = paused
      ? 'Paused. Breathe however feels comfortable.'
      : phase === 'in' ? 'Breathe in gently' : 'Breathe out slowly';
    toggleBtn.textContent = paused ? 'Resume' : 'Pause';
  };

  const schedule = () => {
    clearTimeout(timer);
    if (paused) return;
    timer = setTimeout(() => {
      phase = phase === 'in' ? 'out' : 'in';
      update();
      schedule();
    }, phase === 'in' ? IN_MS : OUT_MS);
  };

  toggleBtn.addEventListener('click', () => {
    paused = !paused;
    update();
    schedule();
  });
  onDispose(() => clearTimeout(timer));

  update();
  schedule();
  return el('section', { class: 'activity-body', 'aria-label': 'Guided breathing' },
    circle,
    label,
    el('p', { class: 'muted' }, 'Breathe at a pace that feels comfortable. You can stop anytime.'),
    el('div', { class: 'page-actions' },
      toggleBtn,
      el('button', { type: 'button', class: 'btn btn--primary', onClick: onFinish }, 'Finish')));
}

function renderJournal(onFinish) {
  let saved = false;
  const textarea = el('textarea', { id: 'journal-text', class: 'textarea', rows: '7', 'aria-describedby': 'journal-note' });
  const msg = el('p', { role: 'status' });
  const finishWrap = el('div', { class: 'page-actions' },
    el('button', { type: 'button', class: 'btn btn--primary', onClick: onFinish }, 'Finish'));
  finishWrap.hidden = true;

  const show = (text, kind) => {
    msg.textContent = text;
    msg.className = kind === 'error' ? 'form-error' : kind === 'ok' ? 'form-success' : '';
  };

  textarea.addEventListener('input', () => {
    if (saved) {
      saved = false;
      finishWrap.hidden = true;
      show('', '');
    }
  });

  const save = () => {
    const text = textarea.value.trim();
    if (!text) {
      show('Write a few words first, or choose "Continue without saving".', 'error');
      return;
    }
    if (appendJournal(text)) {
      saved = true;
      finishWrap.hidden = false;
      show('Saved on this device.', 'ok');
    } else {
      show('This entry could not be saved in your browser. You can copy it somewhere safe.', 'error');
    }
  };

  return el('section', { class: 'activity-body', 'aria-label': 'Journaling' },
    el('label', { htmlFor: 'journal-text', class: 'field-label' }, JOURNAL_PROMPT),
    textarea,
    el('p', { id: 'journal-note', class: 'muted' },
      'Saving stores this entry only in this browser, on this device. It is not sent anywhere. Clearing your browser data will remove it.'),
    msg,
    el('div', { class: 'page-actions' },
      el('button', { type: 'button', class: 'btn btn--primary', onClick: save }, 'Save entry'),
      el('button', {
        type: 'button',
        class: 'btn btn--ghost',
        onClick: () => { textarea.value = ''; saved = false; finishWrap.hidden = true; show('', ''); },
      }, 'Clear text'),
      el('button', { type: 'button', class: 'btn btn--ghost', onClick: onFinish }, 'Continue without saving')),
    finishWrap);
}

function renderTaskBreakdown(onFinish) {
  let nextId = 1;
  let task = '';
  let taskSet = false;
  let steps = [];
  let editingId = null;
  let editText = '';
  const box = el('section', { class: 'activity-body', 'aria-label': 'Task breakdown' });

  // Step 1: enter the task.
  const taskInput = el('input', { id: 'task-input', class: 'input', placeholder: 'For example: Prepare for my presentation' });
  const taskBtn = el('button', { type: 'submit', class: 'btn btn--primary', disabled: true }, 'Break it down');
  taskInput.addEventListener('input', () => { taskBtn.disabled = !taskInput.value.trim(); });
  const taskForm = el('form', {
    class: 'stack',
    onSubmit: (e) => {
      e.preventDefault();
      if (!taskInput.value.trim()) return;
      task = taskInput.value.trim();
      taskSet = true;
      draw();
    },
  },
    el('label', { htmlFor: 'task-input', class: 'field-label' }, 'What task feels like a lot right now?'),
    taskInput,
    el('div', { class: 'page-actions' }, taskBtn));

  // Step 2: add steps.
  const stepInput = el('input', { id: 'step-input', class: 'input', placeholder: 'Add a small step' });
  const stepBtn = el('button', { type: 'submit', class: 'btn btn--primary', disabled: true }, 'Add step');
  stepInput.addEventListener('input', () => { stepBtn.disabled = !stepInput.value.trim(); });
  const stepForm = el('form', {
    class: 'inline-form',
    onSubmit: (e) => {
      e.preventDefault();
      const text = stepInput.value.trim();
      if (!text) return;
      steps.push({ id: nextId++, text, done: false });
      stepInput.value = '';
      stepBtn.disabled = true;
      draw();
      stepInput.focus();
    },
  },
    el('label', { htmlFor: 'step-input', class: 'sr-only' }, 'Add a step'),
    stepInput,
    stepBtn);

  const stepItem = (s) => {
    const editing = editingId === s.id;
    return el('li', { class: `step-item${s.done ? ' is-done' : ''}` },
      el('label', { class: 'step-check' },
        el('input', {
          type: 'checkbox',
          checked: s.done,
          onChange: () => { s.done = !s.done; draw(); },
        }),
        editing
          ? el('input', {
            class: 'input',
            'aria-label': 'Edit step',
            value: editText,
            onInput: (e) => { editText = e.target.value; },
          })
          : el('span', { class: 'step-text' }, s.text)),
      el('div', { class: 'step-actions' },
        editing
          ? el('button', {
            type: 'button',
            class: 'btn btn--ghost',
            onClick: () => {
              if (editText.trim()) s.text = editText.trim();
              editingId = null;
              draw();
            },
          }, 'Save')
          : el('button', {
            type: 'button',
            class: 'btn btn--ghost',
            onClick: () => { editingId = s.id; editText = s.text; draw(); },
          }, 'Edit'),
        el('button', {
          type: 'button',
          class: 'btn btn--ghost',
          onClick: () => {
            steps = steps.filter((x) => x.id !== s.id);
            if (editingId === s.id) editingId = null;
            draw();
          },
        }, 'Delete')));
  };

  const draw = () => {
    if (!taskSet) {
      box.replaceChildren(taskForm);
      return;
    }
    const doneCount = steps.filter((s) => s.done).length;
    box.replaceChildren(
      el('p', { class: 'field-label' }, `Task: ${task}`),
      el('p', { class: 'muted' },
        `Add small steps. Pick the first one and ignore the rest for now.${steps.length ? ` ${doneCount} of ${steps.length} done.` : ''}`),
      stepForm,
      steps.length === 0 ? el('p', { class: 'muted' }, 'No steps yet. Start with the smallest thing you can do.') : null,
      el('ul', { class: 'step-list' }, steps.map(stepItem)),
      el('div', { class: 'page-actions' }, el('button', { type: 'button', class: 'btn btn--primary', onClick: onFinish }, 'Finish')));
  };

  draw();
  return box;
}

function renderCreative(onFinish) {
  let index = Math.floor(Math.random() * CREATIVE_PROMPTS.length);
  const box = el('section', { class: 'activity-body', 'aria-label': 'Creative reset' });

  const draw = () => {
    box.replaceChildren(
      el('p', { class: 'field-label' }, 'A small creative prompt'),
      el('p', { class: 'prompt-text' }, CREATIVE_PROMPTS[index]),
      el('p', { class: 'muted' }, 'There is no right way to do this. It can be done in your head or on paper.'),
      el('div', { class: 'page-actions' },
        el('button', {
          type: 'button',
          class: 'btn btn--ghost',
          onClick: () => {
            let i = Math.floor(Math.random() * CREATIVE_PROMPTS.length);
            if (CREATIVE_PROMPTS.length > 1 && i === index) i = (i + 1) % CREATIVE_PROMPTS.length;
            index = i;
            draw();
          },
        }, 'Another prompt'),
        el('button', { type: 'button', class: 'btn btn--primary', onClick: onFinish }, 'Finish')));
  };

  draw();
  return box;
}

function renderMovement(onFinish) {
  return el('section', { class: 'activity-body', 'aria-label': 'Gentle movement' },
    el('p', { class: 'muted' }, MOVEMENT_NOTE),
    el('ul', { class: 'plain-list' }, MOVEMENT_OPTIONS.map((m) => el('li', null, m))),
    el('div', { class: 'page-actions' }, el('button', { type: 'button', class: 'btn btn--primary', onClick: onFinish }, 'Finish')));
}

function renderPositive(onFinish) {
  return el('section', { class: 'activity-body', 'aria-label': 'Positive reflection' },
    el('label', { htmlFor: 'positive-text', class: 'field-label' }, POSITIVE_PROMPT),
    el('textarea', { id: 'positive-text', class: 'textarea', rows: '5', placeholder: 'Optional. Write as much or as little as you like.' }),
    el('p', { class: 'muted' }, 'This reflection is not saved in this version. It stays on your screen only.'),
    el('div', { class: 'page-actions' }, el('button', { type: 'button', class: 'btn btn--primary', onClick: onFinish }, 'Finish')));
}

function renderGeneric(content, onFinish) {
  return el('section', { class: 'activity-body', 'aria-label': content.title },
    el('p', { class: 'muted' }, content.intro),
    el('ol', { class: 'plain-list' }, content.steps.map((s) => el('li', null, s))),
    el('div', { class: 'page-actions' }, el('button', { type: 'button', class: 'btn btn--primary', onClick: onFinish }, 'Finish')));
}

// Feedback after a guided activity. Saves a helpful / not-helpful rating when asked.
function renderFeedbackStep({ emotionId, activityId }) {
  let choice = null;
  let rated = null;
  const anotherHref = emotionId ? `#/activities/${emotionId}` : '#/';
  const box = el('section', { class: 'card feedback', 'aria-labelledby': 'feedback-heading' });

  const draw = () => {
    box.replaceChildren(
      el('h2', { id: 'feedback-heading', class: 'section-title' }, 'How are you feeling now?'),
      el('p', { class: 'section-subtitle' }, 'Optional. Choose one, or skip it.'),
      el('div', { class: 'feedback-options', role: 'group', 'aria-label': 'How you feel now' },
        ACTIVITY_FEEDBACK.map((o) => el('button', {
          type: 'button',
          class: `feedback-option${choice === o.id ? ' is-selected' : ''}`,
          'aria-pressed': String(choice === o.id),
          onClick: () => { choice = o.id; draw(); },
        }, o.label))),
      choice ? el('p', { class: 'feedback-response', role: 'status' }, ACTIVITY_FEEDBACK_RESPONSES[choice]) : null,
      choice && activityId
        ? el('div', { class: 'rating-block' },
          el('p', { class: 'field-label' }, 'Did this activity help you?'),
          rated === null
            ? el('div', { class: 'page-actions' },
              el('button', { type: 'button', class: 'btn btn--primary', onClick: () => { recordRating(activityId, true); rated = true; draw(); } }, 'Yes, it helped'),
              el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { recordRating(activityId, false); rated = false; draw(); } }, 'Not really'))
            : el('p', { class: 'form-success', role: 'status' }, 'Thanks. Your answer is saved on this device and will shape future suggestions.'))
        : null,
      el('div', { class: 'page-actions' },
        el('a', { class: 'btn btn--primary', href: '#/' }, 'Finish for now'),
        el('a', { class: 'btn btn--ghost', href: anotherHref }, 'Try another activity'),
        el('a', { class: 'btn btn--ghost', href: '#/' }, 'Return home'),
        el('a', { class: `btn ${choice === 'worse' ? 'btn--urgent' : 'btn--urgent-soft'}`, href: '#/urgent-help' }, 'Get urgent help')));
  };

  draw();
  return box;
}

function renderActivity(activityId, query) {
  const root = document.getElementById('activity-root');
  const activity = ACTIVITIES[activityId];
  if (!activity) {
    root.replaceChildren(notFoundCard("We couldn't find that activity.", '#/', 'Return home'));
    return;
  }

  const from = query.from || null;
  const generic = GENERIC_STEPS[activity.id];
  const screens = {
    counting: renderCounting,
    breathing: renderBreathingActivity,
    grounding: renderGrounding,
    journaling: renderJournal,
    taskBreakdown: renderTaskBreakdown,
    creative: renderCreative,
    movement: renderMovement,
    positive: renderPositive,
  };

  let stage = 'activity';
  const box = el('div', { class: 'page' });

  function end() {
    stage = 'feedback';
    draw();
  }

  const draw = () => {
    disposeAll();
    const body = stage === 'activity'
      ? [
        el('div', { class: 'card activity-panel' },
          screens[activity.id] ? screens[activity.id](end) : renderGeneric(generic, end)),
        el('div', { class: 'page-actions' },
          el('button', { type: 'button', class: 'btn btn--ghost', onClick: end }, 'Stop'),
          el('span', { class: 'muted' }, 'You can stop at any point. Nothing is required.')),
      ]
      : [renderFeedbackStep({ emotionId: from, activityId: activity.id })];

    box.replaceChildren(
      el('div', { class: 'page-actions' },
        el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => goBack('#/') }, '← Back')),
      el('header', { class: 'page-header' },
        el('p', { class: 'eyebrow' }, activity.duration),
        el('h1', null, activity.name)),
      ...body);
  };

  draw();
  root.replaceChildren(box);
}

/* ==================== Activity recommendations (/activities/:id) ==================== */

function activityCard(activity, emotionId, saved, helpedBefore, onToggleSave) {
  return el('article', { class: 'activity-card' },
    helpedBefore ? el('span', { class: 'helped-badge' }, 'Helped you before') : null,
    el('h3', { class: 'activity-card__title' }, activity.name),
    el('p', { class: 'activity-card__desc' }, activity.description),
    el('p', { class: 'activity-card__meta' }, `Estimated time: ${activity.duration}`),
    el('div', { class: 'activity-card__actions' },
      el('a', { class: 'btn btn--primary', href: `#/activity/${activity.id}?from=${emotionId}` }, 'Try this'),
      el('button', { type: 'button', class: 'btn btn--ghost', 'aria-pressed': String(saved), onClick: onToggleSave },
        saved ? 'Saved for later' : 'Save for later')));
}

function renderActivities(emotionId) {
  const root = document.getElementById('activities-root');
  const emotion = getEmotion(emotionId);
  if (!emotion) {
    root.replaceChildren(notFoundCard("We couldn't find that feeling.", '#/', 'Back to emotion selection', 'Choose one from the list to see activities.'));
    return;
  }

  let shown = getActivitiesForEmotion(emotion.id);
  let shownIds = shown.map((a) => a.id);
  let savedIds = loadJSON(STORAGE_KEYS.savedActivities, []);
  if (!Array.isArray(savedIds)) savedIds = [];
  const box = el('div', { class: 'page' });

  const draw = () => {
    const ratings = loadRatings();
    box.replaceChildren(
      el('div', { class: 'page-actions' },
        el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => goBack('#/') }, '← Back')),
      el('header', { class: 'page-header' },
        el('p', { class: 'eyebrow' }, `Feeling ${emotion.label.toLowerCase()}`),
        el('h1', null, 'Gentle activities for right now'),
        el('p', { class: 'section-subtitle' }, 'These are suggestions, not instructions. Pick one, change it, or skip them all.')),
      el('div', { class: 'activity-grid' }, shown.map((a) => activityCard(
        a,
        emotion.id,
        savedIds.includes(a.id),
        (ratings[a.id] && ratings[a.id].helped > 0) || false,
        () => {
          savedIds = savedIds.includes(a.id) ? savedIds.filter((x) => x !== a.id) : [...savedIds, a.id];
          saveJSON(STORAGE_KEYS.savedActivities, savedIds);
          draw();
        }))),
      el('div', { class: 'page-actions' },
        el('button', {
          type: 'button',
          class: 'btn btn--ghost',
          onClick: () => {
            const next = getDifferentActivities(emotion.id, shownIds);
            shown = next;
            shownIds = [...new Set([...shownIds, ...next.map((a) => a.id)])];
            draw();
          },
        }, 'Show different activities'),
        el('a', { class: 'btn btn--ghost', href: '#/' }, 'Choose another emotion'),
        el('a', { class: 'btn btn--urgent-soft', href: '#/urgent-help' }, 'I need urgent help')),
      el('p', { class: 'muted' }, 'Feeling like none of these fit? You can choose another emotion any time. Nothing here is required.'));
  };

  draw();
  root.replaceChildren(box);
}

/* ==================== My Mood (/mood) ==================== */

function renderMood() {
  const root = document.getElementById('mood-root');
  const st = {
    entries: loadEntries(),
    emotionId: null,
    note: '',
    message: '',
    ok: true,
    filterEmotion: 'all',
    filterDays: 'all',
    confirmClear: false,
  };

  const refresh = () => { st.entries = loadEntries(); };

  const save = () => {
    if (!st.emotionId) {
      st.message = 'Choose how you feel first, then save.';
      st.ok = false;
      draw();
      return;
    }
    addEntry(st.emotionId, st.note);
    st.emotionId = null;
    st.note = '';
    st.message = 'Check-in saved on this device.';
    st.ok = true;
    refresh();
    draw();
  };

  const clearAll = () => {
    saveJSON(STORAGE_KEYS.moodEntries, []);
    st.confirmClear = false;
    st.message = 'Your history was cleared.';
    st.ok = true;
    refresh();
    draw();
  };

  const checkinCard = () => el('section', { class: 'card stack-lg', 'aria-labelledby': 'checkin-heading' },
    el('h2', { id: 'checkin-heading', class: 'card-title' }, 'How are you feeling right now?'),
    el('div', { class: 'chip-grid', role: 'group', 'aria-label': 'Choose an emotion' },
      EMOTIONS.map((e) => el('button', {
        type: 'button',
        class: `chip${st.emotionId === e.id ? ' is-selected' : ''}`,
        'aria-pressed': String(st.emotionId === e.id),
        onClick: () => { st.emotionId = e.id; draw(); },
      }, e.label))),
    el('label', { htmlFor: 'mood-note', class: 'field-label' }, 'Add a note (optional)'),
    el('textarea', {
      id: 'mood-note',
      class: 'textarea',
      rows: '3',
      placeholder: "Anything you'd like to remember about this moment",
      value: st.note,
      onInput: (e) => { st.note = e.target.value; },
    }),
    el('div', { class: 'page-actions' }, el('button', { type: 'button', class: 'btn btn--primary', onClick: save }, 'Save check-in')),
    st.message ? el('p', { class: st.ok ? 'form-success' : 'form-error', role: 'status' }, st.message) : null);

  const emptyCard = () => el('section', { class: 'card empty-state' },
    el('h2', { class: 'card-title' }, 'Your space is ready whenever you want to check in.'),
    el('p', { class: 'muted' }, "There's no need to track every day."));

  const chartCard = () => {
    const daily = dailyCounts(st.entries, 14);
    const max = Math.max(1, ...daily.map((d) => d.count));
    return el('section', { class: 'card', 'aria-labelledby': 'chart-heading' },
      el('h2', { id: 'chart-heading', class: 'card-title' }, 'Check-ins over the last 14 days'),
      el('p', { class: 'muted' }, 'Each bar is the number of check-ins you saved that day.'),
      el('div', { class: 'bar-chart', role: 'img', 'aria-label': 'Bar chart of check-ins per day' },
        daily.map((d) => {
          const bar = el('div', { class: 'bar' });
          bar.style.height = `${(d.count / max) * 100}%`;
          return el('div', { class: 'bar-col' },
            el('span', { class: 'bar-count' }, d.count ? String(d.count) : ''),
            bar,
            el('span', { class: 'bar-label' }, String(d.label)));
        })));
  };

  const historyCard = () => {
    const visible = filterEntries(st.entries, { emotionId: st.filterEmotion, days: st.filterDays });
    const emotionSelect = el('select', {
      id: 'filter-emotion',
      onChange: (e) => { st.filterEmotion = e.target.value; draw(); },
    },
      el('option', { value: 'all' }, 'All emotions'),
      EMOTIONS.map((e) => el('option', { value: e.id }, e.label)));
    const daysSelect = el('select', {
      id: 'filter-days',
      onChange: (e) => { st.filterDays = e.target.value; draw(); },
    },
      el('option', { value: 'all' }, 'All time'),
      el('option', { value: '7' }, 'Last 7 days'),
      el('option', { value: '30' }, 'Last 30 days'));
    emotionSelect.value = st.filterEmotion;
    daysSelect.value = st.filterDays;

    return el('section', { class: 'card', 'aria-labelledby': 'history-heading' },
      el('h2', { id: 'history-heading', class: 'card-title' }, 'History'),
      el('div', { class: 'filters' },
        el('label', { class: 'filter' }, el('span', null, 'Emotion'), emotionSelect),
        el('label', { class: 'filter' }, el('span', null, 'Date'), daysSelect)),
      visible.length === 0
        ? el('p', { class: 'muted' }, 'No check-ins match these filters.')
        : el('ul', { class: 'history-list' }, visible.map((e) => {
          const emotion = getEmotion(e.emotionId);
          return el('li', { class: 'history-item' },
            el('div', null,
              el('p', { class: 'history-emotion' }, emotion ? emotion.label : 'Unknown'),
              el('p', { class: 'muted small' }, formatDateTime(e.createdAt)),
              e.note ? el('p', { class: 'history-note' }, e.note) : null),
            el('div', { class: 'history-actions' },
              emotion ? el('a', { class: 'btn btn--ghost', href: `#/activities/${emotion.id}` }, 'Activities') : null,
              el('button', {
                type: 'button',
                class: 'btn btn--ghost',
                onClick: () => { deleteEntry(e.id); refresh(); draw(); },
              }, 'Delete')));
        })),
      el('div', { class: 'danger-zone' },
        st.confirmClear
          ? [
            el('p', null, `Clear all ${st.entries.length} check-ins? This cannot be undone.`),
            el('div', { class: 'page-actions' },
              el('button', { type: 'button', class: 'btn btn--danger', onClick: clearAll }, 'Yes, clear all'),
              el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { st.confirmClear = false; draw(); } }, 'Keep them')),
          ]
          : el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { st.confirmClear = true; draw(); } }, 'Clear all history')));
  };

  const draw = () => {
    root.replaceChildren(
      checkinCard(),
      ...(st.entries.length === 0 ? [emptyCard()] : [chartCard(), historyCard()]));
  };

  draw();
}

/* ==================== My Insights (/insights) ==================== */

function renderInsights() {
  const root = document.getElementById('insights-root');
  const entries = loadEntries();

  if (entries.length === 0) {
    root.replaceChildren(el('section', { class: 'card empty-state' },
      el('h2', { class: 'card-title' }, 'Not enough check-ins yet.'),
      el('p', { class: 'muted' }, "Insights appear after you save a few check-ins on My Mood. Until then, there's nothing to read into."),
      el('a', { class: 'btn btn--primary', href: '#/mood' }, 'Go to My Mood')));
    return;
  }

  const ratings = loadRatings();
  const overall = countByEmotion(entries);
  const week = countByEmotion(filterEntries(entries, { days: '7' }));
  const topWeek = week[0];
  const topOverall = overall[0];
  const helpful = Object.entries(ratings)
    .filter(([, r]) => r.helped > 0)
    .sort((a, b) => b[1].helped - a[1].helped)
    .map(([id, r]) => ({ activity: ACTIVITIES[id], helped: r.helped }))
    .filter((x) => x.activity);

  root.replaceChildren(
    el('section', { class: 'stats-row' },
      el('div', { class: 'card stat' },
        el('p', { class: 'stat-number' }, String(entries.length)),
        el('p', { class: 'muted' }, 'check-ins saved')),
      el('div', { class: 'card stat' },
        el('p', { class: 'stat-number' }, String(week.reduce((n, x) => n + x.count, 0))),
        el('p', { class: 'muted' }, 'in the last 7 days'))),

    el('section', { class: 'card', 'aria-labelledby': 'pattern-heading' },
      el('h2', { id: 'pattern-heading', class: 'card-title' }, 'Patterns in your check-ins'),
      topWeek && topWeek.count >= 2
        ? el('p', null,
          "You've recorded ",
          el('strong', null, topWeek.emotion.label.toLowerCase()),
          ` on ${topWeek.count} check-ins this week. Would you like to explore a short activity for that?`)
        : el('p', { class: 'muted' }, 'Not enough check-ins this week to point out a pattern yet.'),
      topOverall ? el('p', { class: 'muted' }, `Most frequent overall: ${topOverall.emotion.label} (${topOverall.count}).`) : null,
      topOverall
        ? el('ul', { class: 'count-list' }, overall.slice(0, 5).map((x) => {
          const bar = el('span', { class: 'count-bar' });
          bar.style.width = `${(x.count / overall[0].count) * 100}%`;
          return el('li', null,
            el('span', null, x.emotion.label),
            el('span', { class: 'count-bar-wrap' }, bar),
            el('span', { class: 'count-num' }, String(x.count)));
        }))
        : null,
      topOverall
        ? el('a', { class: 'btn btn--primary', href: `#/activities/${topOverall.id}` }, `Try activities for ${topOverall.emotion.label.toLowerCase()}`)
        : null),

    el('section', { class: 'card', 'aria-labelledby': 'helpful-heading' },
      el('h2', { id: 'helpful-heading', class: 'card-title' }, 'Activities you found helpful'),
      helpful.length === 0
        ? el('p', { class: 'muted' }, 'Nothing marked yet. After an activity, tell CONNECT whether it helped, and it will show up here.')
        : el('ul', { class: 'plain-list' }, helpful.map((x) =>
          el('li', null, `${x.activity.name}: marked helpful ${x.helped} ${x.helped === 1 ? 'time' : 'times'}`)))),

    el('section', { class: 'card', 'aria-labelledby': 'recent-heading' },
      el('h2', { id: 'recent-heading', class: 'card-title' }, 'Recent check-ins'),
      el('ul', { class: 'history-list' }, entries.slice(0, 5).map((e) => {
        const emotion = getEmotion(e.emotionId);
        return el('li', { class: 'history-item' },
          el('div', null,
            el('p', { class: 'history-emotion' }, emotion ? emotion.label : 'Unknown'),
            el('p', { class: 'muted small' }, formatDateTime(e.createdAt))));
      })),
      el('a', { class: 'btn btn--ghost', href: '#/mood' }, 'See full history')));
}

/* ==================== Relax (/relax) ==================== */

const RELAX_TABS = {
  breathing: renderBreathingBubble,
  pop: renderPopBubbles,
  garden: renderGarden,
  color: renderColorGame,
  face: renderMoodFace,
  challenge: renderChallenge60,
};

function setRelaxTab(id) {
  disposeAll();
  $$('#relax-tabs [data-tab]').forEach((btn) => {
    const on = btn.dataset.tab === id;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-selected', String(on));
  });
  const panel = document.getElementById('relax-panel');
  panel.setAttribute('aria-labelledby', `tab-${id}`);
  panel.replaceChildren(RELAX_TABS[id]());
}

function renderMoodFace() {
  const LEVELS = [
    { label: 'Very low', curve: -18 },
    { label: 'A bit low', curve: -7 },
    { label: 'Okay', curve: 3 },
    { label: 'Good', curve: 12 },
    { label: 'Great', curve: 20 },
  ];
  const mouth = svgEl('path', { class: 'face-mouth' });
  const svg = svgEl('svg', { viewBox: '0 0 200 200', class: 'mood-face', role: 'img' });
  svg.append(
    svgEl('circle', { cx: 100, cy: 100, r: 88, class: 'face-body' }),
    svgEl('circle', { cx: 72, cy: 112, r: 10, class: 'face-cheek' }),
    svgEl('circle', { cx: 128, cy: 112, r: 10, class: 'face-cheek' }),
    svgEl('circle', { cx: 76, cy: 90, r: 8, class: 'face-eye' }),
    svgEl('circle', { cx: 124, cy: 90, r: 8, class: 'face-eye' }),
    mouth);

  const label = el('strong', null, LEVELS[2].label);
  const slider = el('input', { type: 'range', id: 'mood-slider', min: '0', max: '4', step: '1', value: '2', class: 'slider' });

  const update = () => {
    const { label: text, curve } = LEVELS[Number(slider.value)];
    mouth.setAttribute('d', `M 62 128 Q 100 ${128 + curve} 138 128`);
    label.textContent = text;
    svg.setAttribute('aria-label', `Face: ${text}`);
  };
  slider.addEventListener('input', update);
  update();

  return el('div', { class: 'fun-panel' },
    svg,
    el('label', { htmlFor: 'mood-slider', class: 'fun-label' }, 'How does your face feel right now? ', label),
    slider,
    el('div', { class: 'slider-scale', 'aria-hidden': 'true' }, el('span', null, 'Very low'), el('span', null, 'Great')));
}

function renderChallenge60() {
  const TOTAL = 60;
  const PROMPTS = [
    'Unclench your jaw and let your shoulders drop.',
    'Breathe in slowly through your nose.',
    'Look at something far away for a moment.',
    'Roll your wrists and stretch your fingers.',
    'Notice three sounds around you.',
    'Let one long breath out, all the way.',
  ];
  let left = TOTAL;
  let running = false;
  let done = false;
  let interval = null;

  const stop = () => {
    clearInterval(interval);
    interval = null;
    running = false;
  };
  onDispose(stop);

  const timer = el('div', { class: 'timer', 'aria-live': 'polite' });
  const fill = el('div', { class: 'progress-fill' });
  const prompt = el('p', { class: 'fun-label' });
  const controls = el('div', { class: 'page-actions' });

  const draw = () => {
    const elapsed = TOTAL - left;
    timer.textContent = String(left);
    timer.setAttribute('aria-label', `${left} seconds left`);
    fill.style.width = `${(elapsed / TOTAL) * 100}%`;
    const promptIndex = Math.min(Math.floor(elapsed / 10), PROMPTS.length - 1);
    prompt.textContent = done
      ? 'You finished the 60 seconds. Nothing needs to change right now.'
      : running || elapsed > 0 ? PROMPTS[promptIndex] : 'One minute. Press start when you are ready.';

    controls.replaceChildren();
    controls.append(running
      ? el('button', { type: 'button', class: 'btn btn--ghost', onClick: () => { stop(); draw(); } }, 'Pause')
      : el('button', { type: 'button', class: 'btn btn--primary', onClick: start }, elapsed > 0 && !done ? 'Resume' : 'Start'));
    if (elapsed > 0) {
      controls.append(el('button', {
        type: 'button',
        class: 'btn btn--ghost',
        onClick: () => { stop(); left = TOTAL; done = false; draw(); },
      }, 'Restart'));
    }
  };

  function start() {
    if (done || left === 0) {
      left = TOTAL;
      done = false;
    }
    running = true;
    clearInterval(interval);
    interval = setInterval(() => {
      left = Math.max(0, left - 1);
      if (left === 0) {
        stop();
        done = true;
      }
      draw();
    }, 1000);
    draw();
  }

  draw();
  return el('div', { class: 'fun-panel' },
    timer,
    el('div', { class: 'progress-track', 'aria-hidden': 'true' }, fill),
    prompt,
    controls);
}

/* ==================== Start the app ==================== */

renderMoodGrid();

$$('#relax-tabs [data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => setRelaxTab(btn.dataset.tab));
});

document.getElementById('skip-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('main').focus();
});

window.addEventListener('hashchange', render);
render();
