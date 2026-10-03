import {useEffect,useState} from 'react';
import {useStory} from '../app/StoryProvider';
import {dialogue,shops} from '../content/story';
export function DialoguePanel({paused=false,exploring=false,onExplore,onSound,onFinish}:{paused?:boolean;exploring?:boolean;onExplore:()=>void;onSound:()=>void;onFinish?:()=>void}) {
  const {state,dispatch}=useStory();const node=dialogue[state.dialogueNodeId];let text=node?.text??'';
  if(node?.alternate&&!state.visited[node.alternate.withoutShop])text=node.alternate.text;
  const [shown,setShown]=useState(0);const [hidden,setHidden]=useState(document.hidden);
  useEffect(()=>{const f=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',f);return()=>document.removeEventListener('visibilitychange',f);},[]);
  useEffect(()=>setShown(state.settings.instantText?text.length:0),[state.dialogueNodeId,text,state.settings.instantText]);
  useEffect(()=>{if(paused||hidden||state.settings.instantText||shown>=text.length)return;const t=setTimeout(()=>setShown(n=>n+1),32);return()=>clearTimeout(t);},[shown,text,paused,hidden,state.settings.instantText]);
  if(!node)return null;const full=state.settings.instantText||shown>=text.length;const shop=state.shopId?shops[state.shopId]:null;
  const next=()=>{onSound();if(!full){setShown(text.length);return;}dispatch({type:'NEXT'});onFinish?.();};
  if(exploring&&shop)return <aside className="dialogue paper explore-card"><span className="small-label">观察店里</span><h2>有些故事，<br/>藏在日常的物件里。</h2><p>点一下{shop.objectName}，再回来问问{shop.owner}。</p><button className="text-button" onClick={onExplore}>继续聊天 <span>↗</span></button></aside>;
  const ready=node.end.type==='ready';
  if(ready&&state.screen==='past-street')return <aside className="street-caption paper"><span className="small-label">历史情境 · 约 1980 年代</span><h2>来，过早啊。</h2><p>点店门走近一点，听听这条街的清晨。</p></aside>;
  if(ready&&['present-entry','photo-return','present-ending'].includes(state.screen))return null;
  return <aside className="dialogue paper" aria-label="故事对白" data-node={node.id}>
    <div className="dialogue-heading"><span className="small-label">{shop?shop.name:state.screen==='present-entry'?'一张旧照片':state.screen==='photo-return'?'回望照片':state.screen==='present-ending'?'今天的清晨':'街口的招呼'}</span><span className="fiction-tag">创作对白</span></div>
    <h2>{node.speaker==='我'?'照片之外的我':node.speaker}</h2><div className="ink-rule"/>
    <p className="spoken"><span aria-hidden="true">{text.slice(0,shown)}<span className={!full?'text-caret':''}/></span><span className="sr-only">{text}</span></p>
    {node.end.type==='choices'&&shop&&full?<div className="choices">{shop.topics.filter(t=>!t.requires||state.observed[t.requires]).map(t=><button key={t.id} className={'choice '+(state.topicsRead[t.id]?'read':'')+(t.requires?' new-question':'')} onClick={()=>{onSound();dispatch({type:'CHOOSE_TOPIC',topic:t.id});}}>{t.requires&&<span className="tiny-label">刚才看到的……</span>}<span>{t.label}</span><span aria-hidden="true">{state.topicsRead[t.id]?'↻':'↗'}</span></button>)}<button className="text-button" onClick={onExplore}>我先看看{shop.id==='mianwo'?'摊前':'店里'} <span>→</span></button></div>:<button className="next-button" onClick={next}>{full?'继续':'显示全文'} <span aria-hidden="true">→</span></button>}
    {shop&&<p className="dialogue-foot">{state.completed[shop.id]?'已记下，可继续聊或回到街上':'聊天 · 看食物 · 观察旧物'}</p>}
  </aside>;
}
