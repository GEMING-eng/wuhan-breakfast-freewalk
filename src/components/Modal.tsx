import {useEffect,useRef,type ReactNode} from 'react';
export function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}) {
  const root=useRef<HTMLDivElement>(null);const closeRef=useRef(onClose);closeRef.current=onClose;
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const el=root.current!;const background=document.getElementById('experience');background?.setAttribute('inert','');el.querySelector<HTMLButtonElement>('button')?.focus();
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closeRef.current();}if(e.key==='Tab'){const a=[...el.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, [tabindex="0"]')].filter(n=>n.getClientRects().length);const first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);background?.removeAttribute('inert');if(previous?.isConnected)previous.focus();};
  },[]);
  return <div className="modal-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)onClose();}}><div ref={root} role="dialog" aria-modal="true" aria-labelledby="modal-title" className={'modal paper '+(wide?'wide':'')}><div className="modal-head"><span className="small-label">味觉中国 · 过早旧影</span><button className="icon-button" aria-label="关闭覆盖层" onClick={onClose}>×</button></div><h2 id="modal-title">{title}</h2>{children}</div></div>;
}
