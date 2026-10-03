import {useEffect,useRef,useState} from 'react';
import {AtelierScene} from '../atelier/AtelierScene';
import {MorningStreet} from './MorningStreet';
import {places,placeById,type PlaceId} from './exploreContent';
import {freshExplore,parseExplore,arriveAt,addToBasket,removeFromBasket,migrateTourBasket,EXPLORE_SAVE_KEY,type ExploreSave} from './exploreState';
import {tourSources,tourStops,foodNotes,type FoodNote} from './tourContent';
import {TOUR_SAVE_KEY} from './tourState';
import type {Era} from '../atelier/content';
import './street.css';
import './explore.css';

const asset=(name:string)=>import.meta.env.BASE_URL+'assets/'+name;
const read=():ExploreSave=>{try{return parseExplore(localStorage.getItem(EXPLORE_SAVE_KEY))??migrateTourBasket(localStorage.getItem(TOUR_SAVE_KEY))??freshExplore();}catch{return freshExplore();}};
function BasketIcon(){return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m10 5-6 10m18-10 6 10M3 13h26l-4 15H7L3 13Zm9 5 1 6m7-6-1 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
export default function ExploreExperience(){
 const host=useRef<HTMLDivElement>(null),engine=useRef<AtelierScene|null>(null),world=useRef<MorningStreet|null>(null),markers=useRef(new Map<PlaceId,HTMLButtonElement>()),modal=useRef<HTMLDialogElement>(null),audio=useRef<HTMLAudioElement|null>(null);
 const [save,setSave]=useState(read),[mode,setMode]=useState<'cover'|'map'|'visit'>('cover'),[chapter,setChapter]=useState(0),[pageIndex,setPageIndex]=useState(0),[reading,setReading]=useState(true),[basketOpen,setBasketOpen]=useState(false);
 const [status,setStatus]=useState('loading'),[attempt,setAttempt]=useState(0),[walking,setWalking]=useState(false),[turning,setTurning]=useState(false),[shownEra,setShownEra]=useState<Era>(save.era);
 const [motion,setMotion]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches),[sound,setSound]=useState(false),[sourcesOpen,setSourcesOpen]=useState(false),[sourceIds,setSourceIds]=useState<string[]>([]),[storageOk,setStorageOk]=useState(true),[notice,setNotice]=useState('');
 const latest=useRef({save,mode,motion});latest.current={save,mode,motion};
 const place=save.place?placeById(save.place):null,section=place?.chapters[chapter]??place?.chapters[0],page=section?.pages[pageIndex]??section?.pages[0];
 const busy=walking||turning||status!=='ready';
 useEffect(()=>{
  let alive=true,scene:AtelierScene|undefined;setStatus('loading');
  try{
   const env=new MorningStreet(host.current!,value=>{if(!alive)return;setWalking(value);const l=latest.current;if(!value&&l.mode==='visit'&&l.save.place)setSave(s=>arriveAt(s,l.save.place!));});world.current=env;env.setWalkMap(true);env.setExplorerMarkers(markers.current);
   scene=new AtelierScene(host.current!,new Map(),s=>{if(alive)setStatus(s);},e=>{if(alive)setShownEra(e);},t=>{if(alive)setTurning(t);},env);engine.current=scene;
   scene.setMotion(latest.current.motion);scene.setEra(latest.current.save.era);
   void scene.build().then(()=>{if(alive)scene!.setFocus('welcome');}).catch(e=>{console.error(e);if(alive)setStatus('failed');});
  }catch(e){console.error(e);setStatus('failed');}
  return()=>{alive=false;scene?.dispose();engine.current=null;world.current=null;};
 },[attempt]);
 useEffect(()=>{
  if(status!=='ready')return;world.current?.setWalkMap(mode!=='visit');engine.current?.setFocus('welcome');
  if(mode==='visit'&&save.place){const p=placeById(save.place),index=p.chapters[chapter]?.stop??p.stopIndex,stop=index<8?tourStops[index]:p.stop;world.current?.walkTo(index,motion,stop);world.current?.setDawn(.32+Math.min(save.visited.length,6)*.035,motion);}
 },[mode,save.place,chapter,status]);
 useEffect(()=>{engine.current?.setMotion(motion);if(!motion)world.current?.finishWalk();},[motion]);
 useEffect(()=>{if(status==='ready'&&mode==='visit'&&!walking&&!turning&&save.place==='noodle')engine.current?.setFocus('keeper');},[walking,turning,pageIndex,chapter,mode,status,save.place]);
 useEffect(()=>{if(mode==='cover')return;try{localStorage.setItem(EXPLORE_SAVE_KEY,JSON.stringify(save));setStorageOk(true);}catch{setStorageOk(false);}},[save,mode]);
 useEffect(()=>{const a=new Audio(asset('audio/ambient-past.wav'));a.loop=true;a.volume=.13;audio.current=a;const visible=()=>{if(document.hidden)a.pause();else if(a.dataset.enabled==='true')void a.play().catch(()=>setSound(false));};document.addEventListener('visibilitychange',visible);return()=>{a.pause();a.src='';document.removeEventListener('visibilitychange',visible);};},[]);
 useEffect(()=>{if(sourcesOpen)modal.current?.showModal();else modal.current?.close();},[sourcesOpen]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),2400);return()=>clearTimeout(timer);},[notice]);
 const select=(id:PlaceId)=>{if(turning||status!=='ready')return;world.current?.finishWalk();setChapter(0);setPageIndex(0);setReading(true);setBasketOpen(false);setSave(s=>({...s,place:id}));setMode('visit');};
 const map=()=>{world.current?.finishWalk();setMode('map');setBasketOpen(false);};
 const era=(e:Era)=>{if(turning||save.era===e)return;setSave(s=>({...s,era:e}));engine.current?.setEra(e);};
 const collect=(id:FoodNote)=>{setSave(s=>addToBasket(s,id));setNotice('已放进我的过早，替你收好了。');};
 const sources=(ids:string[]=[])=>{setSourceIds(ids);setSourcesOpen(true);};
 const toggleSound=async()=>{const a=audio.current;if(!a)return;const enabled=!sound;a.dataset.enabled=String(enabled);if(!enabled){a.pause();setSound(false);}else try{await a.play();setSound(true);}catch{a.dataset.enabled='false';setSound(false);}};
 const download=()=>{const text=['# 我的武汉过早食篮','',...foodNotes.filter(f=>save.foods.includes(f.id)).map(f=>`- ${f.name}：${f.line}`),'','我逛过：'+save.visited.map(id=>placeById(id).name).join('、'),'','街巷、人物与对白为艺术创作。文化介绍参考：','',...tourSources.map(s=>`- [${s.title}](${s.url})｜${s.by}`)].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='我的武汉过早食篮.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <main className="morning-street market-explore" data-era={shownEra} data-explore-mode={mode} data-place={save.place??''} onKeyDown={e=>{if(e.key==='Escape')setBasketOpen(false);}}>
  <div ref={host} className="street-canvas explore-canvas" aria-label="武汉早市互动地图，点击圆点选择地点；第一人称时拖动环顾" tabIndex={0}>{places.map(p=><button hidden key={p.id} className={'explore-pin '+(save.visited.includes(p.id)?'is-visited':'')} data-place={p.id} disabled={turning||mode!=='map'} ref={el=>{if(el)markers.current.set(p.id,el);else markers.current.delete(p.id);}} aria-label={'走去'+p.name} onClick={()=>select(p.id)}><i>{save.visited.includes(p.id)?'✓':'＋'}</i><span><b className="pin-label-full">{p.name}</b><b className="pin-label-short">{{noodle:'林记',doupi:'豆皮',mianwo:'面窝',market:'菜摊',neighbors:'留言',courtyard:'树下'}[p.id]}</b><small>{p.food?'尝一味':'逛一逛'}</small></span></button>)}</div>
  {mode==='cover'?<section className="market-cover">
   <img className="market-cover-art" src={asset('storybook/cover-v7.png')} alt="淡彩插画里的武汉早餐老街，木窗、早点摊与晨光中的行人"/>
   <header className="cover-header"><div className="explore-brand"><b>早</b><span>过早旧影<small>武汉 · 一街烟火</small></span></div><button onClick={()=>sources()}>关于这条街 ↗</button></header>
   <div className="cover-copy"><p className="cover-eyebrow"><span/> 巷口已开早市</p><h1>把清晨，<br/>逛成一份<span>回忆。</span></h1><p className="cover-description">循着芝麻香走进老街。<br/>挑一家喜欢的小铺，看看今昔，<br/>把心动的味道，收进自己的食篮。</p><button className="explore-primary cover-enter" disabled={status!=='ready'} onClick={map}>{status==='ready'?'去街上逛逛':status==='loading'?'早市正在开门…':'再试一次'}<span>→</span></button>{status==='failed'&&<button className="cover-retry" onClick={()=>setAttempt(x=>x+1)}>重新打开街景</button>}<div className="cover-notes"><span>自由选店</span><i>·</i><span>今昔相逢</span><i>·</i><span>记住一味</span></div>{save.foods.length>0&&<p className="cover-saved">食篮里，还留着你上次的 {save.foods.length} 种味道。</p>}</div>
   <footer className="cover-footer"><span>有来历的味道，有温度的日常。</span><small>武汉生活意象 · 原创虚构街巷</small></footer>
  </section>:<>
   <header className="explore-header"><button className="explore-brand" onClick={()=>{world.current?.finishWalk();setMode('cover');}} aria-label="返回封面"><b>早</b><span>过早旧影<small>武汉 · 一街烟火</small></span></button><div className="explore-toolbar"><button className={mode==='map'?'is-selected':''} onClick={map} disabled={turning}>老街地图</button><div className="explore-era"><button onClick={()=>era('past')} aria-pressed={save.era==='past'} disabled={turning}>昔日</button><button onClick={()=>era('present')} aria-pressed={save.era==='present'} disabled={turning}>今日</button></div><button onClick={toggleSound} aria-pressed={sound}>{sound?'声音开':'声音关'}</button><button onClick={()=>setMotion(v=>!v)} aria-pressed={!motion}>{motion?'静一静':'动起来'}</button><button className="explore-source-top" onClick={()=>sources()}>资料手册</button></div></header>
   <button className="basket-mobile-trigger" onClick={()=>setBasketOpen(v=>!v)} aria-expanded={basketOpen}><BasketIcon/>我的过早 <b>{save.foods.length}</b></button>
   {basketOpen&&<button className="basket-scrim" aria-label="点击空白处收起食篮" onClick={()=>setBasketOpen(false)}/>}
   <aside className={'explore-basket '+(basketOpen?'is-open':'')} aria-label="我的过早食篮"><div className="basket-heading"><BasketIcon/><div><h2>我的过早</h2><p>把喜欢的味道，装一点回去。</p></div><b>{save.foods.length}</b><button className="basket-close" aria-label="收起食篮" onClick={()=>setBasketOpen(false)}>×</button></div><div className="basket-items">{save.foods.length===0?<div className="basket-empty"><img src={asset('storybook/bowl.webp')} alt=""/><p>食篮还是空的。</p><small>先去一家小铺看看，<br/>遇见喜欢的，再放进来。</small></div>:save.foods.map(id=>{const food=foodNotes.find(f=>f.id===id)!;return <div className="basket-item" key={id}><button onClick={()=>select(id)} className="basket-food"><img src={asset(food.image)} alt=""/><span><b>{food.name}</b><small>{food.line}</small></span></button><button className="basket-remove" aria-label={'移出'+food.name} onClick={()=>setSave(s=>removeFromBasket(s,id))}>×</button></div>;})}</div><div className="basket-bottom"><p>{storageOk?'已经替你存在这个浏览器里。':'暂时无法自动保存，可以下载食篮。'}</p><button disabled={!save.foods.length} className="basket-download" onClick={download}>带走我的食篮 <span>↓</span></button></div></aside>
   {mode==='map'&&<section className="explore-map-note"><p className="explore-eyebrow">这一回，跟着自己的胃口走。</p><h2>想先逛哪一家？</h2><p>点一下街上的小圆点，就从你的视角走过去。</p><div className="explore-place-list" aria-label="选择想去的地点">{places.map(p=><button key={p.id} disabled={turning} onClick={()=>select(p.id)}>{p.short}<span>↗</span></button>)}</div></section>}
   {mode==='visit'&&place&&<><div className="explore-location"><span>正在{walking?'走向':'看看'}</span><b>{place.name}</b><button onClick={map} disabled={turning}>换一家逛 ↗</button></div>
    {walking?<section className="explore-travel" role="status"><span>···</span><p>顺着石板路，去{place.name}。</p><button onClick={()=>world.current?.finishWalk()}>直接到达 →</button></section>:reading&&page&&section?<article className="explore-reading" aria-label={place.name+'的故事'}>
     <div className="explore-reading-top"><span>{place.kind}</span><button onClick={()=>setReading(false)} aria-label="收起介绍">×</button></div>
     {place.chapters.length>1&&<nav className="explore-chapters" aria-label="店内话题">{place.chapters.map((c,i)=><button key={c.title} disabled={turning} aria-pressed={chapter===i} onClick={()=>{setChapter(i);setPageIndex(0);}}>{c.title}</button>)}</nav>}
     <div className="explore-reading-body"><p className="explore-eyebrow">{page.label}</p><h2>{page.title}</h2><p className="explore-copy">{page.text}</p>
      {place.id==='noodle'&&chapter===2&&<div className="explore-inline-era"><button disabled={busy} onClick={()=>era('past')} aria-pressed={save.era==='past'}>昔日</button><span>{turning?'纸墙正在翻转…':'同一间小铺，两种清晨'}</span><button disabled={busy} onClick={()=>era('present')} aria-pressed={save.era==='present'}>今日</button></div>}
      {place.food&&<button className="explore-add-food" disabled={busy||save.foods.includes(place.food)||!save.visited.includes(place.id)} onClick={()=>collect(place.food!)}><img src={asset(foodNotes.find(f=>f.id===place.food)!.image)} alt=""/><span><b>{save.foods.includes(place.food)?'已放进我的过早':'把'+place.short+'放进食篮'}</b><small>{save.foods.includes(place.food)?'回头打开食篮，还能再看。':'喜欢这一味，就替自己记下来。'}</small></span><i>{save.foods.includes(place.food)?'✓':'＋'}</i></button>}
      <div className="explore-evidence"><span>{page.kind==='fact'?'文化资料':page.kind==='story'?'虚构对白':'场景观察'}</span>{page.sources&&<button onClick={()=>sources(page.sources)}>看看出处 ↗</button>}</div>
     </div><footer className="explore-reading-footer"><button disabled={busy||pageIndex===0} onClick={()=>setPageIndex(i=>i-1)}>← 前一页</button><span>{pageIndex+1} / {section.pages.length}</span><button disabled={busy} onClick={()=>pageIndex<section.pages.length-1?setPageIndex(i=>i+1):setReading(false)}>{pageIndex<section.pages.length-1?'再听一点 →':'慢慢看看 ↗'}</button></footer>
    </article>:<button className="explore-reopen" onClick={()=>setReading(true)}>读读这里的故事 ↗</button>}
   </>}
   {status!=='ready'&&<div className="explore-loading" role="status"><p>{status==='loading'?'街景正在展开…':'街景暂时没有展开。'}</p>{status!=='loading'&&<button onClick={()=>setAttempt(n=>n+1)}>重新打开</button>}</div>}
   {turning&&<p className="explore-turning" role="status">翻过纸墙，看看另一个清晨。</p>}
   <footer className="explore-footer"><span>{mode==='map'?'圆点可点击 · 自由选一家':'拖动环顾 · 随时回地图'}</span><span>武汉生活意象 · 虚构街巷</span></footer>
  </>}
  {notice&&<p className="explore-toast" role="status">{notice}</p>}
  <dialog className="explore-sources" ref={modal} onCancel={()=>setSourcesOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setSourcesOpen(false);}}><button className="explore-dialog-close" onClick={()=>setSourcesOpen(false)}>合上手册 ×</button><p className="explore-eyebrow">文化资料 / 核验于 2026-10-03</p><h2>味道有来处，故事有出处。</h2><p>这条街、店主与对白是创作；饮食介绍参考下列资料。关于食物起源的传说与不同叙述，我们保留它们的差异。</p>{tourSources.filter(s=>!sourceIds.length||sourceIds.includes(s.id)).map(s=><section key={s.id}><small>{s.by} · {s.date}</small><h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a></h3><p>{s.note}</p></section>)}</dialog>
 </main>;
}
