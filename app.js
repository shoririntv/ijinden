let cards=[],deck=JSON.parse(localStorage.getItem('ijindenDeck')||'[]'),hand=[],field=[],drawPile=[],turn=1;
fetch('cards.json').then(r=>r.json()).then(d=>{cards=d;document.getElementById('count').textContent=d.length+' cards';renderCards();renderDeck()});
function show(id){document.querySelectorAll('main section').forEach(x=>x.classList.add('hidden'));document.getElementById(id).classList.remove('hidden')}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function cardHTML(c,btn=''){return `<article class="card"><small>${esc(c.set)}弾・${esc(c.rarity)}・${esc(c.color)}</small><b>${esc(c.name)}</b><div><span class="tag">Lv.${esc(c.level)}</span> <span class="tag">${esc(c.power)}</span></div><small>${esc(c.traits)}</small><p>${esc(c.text)}</p>${c.legacy?`<small>遺業：${esc(c.legacy)}</small>`:''}${btn}</article>`}
function renderCards(){let q=(document.getElementById('q')?.value||'').toLowerCase(),s=document.getElementById('set')?.value||'',co=document.getElementById('color')?.value||'';let arr=cards.filter(c=>(!s||c.set===s)&&(!co||c.color===co)&&(!q||(c.name+c.text+c.traits+c.legacy).toLowerCase().includes(q)));document.getElementById('hits').textContent=arr.length+'件';document.getElementById('cardlist').innerHTML=arr.slice(0,160).map(c=>cardHTML(c,`<button onclick="addDeck('${esc(c.name)}')">デッキに追加</button>`)).join('')}
function addDeck(name){deck.push(name);renderDeck();toast(name+' を追加')}
function renderDeck(){document.getElementById('deckcount').textContent=deck.length;document.getElementById('decklist').innerHTML=deck.map((n,i)=>{let c=cards.find(x=>x.name===n);return c?cardHTML(c,`<button class="secondary" onclick="removeDeck(${i})">取り除く</button>`):''}).join('')}
function removeDeck(i){deck.splice(i,1);renderDeck()}function saveDeck(){localStorage.setItem('ijindenDeck',JSON.stringify(deck));localStorage.setItem('ijindenDeckName',document.getElementById('deckname').value);toast('この端末に保存しました')}
function clearDeck(){deck=[];renderDeck()}

function startGame(){
  const saved=JSON.parse(localStorage.getItem('ijindenDeck')||'[]');
  const selected=saved.map(n=>cards.find(c=>c.name===(typeof n==='string'?n:n.name))).filter(Boolean);

  if(!selected.length){
    toast('保存デッキが空です。先にデッキを保存してね');
    return;
  }

  drawPile=selected.slice();

  for(let i=drawPile.length-1;i>0;i--){
    let j=Math.floor(Math.random()*(i+1));
    [drawPile[i],drawPile[j]]=[drawPile[j],drawPile[i]];
  }

  hand=[];
  field=[];
  turn=1;

  for(let i=0;i<5&&drawPile.length;i++){
    hand.push(drawPile.pop());
  }

  renderBoard();
  toast('保存デッキで対戦開始！');
}

function draw(){
  if(!drawPile.length){
    toast('山札がありません');
    return;
  }

  hand.push(drawPile.pop());
  renderBoard();
}
function turnEnd(){turn++;toast('ターン '+turn+'（テスト）')}
function renderBoard(){document.getElementById('hand').innerHTML=hand.map((c,i)=>`<div style="width:120px" onclick="play(${i})">${cardHTML(c)}</div>`).join('');document.getElementById('field').innerHTML=field.map(c=>`<div style="width:120px">${cardHTML(c)}</div>`).join('')}
function play(i){field.push(hand.splice(i,1)[0]);renderBoard()}
function createRoom(){let id=Math.random().toString(36).slice(2,8).toUpperCase();document.getElementById('roomid').value=id;document.getElementById('roomstatus').textContent='ルーム '+id+' を仮作成しました（通信未接続）';}
function joinRoom(){let id=document.getElementById('roomid').value.trim();document.getElementById('roomstatus').textContent=id?'ルーム '+id+' への参加画面モックです（通信未接続）':'ルームIDを入力してください'}
function toast(s){let t=document.getElementById('toast');t.textContent=s;t.style.display='block';setTimeout(()=>t.style.display='none',1800)}
