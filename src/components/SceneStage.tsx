import {useEffect,useRef,useState,type ReactNode} from 'react';
import { useStory } from '../app/StoryProvider';
import {PaperStage,type StageOptions} from '../scene3d/PaperStage';
export const asset=(path:string)=>import.meta.env.BASE_URL+'assets/'+path;
export function Steam({x=.53,y=.7}:{x?:number;y?:number}){return <div className="steam" aria-hidden="true" style={{left:x*100+'%',top:y*100+'%'}}><i/><i/><i/></div>;}
export function SceneStage({scene,expression='neutral',onBack,onInteract,onPhoto,portraitIndex=0,observing=false,portal=false,paused=false,interactive=true}:{scene:string;focus?:number;character?:string;expression?:string;children?:ReactNode;onBack:()=>void;onInteract?:(id:string)=>void;onPhoto?:(url:string)=>void;portraitIndex?:number;observing?:boolean;portal?:boolean;paused?:boolean;interactive?:boolean}) {
  const stage=useRef<HTMLDivElement>(null),hotspots=useRef<HTMLDivElement>(null),engine=useRef<PaperStage|null>(null);const [status,setStatus]=useState('loading'),[attempt,setAttempt]=useState(0);const {state}=useStory();const callbacks=useRef({onInteract,onPhoto});callbacks.current={onInteract,onPhoto};
  const options:StageOptions={scene,expression,portraitIndex,observing,portal,paused,interactive,reduced:state.settings.reducedMotion,low:state.settings.lowPerformance??false};const latest=useRef(options);latest.current=options;
  useEffect(()=>{let current:PaperStage;try{current=new PaperStage(stage.current!,hotspots.current!,id=>callbacks.current.onInteract?.(id),setStatus,url=>callbacks.current.onPhoto?.(url),latest.current);engine.current=current;void current.update(latest.current);}catch{setStatus('no-webgl');return;}
    const observer=new ResizeObserver(()=>current.resize());observer.observe(stage.current!);return()=>{observer.disconnect();current.dispose();engine.current=null;};},[attempt]);
  useEffect(()=>{if(engine.current)void engine.current.update(options);},[scene,expression,portraitIndex,observing,portal,paused,interactive,state.settings.reducedMotion,state.settings.lowPerformance]);
  return <div className={'stage paper-stage '+(state.settings.reducedMotion?'still':'')} data-scene={scene} data-status={status}>
    <div className="webgl-container" ref={stage} data-three-stage/><div ref={hotspots} className="projected-hotspots"/>
    {status!=='ready'&&<div className="loading-sheet" role="status"><span className="small-label">纸景中的清晨</span><h2>{status==='loading'?'纸片正在搭起老街……':status==='context-lost'?'画面暂时歇了一会儿':'这座纸景暂未展开'}</h2>{status!=='loading'&&<><p>{status==='no-webgl'?'当前浏览器未能开启 WebGL。请尝试支持 WebGL 的浏览器。':'故事进度已保留，可以重试恢复。'}</p><button className="primary" onClick={()=>setAttempt(n=>n+1)}>重试纸景</button><button className="text-button" onClick={onBack}>返回</button></>}</div>}
  </div>;
}
