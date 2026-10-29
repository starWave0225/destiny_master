import {TRIGRAMS,CARDS,SCENES,ATTRS,LINES,createGame,hexagram,validTargets,preview,playCard,redraw,settle,chooseReward,ending} from './engine.mjs';
const $=id=>document.getElementById(id),KEY='inverse-fate-demo-v1';
let state=restore(),selected=null,first=null,hovered=null,history=[],sound=false,audio=null,toastTimer;
function restore(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===1&&Array.isArray(s.bits)&&s.bits.length===6&&s.bits.every(b=>b===0||b===1)&&s.stage>=0&&s.stage<3&&Array.isArray(s.hand)&&s.hand.every(t=>CARDS[t])&&['play','reward','ending'].includes(s.phase))return s;}catch{}return createGame();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3000);}
function tone(kind='card'){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(kind==='settle'?164:330,audio.currentTime);o.frequency.exponentialRampToValueAtTime(kind==='settle'?82:220,audio.currentTime+.4);g.gain.setValueAtTime(.08,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.7);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.7);}catch{}}
function snapshot(){history.push(structuredClone(state));if(history.length>15)history.shift();}
function resetSelection(){selected=null;first=null;hovered=null;}
function hexTitle(h){return h.pure?`${h.upper.name}为${h.upper.element}`:`${h.upper.element}${h.lower.element}${h.name}`;}
function cardHTML(type,i,reward=false){const c=CARDS[type];return `<button class="game-card ${type==='borrow'?'forbidden ':''}${!reward&&selected===i?'selected ':''}${!reward&&c.cost>state.energy?'unaffordable':''}" data-${reward?'reward':'card'}="${reward?type:i}" aria-label="${c.name}，${c.cost}灵力，${c.desc}" ${!reward?`aria-pressed="${selected===i}"`:''}><span class="card-top"><span class="card-kind">${c.kind}</span><span class="card-cost">${c.cost}</span></span><span class="card-sigil" aria-hidden="true">${c.sigil}</span><span class="card-name">${c.name}</span><span class="card-desc">${c.desc}</span><span class="card-footer">${reward?'点击收入牌组':'逆 命 之 术'}</span></button>`;}
function currentPreview(){if(selected===null)return null;const type=state.hand[selected],c=CARDS[type];if(!c)return null;if(c.target==='none')return preview(state,type);if(hovered===null)return null;return preview(state,type,first===null?[hovered]:[first,hovered]);}
function renderBoard(){
 const s=state,scene=SCENES[s.stage],h=hexagram(s.bits),p=currentPreview(),display=p||h;
 $('hex-name').textContent=hexTitle(display);$('hex-status').textContent=p&&p.name!==h.name?'变卦预览':h.pure?'纯卦':'本卦';
 $('upper-label').textContent=`${display.upper.glyph} 上卦 · ${display.upper.name}${display.upper.element}`;$('lower-label').textContent=`${display.lower.glyph} 下卦 · ${display.lower.name}${display.lower.element}`;
 const type=selected===null?null:s.hand[selected],valid=type&&CARDS[type].target!=='none'?validTargets(s,type,first):[];
 $('hex-lines').innerHTML=[5,4,3,2,1,0].map(i=>{const bit=p?p.bits[i]:s.bits[i];const locked=s.locks.includes(i),will=scene.omen===i&&s.round===1;return `<button class="yao ${bit?'yang':'yin'} ${i===3?'group-gap':''} ${valid.includes(i)?'available':''} ${first===i?'selected-first':''} ${locked?'locked':''} ${will?'omen-target':''} ${p&&p.bits[i]!==s.bits[i]?'preview-change':''}" data-line="${i}" aria-label="${LINES[i]}，${s.bits[i]?'阳爻':'阴爻'}${locked?'，已锁定':''}${will?'，下轮天变':''}" aria-disabled="${!valid.includes(i)}"><span class="yao-name">${LINES[i]}</span><span class="yao-stroke"><i></i><i></i></span><span class="yao-mark">${locked?'▣':will?'✧':'·'}</span></button>`;}).join('');
 $('attributes').innerHTML=ATTRS.map((a,i)=>{const delta=p?p.stats[i]-h.stats[i]:0;return `<div class="attr-row ${scene.attr===i?'needed':''}"><span class="attr-label">${a}</span><div class="attr-track"><div class="attr-fill" style="width:${display.stats[i]/9*100}%"></div></div><span class="attr-value">${display.stats[i]}${delta?`<span class="attr-delta ${delta<0?'minus':''}">${delta>0?'+':''}${delta}</span>`:''}</span></div>`;}).join('');
 $('hex-effect').innerHTML=display.pure?'<strong>同气相求</strong> · 纯卦，三项能力各 +1':`${display.lower.name} · ${display.lower.word}<br>${display.upper.name} · ${display.upper.word}`;
 $('progress-preview').style.width=Math.min(100,(s.progress+display.stats[scene.attr])/scene.goal*100)+'%';
 $('goal-note').textContent=`${p?'预览：':'本轮可得 '}${display.stats[scene.attr]} 点${ATTRS[scene.attr]}`;
 const prompt=$('target-prompt');prompt.classList.toggle('active',selected!==null);
 if(selected===null)prompt.textContent=s.stage===0&&s.round===1&&s.plays===0?'试试「转阴」→ 初爻，守御 5 → 7':'选一张手牌，开始改写命卦';
 else if(CARDS[type].target==='none')prompt.innerHTML=`<button class="apply-btn" id="apply-card">施展此牌 · ${CARDS[type].cost} 灵力</button>`;
 else if(type==='swap')prompt.textContent=first===null?'移爻：先选一根爻':'移爻：再选一根不同阴阳的爻';
 else prompt.textContent=CARDS[type].detail;
}
function render(){
 const s=state,scene=SCENES[s.stage];
 $('hp').innerHTML=`${s.hp}<em>/12</em>`;$('money').innerHTML=`${s.money}<em>文</em>`;$('debt').textContent=s.debt;$('debt').closest('.resource').classList.toggle('has-debt',s.debt>0);
 $('route').innerHTML=SCENES.map((c,i)=>`${i?'<span class="route-line"></span>':''}<div class="route-stop ${i===s.stage?'active':i<s.stage?'done':''}"><span class="node"><span>${i<s.stage?'✓':['壹','贰','叁'][i]}</span></span><span>${c.short}</span></div>`).join('');
 $('scene-place').textContent=scene.place;$('scene-name').textContent=scene.name;$('scene-flavor').textContent=scene.flavor;$('scene-text').textContent=scene.text;
 $('goal-label').textContent=ATTRS[scene.attr]+'破劫';$('round-label').textContent=`第 ${s.round} / 2 轮`;$('progress-number').innerHTML=`${s.progress}<small> / ${scene.goal}</small>`;$('progress-fill').style.width=Math.min(100,s.progress/scene.goal*100)+'%';
 $('omen-text').textContent=s.round===1?(s.locks.includes(scene.omen)?'定爻已护住天机，本轮命卦不会被天变影响。':scene.forecast):'最后一轮。两轮累计达到 12，即可破劫。';
 $('energy').innerHTML=Array.from({length:Math.max(3,s.energy)},(_,i)=>`<span class="orb ${i<s.energy?'full':''}"></span>`).join('');$('energy-num').textContent=s.energy;
 $('deck-count').textContent=`牌库 ${s.deck.length} · 弃牌 ${s.discard.length}`;$('card-counter').textContent=s.hand.length+' / 7 张';
 $('hand').innerHTML=s.hand.map((t,i)=>cardHTML(t,i)).join('');
 $('journal').innerHTML=s.journal.slice(-3).reverse().map(t=>`<p>${t}</p>`).join('');
 $('undo').disabled=!history.length||s.phase!=='play';$('redraw').disabled=s.redrawn||s.money<1||s.phase!=='play';$('settle').disabled=s.phase!=='play'||selected!==null;
 $('settle').innerHTML=`${selected!==null?'出牌或取消选牌':s.round===2?'应劫定命':'顺势应劫'} <span>→</span>`;
 $('hand-hint').textContent=selected===null?'点击选牌，再点爻位 · 悬停预览变化':`已选「${CARDS[s.hand[selected]].name}」· 再点此牌或按 Esc 取消`;
 renderBoard();save();
 if(s.phase==='reward'||s.phase==='ending')showResult();
}
function act(targets=[]){if(selected===null)return;const before=structuredClone(state),type=state.hand[selected],err=playCard(state,selected,targets);if(err){toast(err);return;}history.push(before);resetSelection();tone();render();document.querySelector('.hex-panel').classList.remove('flash');requestAnimationFrame(()=>document.querySelector('.hex-panel').classList.add('flash'));if(type==='borrow')toast('借得 2 灵力；下次应劫将偿还 2 气数。');}
function showResult(){
 const s=state,d=$('result-dialog');
 if(s.phase==='reward'){
  const r=s.summary,c=SCENES[s.stage];
  d.innerHTML=`<div class="result-seal">${r.success?'渡':'劫'}</div><span class="eyebrow">${c.name} · ${r.success?'已破':'涉险而过'}</span><h2>${r.success?'此劫已渡':'险中求生'}</h2><p class="modal-intro">${r.success?c.success:c.failure}</p><div class="result-foot">累计 ${ATTRS[c.attr]} ${r.total} / ${r.goal}　${r.success?'盘缠 +2 · 气数 +1':'气数 −'+r.loss}</div><p class="result-reward-hint">从三张新术中选取一张，收入牌组，继续赶路</p><div class="rewards">${s.rewards.map(t=>cardHTML(t,0,true)).join('')}</div><div class="result-foot">下一劫：${SCENES[s.stage+1].name} · 需要${ATTRS[SCENES[s.stage+1].attr]}</div>`;
 }else{
  const e=ending(s);d.innerHTML=`<div class="result-seal">${e.win?'吉':'易'}</div><span class="eyebrow">寒 门 赶 考 · 命 途 终 章</span><h2>${e.title}</h2><p class="scene-flavor">${e.verse}</p><p class="modal-intro">${e.text}</p><div class="result-stats"><div><strong>${s.cleared}<small>/3</small></strong><span>破劫</span></div><div><strong>${s.plays}</strong><span>改命次数</span></div><div><strong>${s.hp}</strong><span>剩余气数</span></div></div><button class="gold-btn" id="play-again">再逆一次天命 →</button><button class="plain-btn" id="ending-journal" style="margin-top:17px">回看命途手记 ↗</button>`;
 }
 if(!d.open)d.showModal();
}
function restart(){for(const d of document.querySelectorAll('dialog[open]'))d.close();state=createGame();history=[];resetSelection();render();toast('命途重启。你又一次站在了风雨渡口。');}
function openJournal(){$('full-journal').innerHTML=state.journal.map((t,i)=>`<p><span class="eyebrow">${String(i+1).padStart(2,'0')}</span>　${t}</p>`).join('');$('journal-dialog').showModal();}
$('hand').addEventListener('click',e=>{const b=e.target.closest('[data-card]');if(!b||state.phase!=='play')return;const i=Number(b.dataset.card),c=CARDS[state.hand[i]];if(c.cost>state.energy){toast('灵力不足，可以借运或直接应劫。');return;}selected=selected===i?null:i;first=null;hovered=null;render();});
$('hex-lines').addEventListener('click',e=>{const b=e.target.closest('[data-line]');if(!b||selected===null){if(b)toast('先在下方选一张手牌。');return;}const i=Number(b.dataset.line),type=state.hand[selected],c=CARDS[type];if(c.target==='none'){toast('这张牌无需选择爻位，点击「施展此牌」。');return;}if(!validTargets(state,type,first).includes(i)){toast('请选择亮起的爻。');return;}if(c.target==='two'&&first===null){first=i;hovered=null;renderBoard();}else act(first===null?[i]:[first,i]);});
// Update previews without replacing the hovered button, keeping pointer and keyboard focus stable.
function paintPreview(i){if(selected===null)return;const type=state.hand[selected],c=CARDS[type];if(c.target==='none'||!validTargets(state,type,first).includes(i))return;if(c.target==='two'&&first===null)return;hovered=i;const h=hexagram(state.bits),p=currentPreview();if(!p)return;$('hex-name').textContent=hexTitle(p);$('hex-status').textContent='变卦预览';$('upper-label').textContent=`${p.upper.glyph} 上卦 · ${p.upper.name}${p.upper.element}`;$('lower-label').textContent=`${p.lower.glyph} 下卦 · ${p.lower.name}${p.lower.element}`;document.querySelectorAll('[data-line]').forEach(el=>{const j=+el.dataset.line;el.classList.toggle('preview-change',p.bits[j]!==state.bits[j]);el.classList.toggle('yang',p.bits[j]===1);el.classList.toggle('yin',p.bits[j]===0);});document.querySelectorAll('.attr-row').forEach((el,j)=>{const delta=p.stats[j]-h.stats[j];el.querySelector('.attr-fill').style.width=p.stats[j]/9*100+'%';el.querySelector('.attr-value').innerHTML=p.stats[j]+(delta?`<span class="attr-delta ${delta<0?'minus':''}">${delta>0?'+':''}${delta}</span>`:'');});const scene=SCENES[state.stage];$('goal-note').textContent=`预览：${p.stats[scene.attr]} 点${ATTRS[scene.attr]}`;$('progress-preview').style.width=Math.min(100,(state.progress+p.stats[scene.attr])/scene.goal*100)+'%';$('hex-effect').innerHTML=p.pure?'<strong>同气相求</strong> · 纯卦，三项能力各 +1':`${p.lower.name} · ${p.lower.word}<br>${p.upper.name} · ${p.upper.word}`;}
$('hex-lines').addEventListener('pointerover',e=>{const b=e.target.closest('[data-line]');if(b)paintPreview(+b.dataset.line);});
$('hex-lines').addEventListener('focusin',e=>{const b=e.target.closest('[data-line]');if(b)paintPreview(+b.dataset.line);});
$('hex-lines').addEventListener('pointerleave',()=>{if(hovered!==null){hovered=null;renderBoard();}});
$('target-prompt').addEventListener('click',e=>{if(e.target.closest('#apply-card'))act();});
$('settle').addEventListener('click',()=>{if(state.phase!=='play')return;settle(state);history=[];resetSelection();tone('settle');render();document.body.classList.add('settling');setTimeout(()=>document.body.classList.remove('settling'),650);if(state.phase==='play')toast('天时已变，灵力恢复。第二轮开始。');});
$('redraw').addEventListener('click',()=>{const before=structuredClone(state),err=redraw(state);if(err){toast(err);return;}history.push(before);resetSelection();render();tone();});
$('undo').addEventListener('click',()=>{if(!history.length)return;state=history.pop();resetSelection();render();toast('已撤回上一步。');});
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').innerHTML=`♪<span>音效${sound?'开':'关'}</span>`;$('sound').setAttribute('aria-label',sound?'关闭音效':'开启音效');$('sound').title=sound?'关闭音效':'开启音效';if(sound)tone();});
$('help').addEventListener('click',()=>$('help-dialog').showModal());$('trigrams-help').addEventListener('click',()=>$('reference-dialog').showModal());$('journal-open').addEventListener('click',openJournal);$('restart').addEventListener('click',()=>$('restart-dialog').showModal());$('confirm-restart').addEventListener('click',restart);
document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))e.target.closest('dialog').close();if(e.target.closest('#play-again'))restart();if(e.target.closest('#ending-journal'))openJournal();const b=e.target.closest('[data-reward]');if(b){chooseReward(state,b.dataset.reward);history=[];resetSelection();$('result-dialog').close();tone();render();toast('新术入手，下一段命途开启。');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected!==null){resetSelection();render();}});
$('result-dialog').addEventListener('cancel',e=>e.preventDefault());
document.querySelectorAll('dialog:not(#result-dialog)').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('reference-table').innerHTML='<div class="reference-grid reference-head"><span>卦象</span><span>进取</span><span>守御</span><span>洞察</span></div>'+TRIGRAMS.map(t=>`<div class="reference-grid"><span class="trigram-cell"><b>${t.glyph}</b>${t.name} · ${t.element}</span>${t.stats.map(n=>`<span>${n}</span>`).join('')}</div>`).join('');
render();
