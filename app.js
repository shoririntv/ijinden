
let cards = [];
let deck = JSON.parse(localStorage.getItem('ijindenDeck') || '[]');

let hand = [];
let field = [];
let guardian = [];
let mana = [];
let haikei = [];
let grave = [];
let drawPile = [];

let selectedCard = null;

fetch('cards.json')
  .then(r => r.json())
  .then(d => {
    cards = d;
    document.getElementById('count').textContent = d.length + ' cards';
    renderCards();
    renderDeck();
  });

function show(id) {
  document.querySelectorAll('main section').forEach(x => x.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}


function cardHTML(c, btn = '') {
  const image = c.name === '徳川家康'
    ? `<img
        src="images/tokugawa-ieyasu.PNG"
        alt="${esc(c.name)}"
        style="width:100%;height:auto;display:block;object-fit:contain;"
      >`
    : '';

  return `<article class="card">
    ${image}
    <small>${esc(c.set)}弾・${esc(c.rarity)}・${esc(c.color)}</small>
    <b>${esc(c.name)}</b>
    <div>
      <span class="tag">Lv.${esc(c.level)}</span>
      <span class="tag">${esc(c.power)}</span>
    </div>
    <small>${esc(c.traits)}</small>
    <p>${esc(c.text)}</p>
    ${c.legacy ? `<small>遺業：${esc(c.legacy)}</small>` : ''}
    ${btn}
  </article>`;
}


function renderCards() {
  let q = (document.getElementById('q')?.value || '').toLowerCase();
  let s = document.getElementById('set')?.value || '';
  let co = document.getElementById('color')?.value || '';

  let arr = cards.filter(c =>
    (!s || c.set === s) &&
    (!co || c.color === co) &&
    (!q || (c.name + c.text + c.traits + c.legacy).toLowerCase().includes(q))
  );

  document.getElementById('hits').textContent = arr.length + '件';

  document.getElementById('cardlist').innerHTML =
    arr.slice(0, 160).map(c =>
      cardHTML(c, `<button onclick="addDeck('${esc(c.name)}')">デッキに追加</button>`)
    ).join('');
}

function addDeck(name) {
  deck.push(name);
  renderDeck();
  toast(name + ' を追加');
}

function renderDeck() {
  document.getElementById('deckcount').textContent = deck.length;

  document.getElementById('decklist').innerHTML = deck.map((n, i) => {
    let c = cards.find(x => x.name === n);
    return c ? cardHTML(c,
      `<button class="secondary" onclick="removeDeck(${i})">取り除く</button>`
    ) : '';
  }).join('');
}

function removeDeck(i) {
  deck.splice(i, 1);
  renderDeck();
}

function saveDeck() {
  localStorage.setItem('ijindenDeck', JSON.stringify(deck));
  localStorage.setItem('ijindenDeckName',
    document.getElementById('deckname').value
  );
  toast('この端末に保存しました');
}

function clearDeck() {
  deck = [];
  renderDeck();
}

function startGame() {
  const saved = JSON.parse(localStorage.getItem('ijindenDeck') || '[]');

  const selected = saved.map(n => {
  const c = cards.find(x =>
    x.name === (typeof n === 'string' ? n : n.name)
  );
  return c ? {
    ...c,
    _tapped: false,
    _faceDown: false
  } : null;
}).filter(Boolean);

  if (!selected.length) {
    toast('保存デッキが空です。先にデッキを保存してね');
    return;
  }

  drawPile = selected.slice();

  for (let i = drawPile.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [drawPile[i], drawPile[j]] = [drawPile[j], drawPile[i]];
  }

  hand = [];
  field = [];
  guardian = [];
  mana = [];
  haikei = [];
  grave = [];

  turn = 1;

  for (let i = 0; i < 5 && drawPile.length; i++) {
    hand.push(drawPile.pop());
  }

  renderBoard();
  toast('保存デッキで対戦開始！');
}

function draw() {
  if (!drawPile.length) {
    toast('山札がありません');
    return;
  }

  hand.push(drawPile.pop());
  renderBoard();
}

function turnEnd() {
  turn++;
  document.getElementById('turnlabel').textContent =
    '自分のターン ' + turn;
  toast('ターン ' + turn);
}

// カードを各ゾーンに表示する

function renderZone(zoneName, elementId, cardsInZone) {
  const element = document.getElementById(elementId);

  element.innerHTML = cardsInZone.map((c, i) => {
    const cardView = c._faceDown
      ? `<article class="card" style="background:#34485a;color:white;justify-content:center;align-items:center">
           <b>イジンデン</b>
           <small>裏向き</small>
         </article>`
      : cardHTML(c);

    return `
      <div style="
        width:120px;
        cursor:pointer;
        transform:rotate(${c._tapped ? 90 : 0}deg);
        transform-origin:center;
        margin:8px;
      " onclick="cardAction('${zoneName}',${i})">
        ${cardView}
        <small style="color:var(--muted)">タップして操作</small>
      </div>
    `;
  }).join('');
}

// 盤面を更新する
function renderBoard() {
  renderZone('hand', 'hand', hand);
  renderZone('field', 'field', field);
  renderZone('guardian', 'guardian', guardian);
  renderZone('mana', 'mana', mana);
  renderZone('haikei', 'haikei', haikei);
  renderZone('grave', 'grave', grave);

  document.getElementById('deckremaining').textContent =
    '残り ' + drawPile.length + ' 枚';
}

// カードの移動先を選ぶ


function cardAction(from, index) {
  selectedCard = { from, index };
  renderCardMenu();
}

function getZones() {
  return { hand, field, guardian, mana, haikei, grave };
}

function renderCardMenu() {
  if (!selectedCard) return;

  const zones = getZones();
  const source = zones[selectedCard.from];
  const card = source?.[selectedCard.index];

  if (!card) {
    closeCardMenu();
    return;
  }

  let menu = document.getElementById('cardMenu');

  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'cardMenu';
    document.body.appendChild(menu);
  }

  menu.style.cssText = `
    position:fixed;
    inset:0;
    z-index:9999;
    background:#000a;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
  `;

  menu.innerHTML = `
    <div style="
      background:#1b2a38;
      color:white;
      border:1px solid #526579;
      border-radius:14px;
      padding:20px;
      width:100%;
      max-width:360px;
      box-sizing:border-box;
    ">
      <h3 style="margin-top:0;">${esc(card.name)}</h3>
      <button id="tapButton" style="width:100%;padding:13px;margin:5px 0;">
        ${card._tapped ? '縦向きにする' : '横向きにする'}
      </button>
      <button id="faceButton" style="width:100%;padding:13px;margin:5px 0;">
        ${card._faceDown ? '表向きにする' : '裏向きにする'}
      </button>
      <button id="moveButton" style="width:100%;padding:13px;margin:5px 0;">
        ゾーン移動
      </button>
      <button id="closeButton" style="width:100%;padding:13px;margin:5px 0;">
        閉じる
      </button>
    </div>
  `;

  document.getElementById('tapButton').onclick = toggleCardTap;
  document.getElementById('faceButton').onclick = toggleCardFace;
  document.getElementById('moveButton').onclick = showMoveChoices;
  document.getElementById('closeButton').onclick = closeCardMenu;
}

