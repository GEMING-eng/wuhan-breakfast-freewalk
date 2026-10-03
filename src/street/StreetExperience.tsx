import {useEffect,useRef,useState} from 'react';
import {AtelierScene} from '../atelier/AtelierScene';
import {MorningStreet} from './MorningStreet';
import {shopPlots,streetViews,type StreetView} from './layout';
import {details,type Detail,type Era} from '../atelier/content';
import {streetMoments,type StreetMoment} from './moments';
import './street.css';

export default function StreetExperience(){
  const initialEra:Era=new URLSearchParams(location.search).get('era')==='present'?'present':'past';
  const host=useRef<HTMLDivElement>(null),marker=useRef<HTMLButtonElement>(null),engine=useRef<AtelierScene|null>(null),world=useRef<MorningStreet|null>(null);
  const [status,setStatus]=useState('loading'),[attempt,setAttempt]=useState(0),[view,setView]=useState<StreetView>('entry'),[motion,setMotion]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [dawn,setDawn]=useState(.36),[detail,setDetail]=useState<Detail>('welcome'),[era,setEra]=useState<Era>(initialEra),[shownEra,setShownEra]=useState<Era>(initialEra),[turning,setTurning]=useState(false);
  const [plot,setPlot]=useState<string|null>(null),[sound,setSound]=useState(false),[about,setAbout]=useState(false);
  const [moment,setMoment]=useState<StreetMoment|null>(null);
  const audio=useRef<HTMLAudioElement|null>(null),dialog=useRef<HTMLDialogElement>(null);
  const latest=useRef({view,motion,dawn,detail,era});latest.current={view,motion,dawn,detail,era};
  useEffect(()=>{
    let alive=true,scene:AtelierScene|undefined;setStatus('loading');
    try{
      const env=new MorningStreet(host.current!);world.current=env;env.setMarker(marker.current);
      scene=new AtelierScene(host.current!,new Map(),s=>{if(alive)setStatus(s);},e=>{if(alive)setShownEra(e);},v=>{if(alive)setTurning(v);},env);engine.current=scene;
      scene.setMotion(latest.current.motion);scene.setEra(latest.current.era);
      void scene.build().then(()=>{if(!alive)return;env.setView(latest.current.view);env.setDawn(latest.current.dawn);scene!.setEra(latest.current.era);scene!.setFocus(latest.current.detail);}).catch(e=>{console.error(e);if(alive)setStatus('failed');});
    }catch(e){console.error(e);setStatus('failed');}
    return()=>{alive=false;scene?.dispose();engine.current=null;world.current=null;};
  },[attempt]);
  useEffect(()=>{engine.current?.setMotion(motion);},[motion]);
  useEffect(()=>{world.current?.setDawn(dawn);},[dawn]);
  useEffect(()=>{const a=new Audio(import.meta.env.BASE_URL+'assets/audio/ambient-past.wav');a.loop=true;a.volume=.13;audio.current=a;const visibility=()=>{if(document.hidden)a.pause();else if(a.dataset.enabled==='true')void a.play().catch(()=>setSound(false));};document.addEventListener('visibilitychange',visibility);return()=>{a.pause();a.src='';audio.current=null;document.removeEventListener('visibilitychange',visibility);};},[]);
  useEffect(()=>{if(about)dialog.current?.showModal();else dialog.current?.close();},[about]);
  const changeView=(id:StreetView)=>{world.current?.setView(id);setView(id);setMoment(null);setPlot(null);setDetail('welcome');engine.current?.setFocus('welcome');};
  const visit=(id:Detail)=>{world.current?.setMoment(null);setMoment(null);world.current?.setShopOverview(false);setDetail(id);setPlot(null);if(id===detail&&id==='keeper'&&host.current?.dataset.focus==='keeper')engine.current?.speakAgain();else engine.current?.setFocus(id);};
  const observe=(id:StreetMoment)=>{world.current?.setMoment(id);setMoment(id);setPlot(null);setDetail('welcome');engine.current?.setFocus('welcome');};
  const selectPlot=(id:string)=>{setPlot(id);world.current?.setPlot(id);engine.current?.setFocus('welcome');};
  const changeEra=(e:Era)=>{if(era===e)return;setEra(e);if(!moment){setDetail('keeper');setView('market');world.current?.setShopOverview(true);}engine.current?.setEra(e);};
  const toggleSound=async()=>{const a=audio.current;if(!a)return;const enable=!sound;a.dataset.enabled=String(enable);if(!enable){a.pause();setSound(false);}else try{await a.play();setSound(true);}catch{setSound(false);}};
  const data=details[shownEra][detail],activePlot=shopPlots.find(p=>p.id===plot),momentData=moment?streetMoments[moment].text[shownEra]:null;
  return <main className="morning-street" data-era={shownEra} data-view={view} data-moment={moment??''}>
    <div className="street-canvas" ref={host} aria-label="武汉清晨老街三维绘本，可拖动查看">
      <button className="street-shop-marker" ref={marker} hidden={status!=='ready'||detail!=='welcome'} onClick={()=>visit('keeper')}><span>林记</span><small>进去坐坐</small></button>
    </div>
    <header className="street-header"><a href="./" className="street-brand"><span>早</span><div>过早旧影<small>武汉 · 巷里的清晨</small></div></a><p>一条老街 · 慢慢醒来</p><div><a className="street-tour-link" href="?sample=tour&v=7">步行游览 ↗</a><button onClick={toggleSound} aria-pressed={sound}>{sound?'声音开':'声音关'}</button><button onClick={()=>setMotion(v=>!v)} aria-pressed={!motion}>{motion?'静一静':'动起来'}</button><button onClick={()=>setAbout(true)} aria-label="打开街巷说明">街巷手记</button></div></header>
    {status!=='ready'&&<div className="street-loading" role="status"><span>过早旧影</span><h1>{status==='loading'?'把清晨，慢慢展开。':'清晨暂时停了一会儿'}</h1><p>{status==='loading'?'铺好石板路，推开一扇木窗。':'可以重新加载这条街。'}</p>{status!=='loading'&&<button onClick={()=>setAttempt(n=>n+1)}>重新展开</button>}</div>}
    {status==='ready'&&detail==='welcome'&&view!=='plan'&&!moment&&<div className="street-period" aria-label="林记今昔"><span>街巷的两个清晨</span><button onClick={()=>changeEra('past')} aria-pressed={era==='past'}>昔日</button><i>↔</i><button onClick={()=>changeEra('present')} aria-pressed={era==='present'}>今日</button></div>}
    {status==='ready'&&detail==='welcome'&&view!=='plan'&&!moment&&<section className="street-title"><p>巷口早市 / 清晨一刻</p><h1>{view==='entry'?<>早起的人，<br/>先闻到芝麻香。</>:view==='reverse'?<>回头看看，<br/>老街还在身后。</>:view==='sunrise'?<>树影里，<br/>坐一会儿。</>:<>再往里，<br/>逛一段清晨。</>}</h1><p className="street-title-note">{streetViews[view].caption}</p><button className="street-enter" onClick={()=>visit("keeper")}>走进林记 <span>↗</span></button></section>}
    {status==='ready'&&detail==='welcome'&&view!=='plan'&&<div className="street-moments" role="group" aria-label="街边小事"><span>街边小事</span>{(Object.keys(streetMoments) as StreetMoment[]).map(id=><button key={id} disabled={turning} onClick={()=>observe(id)} aria-pressed={moment===id}>{streetMoments[id].label}</button>)}</div>}
    {momentData&&<aside className="street-detail street-moment-card" aria-label="街边小事详情"><button className="street-close" onClick={()=>changeView(view)}>回到街上</button><p className="street-kicker">街边小事 · {shownEra==='past'?'昔日':'今日'}</p><h2>{momentData.title}</h2><p>{momentData.body}</p><p className="street-observe-note">{momentData.detail}</p><div className="street-era"><button onClick={()=>changeEra('past')} aria-pressed={era==='past'}>昔日</button><span>看看生活的变化</span><button onClick={()=>changeEra('present')} aria-pressed={era==='present'}>今日</button></div><small className="street-fiction-note">生活意象 · 情境演绎</small></aside>}
    {detail!=='welcome'&&<aside className="street-detail"><button className="street-close" onClick={()=>changeView('market')}>回到街上</button><p className="street-kicker">林记热干面 · {shownEra==='past'?'昔日':'今日'}</p><h2>{data.title}</h2><p>{data.body}</p><div className="street-detail-tabs">{(['keeper','bowl','jar','stool'] as Detail[]).map((id,i)=><button key={id} onClick={()=>visit(id)} aria-pressed={detail===id}>{['店主','面碗','酱罐','小凳'][i]}</button>)}</div><div className="street-era"><button onClick={()=>changeEra('past')} aria-pressed={era==='past'}>昔日</button><span>同一间小铺</span><button onClick={()=>changeEra('present')} aria-pressed={era==='present'}>今日</button></div><a href={"?sample=noodle&art=storybook&era="+shownEra}>单独看看这间店</a></aside>}
    {view==='plan'&&<aside className="street-plan"><p className="street-kicker">街巷布局</p><h2>为下一段故事，<br/>留一扇门。</h2><p>一间林记，五处预留铺位。主街、路边生活与街尾歇脚处已经连成一体。</p><div className="street-plot-list">{shopPlots.map((p,i)=><button key={p.id} onClick={()=>selectPlot(p.id)} aria-pressed={plot===p.id}><b>{String(i+1).padStart(2,'0')}</b><span>{p.name}<small>{p.status==='open'?'已搭建':'预留铺位'}</small></span></button>)}</div>{activePlot&&<p className="street-plot-note">{activePlot.name} · {activePlot.width} × {activePlot.depth} 场景单位<br/>独立铺位，门前留出通行空间。</p>}<button className="street-return" onClick={()=>changeView('entry')}>回到清晨</button></aside>}
    <div className="street-sun-control"><label htmlFor="dawn">晨光<span>{dawn<.3?'拂晓':dawn<.7?'日出':'晨间'}</span></label><input id="dawn" aria-label="晨光高度" type="range" min="0" max="1" step="0.01" value={dawn} onChange={e=>setDawn(+e.target.value)}/><p>轻轻拖动，让光越过屋脊</p></div>
    <nav className="street-navigation" aria-label="漫游老街">{(Object.keys(streetViews) as StreetView[]).map((id,i)=><button key={id} disabled={turning} onClick={()=>changeView(id)} aria-pressed={view===id&&detail==='welcome'}><small>0{i+1}</small>{streetViews[id].label}</button>)}</nav>
    <footer className="street-footer"><span>拖动看街景 · 点击林记走近旧物</span><span>武汉生活意象 · 虚构街巷</span></footer>
    {turning&&<p className="street-turning" role="status">翻过纸墙，走进另一个清晨。</p>}
    <dialog className="street-about" ref={dialog} onCancel={()=>setAbout(false)} onClick={e=>{if(e.target===e.currentTarget)setAbout(false);}}><button onClick={()=>setAbout(false)}>收起手记</button><p className="street-kicker">过早旧影 · 立体绘本</p><h2>街巷里的日子，<br/>一层一层留下来。</h2><p>这是一条根据武汉饮食与街坊生活意象创作的虚构早市。细线与淡彩画出敞开的房间，也留下不同年代的生活痕迹。它不对应具体地点的历史复原。</p><p>林记保留今昔翻墙与两代店主的故事。另外五处铺位保留木门和竹帘，以后可以添上各自的店面与故事。</p><p>人物像纸偶一样缓缓移动，晨光、阴影和树叶在三维空间中变化。可以关闭环境动效，或用底部导航换个角度看。</p></dialog>
  </main>;
}



