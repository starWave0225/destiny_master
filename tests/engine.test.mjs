import assert from 'node:assert/strict';
import {TRIGRAMS,CARDS,SCENES,createGame,hexagram,preview,validTargets,playCard,redraw,settle,chooseReward,ending} from '../src/engine.mjs';
const copy=s=>structuredClone(s);
const allHex=Array.from({length:64},(_,mask)=>hexagram(Array.from({length:6},(_,i)=>(mask>>i)&1)));
assert.equal(new Set(allHex.map(h=>h.name)).size,64);
assert.equal(allHex.filter(h=>h.pure).length,8);
assert(allHex.every(h=>h.stats.every(n=>n>=0&&n<=9)));
assert.equal(hexagram([1,0,0,0,1,0]).name,'屯');
assert.equal(hexagram([0,1,0,1,0,1]).name,'未济');
assert.equal(hexagram([1,0,1,0,1,0]).name,'既济');
assert.deepEqual(createGame(123),createGame(123));
{
 const s=createGame(2),before=copy(s),p=preview(s,'yin',[0]);
 assert.equal(p.stats[1],7);assert.deepEqual(s,before);
 assert.equal(playCard(s,0,[0]),null);assert.equal(s.energy,2);assert.equal(s.hand.length,4);assert.deepEqual(s.bits,p.bits);
 const invalid=copy(s);assert(playCard(s,s.hand.indexOf('yang'),[4]));assert.deepEqual(s,invalid);
 s.energy=0;const empty=copy(s);assert(playCard(s,s.hand.indexOf('flip'),[2]));assert.deepEqual(s,empty);
}
{
 const s=createGame(1);s.hand=['borrow'];assert.equal(playCard(s,0),null);assert.equal(s.energy,5);assert.equal(s.debt,2);
 settle(s);assert.equal(s.hp,10);assert.equal(s.debt,0);assert.equal(s.energy,3);assert.equal(s.round,2);
 const death=createGame(5);death.hp=2;death.hand=['borrow'];playCard(death,0);settle(death);assert.equal(death.phase,'ending');assert.equal(death.hp,0);assert.equal(ending(death).win,false);
}
{
 const s=createGame(4);s.hand=['lock'];const value=s.bits[2];assert.equal(playCard(s,0,[2]),null);settle(s);assert.equal(s.bits[2],value);assert.equal(s.locks.length,0);
 const locked=createGame(4);locked.locks=[0];assert(!validTargets(locked,'flip').includes(0));assert.equal(preview(locked,'lower'),null);
 const before=copy(locked);locked.hand=['lower'];const after=copy(locked);assert(playCard(locked,0));assert.deepEqual(locked,after);assert.equal(before.bits[0],locked.bits[0]);
}
{
 const s=createGame(9);assert.equal(redraw(s),null);assert.equal(s.money,5);assert.equal(s.hand.length,5);const after=copy(s);assert(redraw(s));assert.deepEqual(s,after);
 s.hand=['heal'];s.hp=10;assert.equal(playCard(s,0),null);assert.equal(s.hp,12);
 s.hand=['insight','yin','yin','yin','yang','yang','yang'];const full=copy(s);assert(playCard(s,0));assert.deepEqual(s,full);
}
function options(s){
 const result=[];
 s.hand.forEach((type,i)=>{const c=CARDS[type];if(c.cost>s.energy)return;
  const targets=c.target==='none'?[[]]:c.target==='one'?validTargets(s,type).map(x=>[x]):validTargets(s,type).flatMap(a=>validTargets(s,type,a).filter(b=>b>a).map(b=>[a,b]));
  for(const t of targets){const n=copy(s);if(!playCard(n,i,t))result.push(n);}
 });return result;
}
// A small beam search exercises complete legal runs, without changing game state outside the public rules.
function plan(s){
 const attr=SCENES[s.stage].attr;
 const rank=n=>hexagram(n.bits).stats[attr]*10-Math.max(0,n.debt-s.hp+2)*4+n.energy*.1+n.hp*.05;
 let best=s,front=[s];const seen=new Set();
 for(let depth=0;depth<4;depth++){
  const next=[];
  for(const n of front)for(const c of options(n)){
   const key=[c.bits.join(''),c.hand.join(','),c.energy,c.debt,c.hp,c.locks.join('')].join('|');if(seen.has(key))continue;seen.add(key);next.push(c);if(rank(c)>rank(best))best=c;
  }
  front=next.sort((a,b)=>rank(b)-rank(a)).slice(0,18);if(!front.length)break;
 }
 return best;
}
let wins=0,perfect=0;
for(let seed=1;seed<=30;seed++){
 let s=createGame(seed),turns=0;
 while(s.phase!=='ending'&&turns++<10){
  if(s.phase==='reward'){const reward=s.rewards.find(t=>t==='flip')||s.rewards.find(t=>t==='mirror')||s.rewards[0];chooseReward(s,reward);}
  else{s=plan(s);settle(s);}
  assert(s.hp>=0&&s.hp<=12);assert(s.money>=0);assert(s.bits.every(b=>b===0||b===1));assert(s.hand.length<=7);
 }
 assert.equal(s.phase,'ending');if(ending(s).win)wins++;if(s.cleared===3)perfect++;
}
assert(wins>=20,'Starter deck should permit consistent victories with planning.');
console.log(`Passed: 64 hexagrams, card rules, invalid moves, preview purity, omen locks, debt, death, redraw, healing, hand limits; 30 complete runs: ${wins} victories, ${perfect} perfect runs.`);