function toggleCardTap() {
  const zones = getZones();
  const card = zones[selectedCard.from][selectedCard.index];
  card._tapped = !card._tapped;
  renderBoard();
  renderCardMenu();
}

function toggleCardFace() {
  const zones = getZones();
  const card = zones[selectedCard.from][selectedCard.index];
  card._faceDown = !card._faceDown;
  renderBoard();
  renderCardMenu();
}

function showMoveChoices() {
  const menu = document.getElementById('cardMenu');

  const destinations = [
    ['hand', '手札'],
    ['field', '戦場'],
    ['guardian', 'ガーディアン'],
    ['mana', '魔力ゾーン'],
    ['haikei', 'ハイケイ置き場'],
    ['grave', '墓地'],
    ['drawPile', '山札の上']
  ];

  menu.querySelector('div').innerHTML = `
    <h3 style="margin-top:0;">移動先を選択</h3>
    ${destinations.map(([id, name], i) =>
      `<button data-zone="${id}" style="width:100%;padding:12px;margin:4px 0;">
        ${name}
      </button>`
    ).join('')}
    <button id="backButton" style="width:100%;padding:12px;margin-top:8px;">
      戻る
    </button>
  `;

  menu.querySelectorAll('[data-zone]').forEach(button => {
    button.onclick = () => moveSelectedCard(button.dataset.zone);
  });

  document.getElementById('backButton').onclick = renderCardMenu;
}

function moveSelectedCard(destination) {
  const zones = getZones();
  const from = selectedCard.from;

  if (destination === from) {
    toast('同じゾーンです');
    return;
  }

  const source = zones[from];
  const card = source.splice(selectedCard.index, 1)[0];

  if (destination === 'drawPile') {
    drawPile.push(card);
  } else {
    zones[destination].push(card);
  }

  renderBoard();
  closeCardMenu();
  toast(card.name + ' を移動しました');
}

function closeCardMenu() {
  const menu = document.getElementById('cardMenu');
  if (menu) menu.remove();
  selectedCard = null;
}



function createRoom() {
  let id = Math.random().toString(36).slice(2, 8).toUpperCase();
  document.getElementById('roomid').value = id;
  document.getElementById('roomstatus').textContent =
    'ルーム ' + id + ' を仮作成しました（通信未接続）';
}

function joinRoom() {
  let id = document.getElementById('roomid').value.trim();
  document.getElementById('roomstatus').textContent =
    id ? 'ルーム ' + id + ' への参加画面モックです（通信未接続）'
       : 'ルームIDを入力してください';
}

function toast(s) {
  let t = document.getElementById('toast');
  t.textContent = s;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 1800);
}
