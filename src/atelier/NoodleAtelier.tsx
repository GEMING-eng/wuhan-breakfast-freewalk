import {useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import {AtelierScene} from './AtelierScene';
import {details,eraLabels,type Detail,type Era} from './content';
import './atelier.css';
import './era-theme.css';

const markerData:[Detail,string,string][]=[['keeper','01','听林姐说'],['bowl','02','这一碗面'],['jar','03','旧酱罐'],['stool','04','门前小凳']];
const SAVE='wuhan-atelier-memory.v1';

export default function NoodleAtelier(){
  const illustrated=new URLSearchParams(location.search).get('art')!=='original';
  const initialEra:Era=new URLSearchParams(location.search).get('era')==='present'?'present':'past';
  const [era,setEra]=useState<Era>(initialEra),[selected,setSelected]=useState<Detail>('welcome');
  const [shownEra,setShownEra]=useState<Era>(initialEra),[turning,setTurning]=useState(false);
  const [status,setStatus]=useState('loading'),[attempt,setAttempt]=useState(0),[layers,setLayers]=useState(false);
  const [motion,setMotion]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [sound,setSound]=useState(false),[saved,setSaved]=useState(()=>{try{return localStorage.getItem(SAVE)==='saved';}catch{return false;}}),[notice,setNotice]=useState('');
  const [about,setAbout]=useState(false);
  const host=useRef<HTMLDivElement>(null),engine=useRef<AtelierScene|null>(null),root=useRef<HTMLElement>(null),text=useRef<HTMLElement>(null);
  const markers=useRef(new Map<Detail,HTMLButtonElement>()),audio=useRef<HTMLAudioElement|null>(null),dialog=useRef<HTMLDialogElement>(null);
  const latest=useRef({era,motion,selected,layers});latest.current={era,motion,selected,layers};
  useEffect(()=>{
    let alive=true,stage:AtelierScene|undefined;
    setStatus('loading');
    try{stage=new AtelierScene(host.current!,markers.current,s=>{if(alive)setStatus(s);},value=>{if(alive)setShownEra(value);},value=>{if(alive)setTurning(value);},undefined,new URLSearchParams(location.search).get('art')!=='original');engine.current=stage;
      stage.setMotion(latest.current.motion);stage.setEra(latest.current.era);
      void stage.build().then(()=>{if(!alive)return;stage!.setEra(latest.current.era);if(latest.current.selected!=='welcome')stage!.setFocus(latest.current.selected);stage!.setExploded(latest.current.layers);}).catch(error=>{console.error(error);if(alive)setStatus('failed');});
    }catch(error){console.error(error);setStatus('failed');}
    return()=>{alive=false;stage?.dispose();engine.current=null;};
  },[attempt]);
  useEffect(()=>{engine.current?.setEra(era);},[era]);
  useEffect(()=>{engine.current?.setMotion(motion);},[motion]);
  useEffect(()=>{engine.current?.setFocus(selected);},[selected]);
  useEffect(()=>{engine.current?.setExploded(layers);},[layers]);
  useEffect(()=>{const ctx=gsap.context(()=>{gsap.fromTo(text.current,{opacity:0,y:motion?9:0},{opacity:1,y:0,duration:motion?.45:0,ease:'power2.out'});},root);return()=>ctx.revert();},[selected,shownEra,motion]);
  useEffect(()=>{
    const a=new Audio(import.meta.env.BASE_URL+'assets/audio/ambient-past.wav');a.loop=true;a.volume=.12;audio.current=a;
    const visibility=()=>{if(document.hidden)a.pause();else if(a.dataset.enabled==='true')void a.play().catch(()=>{setSound(false);});};
    document.addEventListener('visibilitychange',visibility);return()=>{a.pause();a.src='';audio.current=null;document.removeEventListener('visibilitychange',visibility);};
  },[]);
  useEffect(()=>{if(about)dialog.current?.showModal();else dialog.current?.close();},[about]);
  const toggleSound=async()=>{const a=audio.current;if(!a)return;const enable=!sound;a.dataset.enabled=String(enable);if(!enable){a.pause();setSound(false);return;}try{await a.play();setSound(true);}catch{setNotice('声音暂未开启，可以再试一次。');}};
  const collect=()=>{if(saved){setSelected('jar');return;}try{localStorage.setItem(SAVE,'saved');setSaved(true);setNotice('已收下：旧罐子旁边，多了一双新手。');}catch{setNotice('这段记忆已读到；浏览器暂时无法保存。');}};
  const data=details[shownEra][selected];
  const select=(id:Detail)=>{setSelected(id);setLayers(false);if(selected===id&&id==='keeper')engine.current?.speakAgain();if(innerWidth<=760)host.current?.scrollIntoView({block:'center',behavior:motion?'smooth':'instant'});};
  const changeEra=(value:Era)=>{if(value===era)return;setSelected('welcome');setLayers(false);setEra(value);};
  return <main className={'atelier '+(motion?'':'atelier-still')} ref={root} data-era={shownEra} data-turning={turning} data-art={illustrated?"storybook":"original"}>
    <header className="atelier-header">
      <a className="atelier-brand" href="./" aria-label="返回过早旧影完整故事"><span className="atelier-seal">早</span><span>过早旧影<small>武汉 · 纸上街巷</small></span></a>
      <span className="atelier-edition">{shownEra==='past'?'街坊熟客 · 清晨开门':'老铺新晨 · 一碗如常'} <i/> 武汉 · 汉口</span>
      <div className="atelier-header-actions">{illustrated&&<a href={"?sample=street&era="+shownEra}>回到老街 ↗</a>}<button onClick={toggleSound} aria-pressed={sound}>声音<span>{sound?'开':'关'}</span></button><button onClick={()=>setAbout(true)}>关于这段清晨 ↗</button></div>
    </header>
    <div className="atelier-layout">
      <aside className="atelier-sidebar">
        <div className="atelier-chapter"><span>{shownEra==='past'?'街坊食单':'林记手记'}</span><b>壹</b><span>{shownEra==='past'?'一九八〇年代':'今日 · 接续'}</span></div>
        <div className="atelier-heading"><p className="atelier-shop-kicker">汉口巷里 · 一间小铺</p><h1>热干面铺<span>林记</span></h1><p>芝麻香里，日子慢慢醒来。</p></div>
        <div className="atelier-rule"/>
        <article className="atelier-reading" ref={text} aria-live="polite" aria-atomic="true">
          <p className="atelier-eyebrow">{data.eyebrow}</p><h2>{data.title}</h2><p className="atelier-story">{data.body}</p>
          <p className="atelier-note">{data.note}</p>
          {selected==='keeper'&&<button className="atelier-replay" onClick={()=>engine.current?.speakAgain()}>再聊一会儿 ↻</button>}
        </article>
        <div className="atelier-tabs" aria-label="探索店铺">{markerData.map(([id,n,label])=><button key={id} aria-pressed={selected===id} disabled={turning} onClick={()=>select(id)}><span>{n}</span>{id==='keeper'&&shownEra==='present'?'听小林说':label}<i>↗</i></button>)}</div>
        <button className={'atelier-save '+(saved?'is-saved':'')} onClick={collect}>{saved?'已收下 · 一段街巷记忆':'收下一段街巷记忆'}<span>{saved?'✓':'＋'}</span></button>
        {notice&&<p className="atelier-notice" role="status">{notice}</p>}
      </aside>
      <section className="atelier-scene-area" aria-label="可交互的热干面铺纸景">
        <div className="atelier-era-row"><div><span className="atelier-dot"/><span>{turning?'翻过这一页，走进另一个清晨……':eraLabels[shownEra]}</span></div><div className="atelier-era" role="group" aria-label="查看今昔"><button onClick={()=>changeEra('past')} aria-pressed={era==='past'}>昔日</button><span>⇄</span><button onClick={()=>changeEra('present')} aria-pressed={era==='present'}>今日</button></div></div>
        <div className="atelier-canvas" ref={host}>
          <div className="atelier-markers">{markerData.map(([id,n,label])=><button key={id} ref={el=>{if(el)markers.current.set(id,el);else markers.current.delete(id);}} className={'atelier-marker '+(selected===id?'active':'')} aria-label={id==='keeper'&&shownEra==='present'?'听小林说':label} disabled={turning} onClick={()=>select(id)} hidden={status!=='ready'}><b>{n}</b><span>{id==='keeper'&&shownEra==='present'?'听小林说':label}</span></button>)}</div>
          {selected!=='welcome'&&<button className="atelier-back" onClick={()=>setSelected('welcome')}>← 返回店铺全景</button>}
        </div>
        {status!=='ready'&&<div className="atelier-loading" role="status"><span>纸上街巷</span><h2>{status==='loading'?'清晨正在搭起……':'纸景暂时歇了一会儿'}</h2>{status!=='loading'&&<><p>可以重试加载这间小铺。</p><button onClick={()=>setAttempt(n=>n+1)}>重新展开 →</button></>}</div>}
        <div className="atelier-caption"><span className="atelier-caption-line"/><p>{layers?'纸层分开后，看见一间小铺的深度。':shownEra==='past'?'窗一支，灶一点，街坊的清晨就来了。':'换了台面、换了雨棚，旧罐子还在原处。'}</p><span>{shownEra==='past'?'旧街 · 壹号铺':'新晨 · 壹号铺'}</span></div>
        <div className="atelier-controls" inert={turning}><span className="atelier-drag-hint">{selected==='welcome'?'点一件旧物，走近看一看':'轻轻拖动，围着这件旧物看'}</span><div><button aria-pressed={selected!=='welcome'} onClick={()=>select(selected==='welcome'?'bowl':'welcome')}>{selected!=='welcome'?'回到全景':'走近一点'} <span>{selected!=='welcome'?'−':'＋'}</span></button><button aria-pressed={layers} onClick={()=>{setSelected('welcome');setLayers(v=>!v);}}>{layers?'合上纸层':'看看纸层'}</button><button title="暂停蒸汽、树叶和人物；主动切换今昔仍会翻面" aria-pressed={!motion} onClick={()=>setMotion(v=>!v)}>{motion?'让画面静一静':'让清晨动起来'}</button></div></div>
      </section>
    </div>
    <footer className="atelier-footer"><span className="atelier-footer-stamp">林记 · 过早</span><span><b>留下来的</b> 一只酱罐 · 一扇木窗 · 门前的小凳</span><span>根据武汉饮食文化创作的虚构街巷 <i/> 非历史地点复原</span></footer>
    <dialog className="atelier-about" ref={dialog} onCancel={()=>setAbout(false)} onClick={e=>{if(e.target===e.currentTarget)setAbout(false);}}><div><button className="atelier-about-close" onClick={()=>setAbout(false)} aria-label="关闭说明">×</button><p className="atelier-eyebrow">过早旧影 · 纸景样板</p><h2>日子向前，<br/>街巷里的味道留下来。</h2><p>这间“林记”与两代店主均为虚构。昔日以约 1980 年代为情境，今日描绘接班后的生活变化；器具、服饰与建筑组合是艺术设计，不对应具体年份的历史复原。</p><p>场景用真实三维纸板、折面雨棚、轮廓纸偶与独立物件搭建。手绘图像由 AI 辅助生成；阴影、镜头、蒸汽与纸层运动在浏览器中实时完成。</p><p>你可以点店主、面碗、酱罐和小凳，切换今昔，或展开纸层观察它的构造。</p><a href="./">走进原来的完整故事 →</a></div></dialog>
  </main>;
}


