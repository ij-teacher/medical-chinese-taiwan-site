'use strict';
const $=id=>document.getElementById(id);
const phrases=['出現＿＿','開始＿＿','情況＿＿','網路＿＿','＿＿區','＿＿病人','藥物＿＿','＿＿感染','按時＿＿','拿＿＿去領藥','飯後＿＿','盡快＿＿','＿＿水分','＿＿睡眠'];
const scenes=['醫師問：「除了頭痛，還有其他身體不舒服的表現嗎？」這些表現叫做＿＿。','他的體溫比平常高，已經三十八度半了。他開始＿＿。','原本只有一點不舒服，現在痛得沒辦法睡覺。情況越來越＿＿。','看醫生前，先到櫃檯登記科別、安排看診，這叫做＿＿。','已經掛好號，在等候區等醫師叫到自己的名字，這時正在＿＿。','醫師問：「你最近有沒有碰到生病的人，或跟他們在一起？」他在問有沒有＿＿病人。','她吃海鮮後出現紅點，而且很癢，可能是海鮮＿＿。','鼻子、喉嚨等讓空氣進出身體的通道，叫做＿＿。','上次看診後還沒好，醫師要他為了同一個問題再來看一次，這叫做＿＿。','看完醫生，拿著醫師開藥的文件到藥局領藥。這份文件叫做＿＿。','藥袋寫「飯後吃藥」，正式的說法是「飯後＿＿」。','他身體很不舒服，決定去醫院看醫生，也就是去＿＿。','身體的水分不夠，醫師提醒他多喝水，＿＿水分。','咳嗽讓他晚上睡不好，已經＿＿睡眠。'];
let words=[],queue=[],position=0,options=[],lane=1,score=0,correct=0,missed=new Set(),requeued=new Set(),mode='meaning',duration=10000,active=false,paused=false,elapsed=0,last=0,raf=0,reviewSession=false,initialCount=14,roundOpen=false;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let previousAnswerLane=-1, sameLaneCount=0, dropPaths=[];
function show(id){for(const n of ['setup','play','results'])$(n).hidden=n!==id;window.scrollTo({top:0,behavior:'instant'});}
function chooseLane(n){lane=Math.max(0,Math.min(2,n));$('basket').style.left=(lane*100/3+2.6667)+'%';$('basket').setAttribute('aria-label','藥籃在'+['左邊','中間','右邊'][lane]);document.querySelectorAll('[data-lane]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.lane)===lane?'true':'false'));}
function stop(){active=false;cancelAnimationFrame(raf);}
function start(ids=null){stop();mode=document.querySelector('[name=mode]:checked').value;duration=Number($('speed').value)*1000;queue=shuffle(ids||words.map((_,i)=>i));initialCount=queue.length;reviewSession=!!ids;position=0;score=0;correct=0;missed=new Set();requeued=new Set();$('mode-label').textContent=({meaning:'入門 · 解釋',phrase:'進階 · 搭配',scene:'挑戰 · 情境'})[mode];show('play');nextRound();}
function nextRound(){
  if(position>=queue.length){finish();return;}
  const id=queue[position];options=shuffle([id,...shuffle(words.map((_,i)=>i).filter(i=>i!==id)).slice(0,2)]);
  let answerLane=options.indexOf(id);
  if(sameLaneCount>=2 && answerLane===previousAnswerLane){const other=shuffle([0,1,2].filter(n=>n!==answerLane))[0];[options[answerLane],options[other]]=[options[other],options[answerLane]];answerLane=other;}
  sameLaneCount=answerLane===previousAnswerLane?sameLaneCount+1:1;previousAnswerLane=answerLane;
  const heights=shuffle([4,40,76]);dropPaths=heights.map(y=>({start:y+Math.random()*12,delay:Math.random()*700}));
  $('progress').textContent=`${position+1} / ${queue.length}`;$('score').textContent=score;$('correct').textContent=correct;
  $('prompt-kind').textContent=({meaning:'看解釋，接住對應的生詞',phrase:'完成搭配，接住缺少的生詞',scene:'讀情境，接住最適合的生詞'})[mode];
  $('question').textContent=mode==='meaning'?words[id][2]:mode==='phrase'?phrases[id]:scenes[id];
  $('retry-tag').hidden=position<initialCount;
  $('cards').replaceChildren();
  options.forEach((idx,i)=>{const card=document.createElement('div');card.className='word-card';card.style.width='26%';card.style.marginLeft='0';card.style.left=(i*100/3+1+Math.random()*5)+'%';const b=document.createElement('b');b.textContent=words[idx][0];card.append(b);if(mode==='meaning'){const p=document.createElement('small');p.textContent=words[idx][1];card.append(p);}$('cards').append(card);});
  $('feedback').hidden=true;$('pause-overlay').hidden=true;$('pause').textContent='暫停 ⏸';$('pause').disabled=false;$('catch-now').disabled=false;document.querySelectorAll('[data-lane]').forEach(b=>b.disabled=false);chooseLane(1);elapsed=0;last=performance.now();paused=false;active=true;roundOpen=true;draw();raf=requestAnimationFrame(tick);
}
function draw(){const end=$('arena').clientHeight-81-75;document.querySelectorAll('.word-card').forEach((c,i)=>{const path=dropPaths[i];const progress=Math.max(0,Math.min(1,(elapsed-path.delay)/(duration-path.delay)));const y=path.start+(end-path.start)*progress;c.style.transform=`translateY(${y}px)`;});}
function tick(now){if(!active)return;if(!paused){elapsed+=Math.min(now-last,100);draw();if(elapsed>=duration){resolve();return;}}last=now;raf=requestAnimationFrame(tick);}
function resolve(){if(!active||paused||!roundOpen)return;roundOpen=false;stop();const id=queue[position];const isRight=options[lane]===id;const retry=position>=initialCount;
  if(isRight){score+=retry?5:10;correct++;}else{missed.add(id);if(!requeued.has(id)){queue.push(id);requeued.add(id);}}
  $('score').textContent=score;$('correct').textContent=correct;
  $('feedback').dataset.correct=String(isRight);
  $('feedback-title').textContent=isRight?'接住了！答對了 ✓':'這次先記起來，再練習一次';
  $('answer-word').replaceChildren(document.createTextNode(words[id][0]));const py=document.createElement('span');py.className='pinyin';py.textContent=words[id][1];$('answer-word').append(py);
  $('answer-meaning').textContent=words[id][2];$('answer-phrase').textContent='常見搭配：'+words[id][3];$('feedback').hidden=false;$('pause').disabled=true;$('catch-now').disabled=true;document.querySelectorAll('[data-lane]').forEach(b=>b.disabled=true);$('next').textContent=position+1>=queue.length?'看看練習成果 →':'下一題 →';$('next').focus();
}
function togglePause(){if(!active)return;paused=!paused;$('pause-overlay').hidden=!paused;$('pause').textContent=paused?'繼續遊戲 ▶':'暫停 ⏸';$('catch-now').disabled=paused;last=performance.now();}
function finish(){stop();show('results');$('result-score').replaceChildren(document.createTextNode(score+' '));const small=document.createElement('small');small.textContent='分';$('result-score').append(small);$('result-description').textContent=`完成 ${initialCount} 個生詞${reviewSession?'的錯題練習':''}，共答對 ${correct} 次。首輪答對 +10 分，補練答對 +5 分。`;$('review-heading').textContent=missed.size?'這些生詞，再見一次就更熟了。':'全部接對了！換個難度再挑戰。';$('review-list').replaceChildren();for(const id of missed){const box=document.createElement('div');box.className='review-word';const b=document.createElement('b');b.textContent=words[id][0];const sp=document.createElement('span');sp.textContent=words[id][1];const p=document.createElement('p');p.textContent=words[id][2]+'｜'+words[id][3];box.append(b,sp,p);$('review-list').append(box);}$('review').hidden=!missed.size;$('results').querySelector('h1').tabIndex=-1;$('results').querySelector('h1').focus();}
document.querySelectorAll('[data-lane]').forEach(b=>b.onclick=()=>{if(active&&!paused)chooseLane(Number(b.dataset.lane));});
$('start').onclick=()=>start();$('again').onclick=()=>start();$('review').onclick=()=>start([...missed]);$('choose').onclick=()=>show('setup');$('pause').onclick=togglePause;$('catch-now').onclick=resolve;$('next').onclick=()=>{if(!$('feedback').hidden){$('feedback').hidden=true;position++;nextRound();}};
$('home').onclick=e=>{e.preventDefault();stop();$('feedback').hidden=true;show('setup');};
document.addEventListener('keydown',e=>{if($('play').hidden||['INPUT','SELECT'].includes(e.target.tagName))return;if(e.key==='p'||e.key==='P'){togglePause();return;}if(!active||paused)return;if(['ArrowLeft','ArrowRight','1','2','3',' '].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')chooseLane(lane-1);else if(e.key==='ArrowRight')chooseLane(lane+1);else if(e.key===' ')resolve();else chooseLane(Number(e.key)-1);}});
function movePointer(e){if(!active||paused)return;const r=$('arena').getBoundingClientRect();chooseLane(Math.floor((e.clientX-r.left)/r.width*3));}
$('arena').addEventListener('pointerdown',e=>{if(!active||paused)return;$('arena').setPointerCapture(e.pointerId);movePointer(e);});$('arena').addEventListener('pointermove',e=>{if($('arena').hasPointerCapture(e.pointerId))movePointer(e);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused)togglePause();});
fetch('resources/vocabulary.json').then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(data=>{if(data.length!==14||data.some(w=>w.length!==4))throw Error('data');words=data;for(const w of words){const tr=document.createElement('tr');for(const text of w){const td=document.createElement('td');td.textContent=text;tr.append(td);}$('vocab-table').append(tr);}$('start').disabled=false;$('start').textContent='開始接生詞 →';}).catch(()=>{$('load-status').textContent='生詞載入失敗，請重新整理網頁後再試。';$('start').textContent='無法載入生詞';});
