import {useEffect,useRef,useState} from 'react';
import {AtelierScene} from '../atelier/AtelierScene';
import {MorningStreet} from './MorningStreet';
import {tourStops,tourSources,foodNotes,memoryChoices,tourEraLabel,type FoodNote} from './tourContent';
import {freshTour,nextTour,previousTour,parseTour,recordFood,TOUR_SAVE_KEY,type TourSave} from './tourState';
import type {Era} from '../atelier/content';
import './street.css';
import './tour.css';

const readSave=()=>{try{return parseTour(localStorage.getItem(TOUR_SAVE_KEY));}catch{return null;}};
export default function TourExperience(){
 const host=useRef<HTMLDivElement>(null),engine=useRef<AtelierScene|null>(null),world=useRef<MorningStreet|null>(null),modal=useRef<HTMLDialogElement>(null),audio=useRef<HTMLAudioElement|null>(null);
 const [tour,setTour]=useState<TourSave>(freshTour),[saved,setSaved]=useState(readSave),[phase,setPhase]=useState<'intro'|'active'|'journal'>('intro');
 const [status,setStatus]=useState('loading'),[attempt,setAttempt]=useState(0),[walking,setWalking]=useState(false),[turning,setTurning]=useState(false),[shownEra,setShownEra]=useState<Era>('past');
 const [motion,setMotion]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches),[sound,setSound]=useState(false),[sourcesOpen,setSourcesOpen]=useState(false),[sourceIds,setSourceIds]=useState<string[]>([]),[storageOk,setStorageOk]=useState(true);
 const previousStop=useRef<number|null>(null),latest=useRef({tour,motion,phase});latest.current={tour,motion,phase};
 useEffect(()=>{
  let alive=true,scene:AtelierScene|undefined;setStatus('loading');previousStop.current=null;
  try{
   const env=new MorningStreet(host.current!,value=>{if(alive)setWalking(value);});world.current=env;
   scene=new AtelierScene(host.current!,new Map(),s=>{if(alive)setStatus(s);},e=>{if(alive){setShownEra(e);if(e==='present')setTour(s=>({...s,compared:true}));}},value=>{if(alive)setTurning(value);},env);engine.current=scene;
   scene.setMotion(latest.current.motion);scene.setEra(latest.current.tour.era);
   void scene.build().then(()=>{if(!alive)return;env.setDawn(tourStops[latest.current.tour.stop].dawn);env.walkTo(latest.current.phase==='intro'?0:latest.current.tour.stop,false);}).catch(e=>{console.error(e);if(alive)setStatus('failed');});
  }catch(e){console.error(e);setStatus('failed');}
  return()=>{alive=false;scene?.dispose();engine.current=null;world.current=null;};
 },[attempt]);
 useEffect(()=>{engine.current?.setMotion(motion);if(!motion)world.current?.finishWalk();},[motion]);
 useEffect(()=>{
  if(status!=='ready'||phase!=='active')return;
  const animate=previousStop.current!==null&&previousStop.current!==tour.stop&&motion;
  previousStop.current=tour.stop;world.current?.walkTo(tour.stop,animate);world.current?.setDawn(tourStops[tour.stop].dawn,animate);engine.current?.setFocus('welcome');
 },[tour.stop,status,phase]);
 useEffect(()=>{if(status==='ready'&&phase==='active'&&!walking&&!turning&&['noodle','eras'].includes(tourStops[tour.stop].id))engine.current?.setFocus('keeper');},[tour.stop,tour.page,status,walking,turning,phase]);
 useEffect(()=>{if(phase==='intro')return;try{localStorage.setItem(TOUR_SAVE_KEY,JSON.stringify(tour));setSaved(tour);setStorageOk(true);}catch{setStorageOk(false);}},[tour,phase]);
 useEffect(()=>{
  const a=new Audio(import.meta.env.BASE_URL+'assets/audio/ambient-past.wav');a.loop=true;a.volume=.14;audio.current=a;
  const visibility=()=>{if(document.hidden)a.pause();else if(a.dataset.enabled==='true')void a.play().catch(()=>setSound(false));};document.addEventListener('visibilitychange',visibility);
  return()=>{a.pause();a.src='';audio.current=null;document.removeEventListener('visibilitychange',visibility);};
 },[]);
 useEffect(()=>{if(sourcesOpen)modal.current?.showModal();else modal.current?.close();},[sourcesOpen]);
 const stop=tourStops[tour.stop],page=stop.pages[tour.page],busy=walking||turning||status!=='ready';
 const requiresFood=stop.id==='noodle'&&tour.page===stop.pages.length-1&&!tour.foods.includes('noodle');
 const requiresComparison=stop.id==='eras'&&tour.page===0&&!tour.compared;
 const requiresMemory=stop.id==='ending'&&!tour.memory;
 const canNext=!busy&&!requiresFood&&!requiresComparison&&!requiresMemory;
 const begin=(resume:boolean)=>{const state=resume&&saved?saved:freshTour();setTour(state);setShownEra(state.era);engine.current?.setEra(state.era);previousStop.current=null;setPhase(state.complete?'journal':'active');if(state.complete){world.current?.walkTo(state.stop,false);world.current?.setDawn(tourStops[state.stop].dawn);}};
 const advance=()=>{if(!canNext)return;const next=nextTour(tour);if(next.stop!==tour.stop)setWalking(motion);setTour(next);if(next.complete)setPhase('journal');};
 const back=()=>{if(busy)return;const next=previousTour(tour);if(next.stop!==tour.stop)setWalking(motion);setTour(next);};
 const changeEra=(era:Era)=>{if(busy||tour.era===era)return;setTour(s=>({...s,era}));engine.current?.setEra(era);};
 const collect=(id:FoodNote)=>setTour(s=>recordFood(s,id));
 const openSources=(ids:string[]=[])=>{setSourceIds(ids);setSourcesOpen(true);};
 const toggleSound=async()=>{const a=audio.current;if(!a)return;const enabled=!sound;a.dataset.enabled=String(enabled);if(!enabled){a.pause();setSound(false);}else try{await a.play();setSound(true);}catch{setSound(false);}};
 const exportJournal=()=>{
  const text=['# 我的武汉过早手册','',`我留下的记忆：${tour.memory}`,'',...foodNotes.filter(f=>tour.foods.includes(f.id)).map(f=>`- ${f.name}：${f.line}`),'','走过的停留点：'+tourStops.map(s=>s.name).join(' → '),'','本次街巷、人物和对白为艺术创作；文化介绍依据以下资料。','',...tourSources.map(s=>`- [${s.title}](${s.url})｜${s.by}｜${s.date}`),'','资料核验：2026-10-03。'].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='我的武汉过早手册.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <main className="morning-street walking-tour" data-era={shownEra} data-tour-phase={phase} data-tour-stop={stop.id} onKeyDown={e=>{if(phase!=='active'||sourcesOpen||(e.target as HTMLElement).closest('button,a,input,textarea,select'))return;if(e.key==='ArrowRight'){e.preventDefault();advance();}else if(e.key==='ArrowLeft'){e.preventDefault();back();}}}>
  <div ref={host} className="street-canvas tour-canvas" tabIndex={0} aria-label="第一人称老街，拖动左右环顾；方向键左右翻页"/>
  <header className="tour-header"><a className="tour-brand" href="?sample=street&v=6"><b>早</b><span>过早旧影<small>武汉 · 清晨步行</small></span></a><div className="tour-tools"><button onClick={toggleSound} aria-pressed={sound}>{sound?'环境声开':'环境声关'}</button><button onClick={()=>setMotion(v=>!v)} aria-pressed={!motion}>{motion?'减少动态':'恢复动态'}</button><button onClick={()=>openSources()}>资料手册</button><a href="?sample=street&v=6">俯瞰全景 ↗</a></div></header>
  {status!=='ready'&&<div className="street-loading" role="status"><span>过早旧影</span><h1>{status==='loading'?'清晨，正在巷口等你。':'街巷暂时没有展开'}</h1><p>{status==='loading'?'把石板、木窗与晨光安放好。':'你的游览记录会保留。'}</p>{status!=='loading'&&<button onClick={()=>setAttempt(n=>n+1)}>重新展开</button>}</div>}
  {status==='ready'&&phase==='intro'&&<section className="tour-intro"><p className="tour-kicker">一段武汉早市漫游 / 约 5 分钟</p><h1>趁清晨，<br/>去街上过早。</h1><p>从一碗热干面出发，走近食物的来历、手艺的分寸，和巷子里的一声招呼。</p><div className="tour-intro-tags"><span>第一人称步行</span><span>今昔对照</span><span>文化手册</span></div><button className="tour-primary" onClick={()=>begin(!!saved)}>{saved?(saved.complete?'打开我的过早记忆':'接着上次的脚步'):'走进早市'} <span>→</span></button>{saved&&<button className="tour-text-button" onClick={()=>begin(false)}>从巷口重新开始</button>}<small>虚构街巷与人物 · 文化内容附资料出处</small></section>}
  {status==='ready'&&phase==='active'&&<>
   <nav className="tour-route" aria-label="早市步行路线"><span>{String(tour.stop+1).padStart(2,'0')} / 08</span><div>{tourStops.map((s,i)=><button key={s.id} disabled={busy||i>tour.furthest} aria-label={s.name} aria-current={i===tour.stop?'step':undefined} title={s.name} onClick={()=>{if(i!==tour.stop){setWalking(motion);setTour(t=>({...t,stop:i,page:0}));}}}><i/></button>)}</div><strong>{stop.name}</strong></nav>
   <div className="tour-direction"><span>第一人称 · 沿街步行</span><small>拖动画面，左右看看</small></div>
   {walking?<section className="tour-travelling" role="status"><span className="tour-footsteps">···</span><p>慢慢走向「{stop.name}」</p><button onClick={()=>world.current?.finishWalk()}>直接到达</button></section>:<article className="tour-reading" aria-label="当前站点介绍">
    <div className="tour-reading-body"><p className="tour-kicker">{page.label}<span>{tour.page+1} / {stop.pages.length}</span></p><h2 tabIndex={-1}>{page.title}</h2><p className="tour-copy">{page.text}</p>
     {(stop.id==='eras'||stop.id==='neighbors')&&<div className="tour-era-control" aria-label="今昔对照"><button disabled={busy} aria-pressed={tour.era==='past'} onClick={()=>changeEra('past')}>昔日</button><span>{turning?'纸墙正在翻转…':'同一个位置，两种清晨'}</span><button disabled={busy} aria-pressed={tour.era==='present'} onClick={()=>changeEra('present')}>今日</button></div>}
     {stop.id==='noodle'&&tour.page===1&&<button className="tour-record-food" disabled={tour.foods.includes('noodle')} onClick={()=>collect('noodle')}><img src={import.meta.env.BASE_URL+'assets/storybook/bowl.webp'} alt="蓝花碗里的热干面"/><span>{tour.foods.includes('noodle')?'已记进我的过早':'记下这碗热干面'}<small>把味道与文化记进手册</small></span><b>{tour.foods.includes('noodle')?'✓':'＋'}</b></button>}
     {stop.id==='menu'&&tour.page===0&&<div className="tour-food-list">{foodNotes.map(f=><button key={f.id} aria-pressed={tour.foods.includes(f.id)} onClick={()=>collect(f.id)}><img src={import.meta.env.BASE_URL+'assets/'+f.image} alt=""/><span><b>{f.name}</b><small>{f.line}</small></span><i>{tour.foods.includes(f.id)?'✓':'＋'}</i></button>)}</div>}
     {stop.id==='ending'&&<fieldset className="tour-memory"><legend>你想留下哪一段记忆？</legend>{memoryChoices.map(m=><button key={m} aria-pressed={tour.memory===m} onClick={()=>setTour(s=>({...s,memory:m}))}>{m}<span>{tour.memory===m?'✓':'○'}</span></button>)}</fieldset>}
     <div className="tour-evidence"><span>{page.kind==='fact'?'文化资料':page.kind==='story'?'虚构对白':'场景观察'}</span>{page.sources&&<button onClick={()=>openSources(page.sources)}>查看这一页的出处 ↗</button>}</div>
    </div>
    <footer className="tour-reading-actions"><button className="tour-back" disabled={busy||(tour.stop===0&&tour.page===0)} onClick={back}>← 上一页</button><button className="tour-primary" disabled={!canNext} onClick={advance}>{requiresFood?'先记下这碗面':requiresComparison?'先看看今日':requiresMemory?'选一段记忆':stop.id==='ending'?'收好这段清晨':tour.page<stop.pages.length-1?'接着读':'走向'+tourStops[tour.stop+1].name}<span>→</span></button></footer>
   </article>}
   <aside className="tour-pocket" aria-label="我的过早记录"><span>我的过早</span><b>{tour.foods.length} 味</b><small>{tourEraLabel[shownEra]}</small></aside>
  </>}
  {phase==='journal'&&status==='ready'&&<section className="tour-journal"><p className="tour-kicker">这一趟清晨，收好了。</p><h1>{tour.memory}</h1><p>走过八处停留点，读过一条街的饮食小札。你记下的味道是——</p><div className="tour-journal-foods">{foodNotes.filter(f=>tour.foods.includes(f.id)).map(f=><figure key={f.id}><img src={import.meta.env.BASE_URL+'assets/'+f.image} alt=""/><figcaption>{f.name}</figcaption></figure>)}</div><blockquote>生活向前走，<br/>也给熟悉的味道留个位置。</blockquote><p className="tour-journal-note">手册包含你选的食物、记忆与资料链接。{storageOk?'游览进度已保存在此浏览器。':'下载一份，把这段清晨留在身边。'}</p><div className="tour-journal-actions"><button className="tour-primary" onClick={exportJournal}>保存我的过早手册 ↓</button><button onClick={()=>openSources()}>再读文化资料</button><button onClick={()=>begin(false)}>再走一遍</button></div></section>}
  {!storageOk&&<p className="tour-storage" role="status">浏览器暂时无法保存进度，仍可继续游览；结束后可以下载手册。</p>}
  <footer className="tour-bottom-note"><span>武汉生活意象 · 虚构街巷</span><span>{tour.stop<3?'晨光初照':tour.stop<6?'日色渐暖':'天已明亮'} · 沿街慢慢醒来</span></footer>
  <dialog className="tour-sources" ref={modal} onCancel={()=>setSourcesOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setSourcesOpen(false);}}><button className="tour-source-close" onClick={()=>setSourcesOpen(false)}>合上手册 ×</button><p className="tour-kicker">文化资料 / 核验于 2026-10-03</p><h2>{sourceIds.length?'这一页，从哪里来？':'有出处，也有创作。'}</h2><p>资料用于介绍武汉饮食文化；街道、林记、人物与纸条为创作，不是特定地点的历史复原。食物起源中尚有传说与不同叙述，本作不判定唯一发明者。</p>{tourSources.filter(s=>!sourceIds.length||sourceIds.includes(s.id)).map(s=><section key={s.id}><span>{s.by} · {s.date}</span><h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a></h3><p>{s.note}</p></section>)}</dialog>
 </main>;
}
