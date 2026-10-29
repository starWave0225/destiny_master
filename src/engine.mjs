export const TRIGRAMS = [
  {name:'乾',element:'天',glyph:'☰',mask:7,stats:[4,0,1],word:'健行不息'},
  {name:'兑',element:'泽',glyph:'☱',mask:3,stats:[1,1,3],word:'和悦通达'},
  {name:'离',element:'火',glyph:'☲',mask:5,stats:[2,0,4],word:'明察秋毫'},
  {name:'震',element:'雷',glyph:'☳',mask:1,stats:[3,1,1],word:'动而有为'},
  {name:'巽',element:'风',glyph:'☴',mask:6,stats:[1,2,3],word:'顺势而入'},
  {name:'坎',element:'水',glyph:'☵',mask:2,stats:[1,4,1],word:'涉险求生'},
  {name:'艮',element:'山',glyph:'☶',mask:4,stats:[0,4,2],word:'知止而守'},
  {name:'坤',element:'地',glyph:'☷',mask:0,stats:[1,3,2],word:'厚德载物'}
];
const NAMES = [
 ['乾','履','同人','无妄','姤','讼','遁','否'],
 ['夬','兑','革','随','大过','困','咸','萃'],
 ['大有','睽','离','噬嗑','鼎','未济','旅','晋'],
 ['大壮','归妹','丰','震','恒','解','小过','豫'],
 ['小畜','中孚','家人','益','巽','涣','渐','观'],
 ['需','节','既济','屯','井','坎','蹇','比'],
 ['大畜','损','贲','颐','蛊','蒙','艮','剥'],
 ['泰','临','明夷','复','升','师','谦','坤']
];
export const ATTRS = ['进取','守御','洞察'];
export const LINES = ['初爻','二爻','三爻','四爻','五爻','上爻'];
export const SCENES = [
 {name:'风雨渡口',place:'第一劫 · 渡江',short:'渡江',attr:1,goal:12,omen:2,flavor:'江上风急，孤舟欲渡。',text:'暴雨将至，最后一班渡船即将离岸。稳住心神，护住行囊，才能越过这道江。',forecast:'风雷将动，三爻将在下一轮翻转。',success:'孤舟穿过风雨，你抱着干燥的书卷踏上彼岸。',failure:'船过险滩，行囊落水。你保住了书卷，却伤了元气。'},
 {name:'荒寺夜灯',place:'第二劫 · 问心',short:'问心',attr:2,goal:12,omen:4,flavor:'灯影之下，人心难测。',text:'荒寺中，热心的旅人邀你共饮。门外马蹄渐近，酒里的倒影似乎另有隐情。',forecast:'夜风摇灯，五爻将在下一轮翻转。',success:'你看穿了酒中机关，循着月色避开埋伏。',failure:'醒来时天已微明。盘缠散落，你带着疲惫继续赶路。'},
 {name:'金榜之前',place:'第三劫 · 登科',short:'登科',attr:0,goal:12,omen:0,flavor:'十年寒窗，此刻落笔。',text:'贡院钟响，万籁俱寂。眼前这道策论，问的是天下，也问你是否敢于落笔。',forecast:'天光将破，初爻将在下一轮翻转。',success:'你提笔如有神，将一路风雨写成胸中山河。',failure:'墨迹未干，钟声已起。这一次，你仍有未尽之言。'}
];
export const CARDS = {
 yin:{name:'转阴',sigil:'⚋',kind:'改爻',cost:1,target:'one',desc:'将一根阳爻化为阴爻。',detail:'选中牌后，点击一根阳爻。'},
 yang:{name:'转阳',sigil:'⚊',kind:'改爻',cost:1,target:'one',desc:'将一根阴爻化为阳爻。',detail:'选中牌后，点击一根阴爻。'},
 flip:{name:'变爻',sigil:'易',kind:'改爻',cost:1,target:'one',desc:'翻转任意一根阴阳爻。',detail:'选中牌后，点击任意一爻。'},
 swap:{name:'移爻',sigil:'⇅',kind:'移易',cost:1,target:'two',desc:'交换两根爻的位置。',detail:'依次点击两根不同阴阳的爻。'},
 upper:{name:'天变',sigil:'☰',kind:'变卦',cost:2,target:'none',desc:'同时翻转上卦的三根爻。',detail:'选中后点击「施展此牌」。'},
 lower:{name:'地转',sigil:'☷',kind:'变卦',cost:2,target:'none',desc:'同时翻转下卦的三根爻。',detail:'选中后点击「施展此牌」。'},
 rotate:{name:'轮转',sigil:'↻',kind:'移易',cost:1,target:'none',desc:'六爻上移一位，上爻归初。',detail:'选中后点击「施展此牌」。'},
 lock:{name:'定爻',sigil:'定',kind:'守势',cost:1,target:'one',desc:'锁定一爻，抵御下轮天变。',detail:'选择预示中将要变化的爻，能阻止天变。'},
 insight:{name:'问天',sigil:'问',kind:'筹谋',cost:0,target:'none',desc:'抽取两张牌，最多持有七张。',detail:'选中后点击「施展此牌」。'},
 borrow:{name:'借运',sigil:'借',kind:'禁术',cost:0,target:'none',desc:'获得 2 灵力；应劫时失去 2 气数。',detail:'借来的天运，需要以气数偿还。'},
 heal:{name:'调息',sigil:'息',kind:'养生',cost:1,target:'none',desc:'恢复 3 气数，最高为 12。',detail:'选中后点击「施展此牌」。'},
 mirror:{name:'照影',sigil:'映',kind:'变卦',cost:2,target:'none',desc:'使上卦与下卦一致，结成纯卦。',detail:'纯卦的三项能力各增加 1。'}
};
const STARTER = ['yin','flip','yang','swap','borrow','upper','lower','lock','insight','rotate','heal','mirror'];
export function hexagram(bits) {
 const index = offset => TRIGRAMS.findIndex(t => t.mask === bits.slice(offset,offset+3).reduce((v,b,i)=>v+(b<<i),0));
 const low=index(0), high=index(3), pure=low===high;
 return {lower:TRIGRAMS[low],upper:TRIGRAMS[high],name:NAMES[high][low],pure,stats:TRIGRAMS[low].stats.map((v,i)=>v+TRIGRAMS[high].stats[i]+(pure?1:0))};
}
function random(s) {let n=s.rng|0;n^=n<<13;n^=n>>>17;n^=n<<5;s.rng=n>>>0;return s.rng/4294967296;}
function shuffle(s,list) {for(let i=list.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
function log(s,msg){s.journal.push(msg);if(s.journal.length>100)s.journal.shift();}
function draw(s,n) {for(let i=0;i<n&&s.hand.length<7;i++){if(!s.deck.length){s.deck=shuffle(s,s.discard.splice(0));}if(s.deck.length)s.hand.push(s.deck.shift());}}
function newHand(s){s.discard.push(...s.hand);s.hand=[];draw(s,5);s.energy=3;s.redrawn=false;}
export function createGame(seed=Date.now()) {
 const s={version:1,rng:(seed>>>0)||1234567,seed:(seed>>>0)||1234567,stage:0,round:1,progress:0,hp:12,money:6,debt:0,energy:3,bits:[1,0,0,0,1,0],locks:[],hand:STARTER.slice(0,5),deck:STARTER.slice(5),discard:[],phase:'play',journal:[],cleared:0,plays:0,redrawn:false,summary:null,rewards:[]};
 shuffle(s,s.deck);log(s,'你怀揣六文钱与一卷旧书，踏上了进京的路。');return s;
}
export function validTargets(s,type,first=null) {
 return s.bits.map((b,i)=>i).filter(i=>type==='lock'?!s.locks.includes(i):!s.locks.includes(i)&&(type!=='yin'||s.bits[i]===1)&&(type!=='yang'||s.bits[i]===0)&&(type!=='swap'||first===null||s.bits[i]!==s.bits[first]));
}
export function preview(s,type,targets=[]) {
 const bits=[...s.bits], locks=[...s.locks];
 if(type==='yin'&&targets.length)bits[targets[0]]=0;
 if(type==='yang'&&targets.length)bits[targets[0]]=1;
 if(type==='flip'&&targets.length)bits[targets[0]]=1-bits[targets[0]];
 if(type==='swap'&&targets.length===2)[bits[targets[0]],bits[targets[1]]]=[bits[targets[1]],bits[targets[0]]];
 if(type==='upper'||type==='lower'){const start=type==='upper'?3:0;for(let i=start;i<start+3;i++){if(locks.includes(i))return null;bits[i]=1-bits[i];}}
 if(type==='rotate'){if(locks.length)return null;bits.unshift(bits.pop());}
 if(type==='mirror'){if(locks.some(i=>i>=3&&bits[i]!==bits[i-3]))return null;bits.splice(3,3,...bits.slice(0,3));}
 return {bits,...hexagram(bits)};
}
export function playCard(s,index,targets=[]) {
 if(s.phase!=='play')return '此时不能出牌。';
 const type=s.hand[index],c=CARDS[type];if(!c)return '请先选一张牌。';
 if(s.energy<c.cost)return '灵力不足，可以借运或直接应劫。';
 if(c.target==='one'||c.target==='two'){
  if(targets.length!==(c.target==='one'?1:2))return '请选择目标爻。';
  if(targets.some(i=>!Number.isInteger(i)||i<0||i>5))return '目标爻无效。';
  if(!validTargets(s,type).includes(targets[0]))return '这根爻无法改变，请选择亮起的爻。';
  if(c.target==='two'&&(!validTargets(s,type,targets[0]).includes(targets[1])||targets[0]===targets[1]))return '请选择另一根不同阴阳的爻。';
 }
 const p=preview(s,type,targets);if(!p)return '定爻保护中，此牌会移动或改变被锁定的爻。';
 if(type==='heal'&&s.hp===12)return '气数已满，暂时无需调息。';
 if(type==='insight'&&s.hand.length>=7)return '手牌已满，请先使用其他牌。';
 s.energy-=c.cost;s.hand.splice(index,1);s.discard.push(type);s.bits=p.bits;s.plays++;
 if(type==='lock')s.locks.push(targets[0]);
 if(type==='borrow'){s.energy+=2;s.debt+=2;}
 if(type==='heal')s.hp=Math.min(12,s.hp+3);
 if(type==='insight')draw(s,2);
 log(s,'施展「'+c.name+'」'+(targets.length?'，'+targets.map(i=>LINES[i]).join('、')+'应命而变。':'。'));
 return null;
}
export function redraw(s) {
 if(s.phase!=='play')return '此时不能换牌。';
 if(s.redrawn)return '本轮已换过牌。';
 if(s.money<1)return '盘缠不足。';
 s.money--;s.discard.push(...s.hand);s.hand=[];draw(s,5);s.redrawn=true;log(s,'花费一文盘缠，重新筹谋。');return null;
}
export function settle(s) {
 if(s.phase!=='play')return;
 const scene=SCENES[s.stage],score=hexagram(s.bits).stats[scene.attr],debt=s.debt;
 s.debt=0;s.progress+=score;s.hp=Math.max(0,s.hp-debt);
 log(s,scene.name+' · 第'+s.round+'轮：'+ATTRS[scene.attr]+' '+score+'，累计 '+s.progress+'/'+scene.goal+'。'+(debt?'偿还借运，气数 −'+debt+'。':''));
 if(s.hp<=0){s.phase='ending';s.summary={success:false,total:s.progress,goal:scene.goal,dead:true};return;}
 if(s.round===1){
  const blocked=s.locks.includes(scene.omen);if(!blocked)s.bits[scene.omen]=1-s.bits[scene.omen];
  log(s,blocked?'定爻挡住了天变。':LINES[scene.omen]+'随天时翻转，命卦已变。');
  s.locks=[];s.round=2;newHand(s);return;
 }
 const success=s.progress>=scene.goal,loss=success?0:Math.ceil((scene.goal-s.progress)/2);
 s.hp=Math.max(0,s.hp-loss);if(success){s.cleared++;s.money+=2;s.hp=Math.min(12,s.hp+1);}
 log(s,success?scene.success:scene.failure);s.summary={success,total:s.progress,goal:scene.goal,loss,dead:s.hp===0};
 if(s.hp===0||s.stage===2){s.phase='ending';return;}
 s.phase='reward';s.rewards=shuffle(s,Object.keys(CARDS)).slice(0,3);
}
export function chooseReward(s,type) {
 if(s.phase!=='reward'||!s.rewards.includes(type))return;
 s.deck.push(type);log(s,'途中悟得「'+CARDS[type].name+'」，收入牌组。');
 s.stage++;s.round=1;s.progress=0;s.locks=[];s.summary=null;s.rewards=[];s.phase='play';newHand(s);
}
export function ending(s) {
 if(s.hp<=0)return {title:'命途未竟',verse:'风雨未歇，你暂且停下了脚步。',text:'借运与险劫耗尽了气数。记住这一路的卦，下一次，命运仍可重写。',win:false};
 if(s.summary?.success&&s.cleared===3)return {title:'金榜题名',verse:'一纸功名，写尽来路风雨。',text:'三劫皆渡。你带着书卷走进长安，也将自己的名字写进了春天。',win:true};
 if(s.summary?.success)return {title:'榜上有名',verse:'命有波折，终有所成。',text:'尽管路上留下遗憾，你仍在最后一场策论中落笔成章，叩开了长安的大门。',win:true};
 return {title:'来年再试',verse:'山河仍在，故事未完。',text:'这一次未能登科。但一路的见闻已化作胸中丘壑，来年又是一场春。',win:false};
}
