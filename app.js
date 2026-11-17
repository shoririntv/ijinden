
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

function cardImageHTML(c) {
  if (c.name === '徳川家康') {
    return `<img
      src="images/tokugawa-ieyasu.PNG"
      alt="${esc(c.name)}"
      style="
        width:100%;
        display:block;
        border-radius:6px;
        object-fit:contain;
      "
      
    >`;
  }

  return `<div style="
    width:100%;
    aspect-ratio:5/7;
    background:#34485a;
    color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:6px;
    font-size:13px;
  ">画像準備中</div>`;
}

function showCardDetailsForCard(card) {

  if (!card) return;

  let modal = document.getElementById('cardDetailModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cardDetailModal';
    document.body.appendChild(modal);
  }

  modal.style.cssText = `
    position:fixed;
    inset:0;
    z-index:10000;
    background:#000c;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:16px;
  `;

  modal.innerHTML = `
    <div style="
      background:#1b2a38;
      color:white;
      border-radius:14px;
      padding:18px;
      width:100%;
      max-width:400px;
      max-height:90vh;
      overflow-y:auto;
      box-sizing:border-box;
    ">
      <h2 style="text-align:center;">カード詳細</h2>

      <div style="width:100%;max-width:260px;margin:0 auto;">
        ${cardImageHTML(card)}
      </div>

      <h3>${esc(card.name)}</h3>
      <p>収録：${esc(card.set)}弾・${esc(card.rarity)}</p>
      <p>色：${esc(card.color)}</p>
      <p>レベル：${esc(card.level)}</p>
      <p>パワー：${esc(card.power)}</p>
      <p>特性：${esc(card.traits)}</p>

      <hr>

      <h3>カード効果</h3>
      <p style="white-space:pre-wrap;line-height:1.7;">
        ${esc(card.text)}
      </p>

      ${card.legacy ? `
        <hr>
        <h3>遺業能力</h3>
        <p style="white-space:pre-wrap;line-height:1.7;">
          ${esc(card.legacy)}
        </p>
      ` : ''}

      <button id="closeCardDetail" style="width:100%;padding:14px;margin-top:12px;">
        閉じる
      </button>
    </div>
  `;

  document.getElementById('closeCardDetail').onclick = () => {
    modal.remove();
  };
}

function openLibraryCardDetails(index) {
  showCardDetailsForCard(cards[index]);
}

function openDeckCardDetails(index) {
  const name = deck[index];
  const card = cards.find(c => c.name === name);
  showCardDetailsForCard(card);
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
    arr.slice(0, 160).map(c => {
      const index = cards.indexOf(c);

      return `
        <div style="
          width:90px;
          margin:3px;
          display:inline-block;
          vertical-align:top;
        ">
          <div
            onclick="openLibraryCardDetails(${index})"
            style="cursor:pointer;"
          >
            ${cardImageHTML(c)}
          </div>

          <button
            onclick="addDeck('${esc(c.name)}')"
            style="width:100%;"
          >
            デッキに追加
          </button>
        </div>
      `;
    }).join('');
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

    return c ? `
      <div style="
        width:90px;
        margin:3px;
        display:inline-block;
        vertical-align:top;
      ">
        <div
          onclick="openDeckCardDetails(${i})"
          style="cursor:pointer;"
        >
          ${cardImageHTML(c)}
        </div>

        <button
          class="secondary"
          onclick="removeDeck(${i})"
          style="width:100%;"
        >
          取り除く
        </button>
      </div>
    ` : '';
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
    const image = c.name === '徳川家康'
      ? 'images/tokugawa-ieyasu.PNG'
      : '';

    const cardView = c._faceDown
      ? `<div style="
           width:100%;
           aspect-ratio:5/7;
           background:#34485a;
           color:white;
           display:flex;
           align-items:center;
           justify-content:center;
           border-radius:6px;
         ">イジンデン</div>`
      : image
        ? `<img src="${image}" alt="${esc(c.name)}" style="
             width:100%;
             display:block;
             border-radius:6px;
           ">`
        : `<div class="card" style="width:100%;box-sizing:border-box;">
             <b>${esc(c.name)}</b>
             <small>画像準備中</small>
           </div>`;

    return `
      <div style="
        width:90px;
        cursor:pointer;
        margin:3px;
      " onclick="cardAction('${zoneName}',${i})">
        <div style="
          transform:rotate(${c._tapped ? 90 : 0}deg);
          transform-origin:center;
        ">
          ${cardView}
        </div>
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
  カード移動
</button>
<button id="detailButton" style="width:100%;padding:13px;margin:5px 0;">
  カード詳細
</button>
<button id="closeButton" style="width:100%;padding:13px;margin:5px 0;">
  閉じる
</button>

    </div>
  `;

  document.getElementById('tapButton').onclick = toggleCardTap;
  document.getElementById('faceButton').onclick = toggleCardFace;
  document.getElementById('moveButton').onclick = showMoveChoices;
document.getElementById('detailButton').onclick = showCardDetails;
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

function showCardDetails() {
  const zones = getZones();
  const card = zones[selectedCard.from][selectedCard.index];

  if (!card) return;

  const menu = document.getElementById('cardMenu');

  const image = card.name === '徳川家康'
    ? `<img
        src="images/tokugawa-ieyasu.PNG"
        alt="${esc(card.name)}"
        style="width:100%;max-width:260px;display:block;margin:0 auto 16px;"
      >`
    : `<div style="
        background:#34485a;
        padding:30px;
        text-align:center;
        border-radius:8px;
        margin-bottom:16px;
      ">画像準備中</div>`;

  menu.innerHTML = `
    <div style="
      background:#1b2a38;
      color:white;
      border:1px solid #526579;
      border-radius:14px;
      padding:20px;
      width:100%;
      max-width:400px;
      max-height:85vh;
      overflow-y:auto;
      box-sizing:border-box;
    ">
      <h2 style="text-align:center;">カード詳細</h2>

      ${image}

      <h3>${esc(card.name)}</h3>

      <p>収録：${esc(card.set)}弾・${esc(card.rarity)}</p>
      <p>色：${esc(card.color)}</p>
      <p>レベル：${esc(card.level)}</p>
      <p>パワー：${esc(card.power)}</p>
      <p>特性：${esc(card.traits)}</p>

      <hr>

      <h3>カード効果</h3>
      <p style="white-space:pre-wrap;line-height:1.7;">
        ${esc(card.text)}
      </p>

      ${card.legacy ? `
        <hr>
        <h3>遺業能力</h3>
        <p style="white-space:pre-wrap;line-height:1.7;">
          ${esc(card.legacy)}
        </p>
      ` : ''}

      <button id="backToMenu" style="width:100%;padding:13px;margin-top:12px;">
        操作メニューに戻る
      </button>

      <button id="detailClose" style="width:100%;padding:13px;margin-top:8px;">
        閉じる
      </button>
    </div>
  `;

  document.getElementById('backToMenu').onclick = renderCardMenu;
  document.getElementById('detailClose').onclick = closeCardMenu;
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
