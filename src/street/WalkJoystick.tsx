import {useRef,useState,type PointerEvent} from 'react';

export function WalkJoystick({onChange,disabled}:{onChange:(x:number,y:number)=>void;disabled:boolean}){
 const active=useRef<number|null>(null),[offset,setOffset]=useState({x:0,y:0});
 const move=(e:PointerEvent<HTMLDivElement>)=>{if(disabled||active.current!==e.pointerId)return;const r=e.currentTarget.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,scale=Math.max(38,Math.hypot(dx,dy));const x=dx/scale,y=dy/scale;setOffset({x:x*38,y:y*38});onChange(x,y);};
 const stop=()=>{active.current=null;setOffset({x:0,y:0});onChange(0,0);};
 return <div className={'walk-joystick '+(disabled?'is-disabled':'')} role="application" aria-label="移动摇杆" onPointerDown={e=>{if(disabled)return;e.preventDefault();active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><span className="joystick-arrows" aria-hidden="true">↑<br/>←　　→<br/>↓</span><i style={{transform:`translate(${offset.x}px,${offset.y}px)`}}/><small>移动</small></div>;
}
