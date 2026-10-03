import * as T from 'three';
import {PaperWorkshop} from '../atelier/PaperWorkshop';

const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
export function bench(w:PaperWorkshop,parent:T.Object3D,x:number,z:number,rotation=0){
  const g=new T.Group();g.position.set(x,.1,z);g.rotation.y=rotation;parent.add(g);
  for(let j=0;j<3;j++)w.box(g,[2.05,.08,.16],[0,.72,j*.19-.2],'#785742','wood');
  for(const xx of [-.8,.8])for(const zz of [-.17,.17])w.box(g,[.09,.7,.09],[xx,.35,zz],'#514b3b','wood');
  w.box(g,[1.7,.07,.09],[0,.25,0],'#75563e','wood');return g;
}
export function bicycle(w:PaperWorkshop,parent:T.Object3D,x:number,z:number,rotation=0){
  const g=new T.Group();g.position.set(x,.14,z);g.rotation.set(0,rotation,-.07);parent.add(g);
  for(const xx of [-.76,.76]){
    w.mesh(g,new T.TorusGeometry(.49,.033,7,32),w.material('#353d37'),[xx,.51,0]);
    w.mesh(g,new T.TorusGeometry(.455,.009,4,32),w.material('#919b97','metal'),[xx,.51,0]);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;w.line(g,[V(xx,.51,0),V(xx+Math.cos(a)*.45,.51+Math.sin(a)*.45,0)],'#8c948c',.004);}
  }
  for(const path of [[[-.76,.51,0],[-.18,.52,0],[-.34,1.13,0],[-.76,.51,0]],[[-.34,1.13,0],[.57,1.16,0],[-.18,.52,0]],[[-.18,.52,0],[.57,1.16,0],[.76,.51,0]],[[.57,1.16,0],[.49,1.41,0],[.67,1.43,0]]])w.line(g,path.map(a=>V(...a as [number,number,number])),'#324f4c',.027);
  w.box(g,[.35,.055,.17],[-.35,1.22,0],'#514132');
  w.box(g,[.35,.025,.17],[-.76,1.05,0],'#4f5850','metal');
  w.line(g,[V(-.76,.51,.05),V(-.76,1.05,.05),V(-.32,1.05,.05)],'#576357',.01);
  w.line(g,[V(-.18,.52,0),V(-.3,.39,.12),V(-.42,.39,.12)],'#5e665e',.015);
  return g;
}
export function umbrella(w:PaperWorkshop,parent:T.Object3D,x:number,z:number,color='#b5714f'){
  const g=new T.Group();g.position.set(x,0,z);parent.add(g);
  w.cylinder(g,.035,3.7,[0,1.85,0],'#635344',10);
  const material=w.material(color,'cloth');material.side=T.DoubleSide;
  const geo=new T.ConeGeometry(1.65,.6,10,1,true);w.mesh(g,geo,material,[0,3.36,0]);
  for(let i=0;i<10;i++){const a=i*Math.PI/5;w.line(g,[V(0,3.66,0),V(Math.sin(a)*1.65,3.06,Math.cos(a)*1.65)],'#d5b994',.01);}
  w.cylinder(g,.10,.08,[0,3.72,0],'#755039');return g;
}
export function marketCart(w:PaperWorkshop,parent:T.Object3D,x:number,z:number){
  const g=new T.Group();g.position.set(x,.12,z);g.rotation.y=.12;parent.add(g);
  w.box(g,[2.6,.13,1.4],[0,1.05,0],'#806047','wood');
  for(const xx of [-1.03,1.03])for(const zz of [-.52,.52])w.box(g,[.10,.93,.10],[xx,.54,zz],'#4f4737','wood');
  for(let k=0;k<2;k++){
    const crate=new T.Group();crate.position.set(k*1.28-.64,1.13,0);g.add(crate);
    w.box(crate,[1.18,.05,1.08],[0,0,0],'#9c7853','wood');
    for(const zz of [-.52,.52])for(let j=0;j<3;j++)w.box(crate,[1.17,.09,.04],[0,.10+j*.115,zz],'#967248','wood');
    for(const xx of [-.56,.56])w.box(crate,[.045,.37,1.08],[xx,.18,0],'#a08155','wood');
    if(k===0)for(let i=0;i<22;i++){
      const fruit=w.mesh(crate,new T.SphereGeometry(.12,10,8),w.material(i%3?'#ce8c3e':'#b1a04d'),[-.4+(i%4)*.26,.17+Math.floor(i/12)*.19,-.32+Math.floor(i/4)%3*.27]);fruit.scale.y=.88;
    }else for(let i=0;i<6;i++){
      const cabbage=new T.Group();cabbage.position.set(-.30+(i%2)*.57,.2,Math.floor(i/2)*.31-.32);crate.add(cabbage);
      for(let j=0;j<5;j++){const leaf=w.mesh(cabbage,new T.SphereGeometry(.21,9,7),w.material(['#6f8051','#83935d','#a3ad73'][j%3]),[Math.cos(j*2.4)*.04,0,Math.sin(j*2.4)*.04]);leaf.scale.set(1,.75,1);leaf.rotation.z=j*.24;}
    }
  }
  w.sign(g,'时鲜蔬果',.93,.34,[.1,.78,.742],'#e2cfa1','#574e39');
  w.box(g,[.55,.06,.55],[1.63,.16,0],'#8e7351','wood');
  const basket=w.mesh(g,new T.LatheGeometry([[.18,0],[.27,.1],[.32,.43],[.31,.46]].map(([a,b])=>new T.Vector2(a,b)),24),w.material('#ac9365','wood'),[1.63,.20,0]);(basket.material as T.Material).side=T.DoubleSide;
  return g;
}
export function paperTree(w:PaperWorkshop,parent:T.Object3D,x:number,z:number,scale=1){
  const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);
  w.line(g,[V(0,0,0),V(.08,2,0),V(-.22,4.3,.12),V(.4,7.2,.16)],'#6e6752',.17);
  const crowns:T.Group[]=[];
  for(let i=0;i<7;i++){
    const a=i*2.39,px=Math.sin(a)*1.7,py=5+(i%3)*.8,pz=Math.cos(a)*1.4;
    w.line(g,[V(-.1,3.5,0),V(px*.55,py-.6,pz*.55),V(px,py,pz)],'#7f775d',.058);
    const branch=new T.Group();branch.position.set(px,py,pz);g.add(branch);crowns.push(branch);
    for(let j=0;j<13;j++){
      const angle=j*2.4,leaf=w.shape(branch,[[0,-.25],[-.28,-.08],[-.44,.17],[-.21,.21],[-.27,.47],[0,.34],[.23,.49],[.22,.22],[.43,.17],[.28,-.09]], [Math.cos(angle)*(j%3)*.43,(j%4)*.27,Math.sin(angle)*(j%3)*.4],['#8b9560','#a9a467','#6e825c','#bbaa65'][j%4],.012);
      leaf.rotation.set(-.3+j%2*.4,angle,Math.cos(j)*.6);
    }
  }
  w.box(g,[1.9,.15,1.9],[0,.07,0],'#898d79','stone');w.box(g,[1.7,.02,1.7],[0,.16,0],'#5f6750');return crowns;
}


