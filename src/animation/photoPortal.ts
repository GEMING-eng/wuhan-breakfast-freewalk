import { gsap } from 'gsap';
export function photoPortal(photo:HTMLElement,reduced:boolean,done:()=>void) {
  let active=true;
  const stage=document.querySelector<HTMLElement>('.paper-stage');
  const clean=()=>{if(stage)gsap.set(stage,{clearProps:'clipPath'});};
  const finish=()=>{if(active){active=false;clean();done();}};
  const rect=photo.getBoundingClientRect();
  if(stage){const b=stage.getBoundingClientRect();gsap.set(stage,{clipPath:`inset(${Math.max(0,rect.top-b.top)}px ${Math.max(0,b.right-rect.right)}px ${Math.max(0,b.bottom-rect.bottom)}px ${Math.max(0,rect.left-b.left)}px)`});}
  const timeline=gsap.timeline({onComplete:finish});
  timeline.to(photo,{rotation:0,y:0,duration:reduced?.25:.7,ease:'power2.out'})
    .to(photo,{scale:Math.max(innerWidth/rect.width,innerHeight/rect.height)*1.1,rotation:0,duration:reduced?.25:2.8,ease:'power2.inOut'})
    .to(photo.querySelector('.photo-image'),{opacity:0,duration:reduced?.15:.7},reduced?.15:.65)
    .to(photo.querySelector('.photo-caption'),{opacity:0,duration:.2},'<')
    .to(photo.querySelector('.steam'),{opacity:0,duration:.2},'<')
    .to(photo.querySelector('.photo-border'),{opacity:0,duration:reduced?.1:.7},reduced?.25:2.2);
  if(stage)timeline.to(stage,{clipPath:'inset(0px 0px 0px 0px)',duration:reduced?.35:2.8,ease:'power2.inOut'},reduced?.15:.65);
  return {skip:()=>{timeline.kill();finish();},cancel:()=>{active=false;timeline.kill();clean();}};
}
