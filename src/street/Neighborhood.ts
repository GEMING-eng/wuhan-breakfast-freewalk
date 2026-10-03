import * as T from 'three';
import {PaperWorkshop} from '../atelier/PaperWorkshop';
import {bench} from './StreetProps';

const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);

export function latticeWindow(w:PaperWorkshop,parent:T.Object3D,x:number,y:number,z:number,rotation:number){
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);
  w.box(g,[1.60,2.30,.045],[0,0,0],'#b7d2cd');
  for(const xx of [-.83,.83])w.box(g,[.10,2.52,.09],[xx,0,.035],'#b18562','wood');
  for(const yy of [-1.23,1.23])w.box(g,[1.74,.10,.09],[0,yy,.035],'#b18562','wood');
  for(const xx of [-.48,0,.48])w.box(g,[.043,2.30,.075],[xx,0,.05],'#a47d5d','wood');
  for(const yy of [-.71,0,.71])w.box(g,[1.60,.043,.075],[0,yy,.05],'#a47d5d','wood');
  w.box(g,[1.97,.09,.35],[0,-1.28,.13],'#bc956e','wood');flowerPot(w,g,.35,-1.21,.13,.75);
}

export function flowerPot(w:PaperWorkshop,parent:T.Object3D,x:number,y:number,z:number,scale=1){
  const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
  w.mesh(g,new T.LatheGeometry([[.15,0],[.23,.30],[.25,.33],[.21,.34]].map(([a,b])=>new T.Vector2(a,b)),14),w.material('#b77e66','ceramic'));
  for(let i=0;i<7;i++){
    const angle=i*2.4,px=Math.cos(angle)*.20,pz=Math.sin(angle)*.20,h=.54+(i%3)*.11;
    w.line(g,[V(0,.25,0),V(px*.6,.43,pz*.6),V(px,h,pz)],'#69846b',.008);
    for(let side=-1;side<=1;side+=2){const leaf=w.shape(g,[[0,0],[.10,.06],[.15,.17],[.02,.12]],[px*.65,.41,pz*.65],'#849f7a',.005);leaf.rotation.y=angle;leaf.scale.x=side;}
    for(let j=0;j<5;j++){const petal=w.mesh(g,new T.SphereGeometry(.055,6,4),w.material(i%2?'#d49b99':'#efd6bc'),[px+Math.cos(j*1.26)*.04,h,pz+Math.sin(j*1.26)*.04]);petal.scale.y=.45;}
  }
}

export function upperRoomDetails(w:PaperWorkshop,socket:T.Group,index:number,vine:HTMLImageElement){
  // Stairs occupy the gaps between plots, not the reusable shop footprint.
  if(index%2===0){
    const stair=new T.Group();stair.name='external-residential-stair';stair.position.set(5.26,0,0);socket.add(stair);
    for(let n=0;n<17;n++)w.box(stair,[.86,.12,.35],[0,.23+n*.36,2.55-n*.31],'#a88a6c','wood');
    for(const x of [-.40,.40]){
      w.line(stair,[V(x,.2,2.75),V(x,6.18,-2.58)],'#756d59',.055);
      w.line(stair,[V(x,1.04,2.75),V(x,7.02,-2.58)],'#92795a',.031);
      for(let n=0;n<9;n++)w.box(stair,[.035,.92,.035],[x,.56+n*.72,2.6-n*.62],'#9a7c5a','wood');
    }
  }
  for(const x of [-3.25,3.4])flowerPot(w,socket,x,7.44,.74,.8);
  const cascade=w.print(socket,vine,2.8,3.0,[index%2?-3.5:3.2,8.0,.84],true);cascade.castShadow=false;
  // Everyday wall items below the permanent upstairs structure.
  if(index!==0){
    w.sign(socket,'早起开窗\n晚来收衣',.72,1.00,[-4.18,2.7,.33],'#dfcfac','#755841');
    const basin=w.mesh(socket,new T.TorusGeometry(.30,.052,8,24),w.material('#9ebbbc','ceramic'),[3.75,1.2,.34]);basin.rotation.x=.12;
    w.cylinder(socket,.25,.03,[3.75,1.2,.34],'#dce0c6',20,'ceramic').rotation.x=Math.PI/2;
    flowerPot(w,socket,-3.55,.22,1.0,1.4);
    w.box(socket,[.58,.75,.48],[3.8,.48,.9],'#bda784','wood');
  }
}

export function buildNeighborhood(w:PaperWorkshop,parent:T.Group,tree:HTMLImageElement,row:HTMLImageElement){
  const sway:T.Group[]=[],birds:T.Group[]=[];
  // A full ring of quiet residential scenery closes the view behind the walkable lane.
  for(const [x,z,rotation,width,height] of [[0,-43,0,54,18],[-30,-4,Math.PI/2,68,22.7],[30,-4,-Math.PI/2,68,22.7],[0,40,Math.PI,62,20.7]]){
    const rowGroup=new T.Group();rowGroup.position.set(x,0,z);rowGroup.rotation.y=rotation;parent.add(rowGroup);
    const card=w.print(rowGroup,row,width,height,[0,height/2,0],true);card.castShadow=false;card.receiveShadow=false;
  }
  // Small rear courtyards fill the space around the street without occupying shop sockets.
  for(const side of [-1,1]){
    w.box(parent,[9,.05,51],[side*20,.025,-5],'#acbfa2','stone');
    for(const z of [15,1,-13,-27]){
      w.box(parent,[8.8,1.15,.22],[side*20,.57,z],'#babdaa','stone');
      for(let i=0;i<12;i++)w.box(parent,[.69,.09,.36],[side*20-4.03+i*.73,1.18,z],'#7e9690','stone');
      for(const x of [side*16,side*24]){
        w.box(parent,[.38,1.50,.38],[x,.75,z],'#a3b6a8','stone');
        flowerPot(w,parent,x,1.53,z,1.3);
      }
      for(let k=0;k<5;k++)w.box(parent,[1.0,.045,1.1],[side*18,.07,z-2-k*1.65],'#cbd0b9','stone');
    }
  }
  const positions=[[-6,-31,10,.25],[10.8,18.2,9,-.45],[9,-31,11,-.25],[-20,14,12,.5],[21,-12,12,-.6],[-20,-24,11,.1],[22,22,12,-.3]];
  for(const [x,z,height,rotation] of positions){
    const group=new T.Group();group.position.set(x,.05,z);group.rotation.y=rotation;group.userData.animationRoot=true;parent.add(group);
    const card=w.print(group,tree,height*2/3,height,[0,height/2,0],true);card.geometry.computeBoundingBox();card.position.y=.03-card.geometry.boundingBox!.min.y;
    w.box(parent,[2.3,.15,2.3],[x,.075,z],'#bdc3ac','stone');w.box(parent,[2.05,.02,2.05],[x,.16,z],'#809172');
    sway.push(group);
  }
  // The lane ends at a planted sitting court, with a side opening toward the neighborhood.
  w.box(parent,[23,.06,8],[0,.05,-32],'#c2c6b0','stone');
  for(let row=0;row<4;row++)for(let col=0;col<19;col++)w.box(parent,[1.10,.04,1.4],[-10.5+col*1.17,.09,-29-row*1.53],['#d2cdb2','#bdc5b3','#c8c8ad'][(row+col)%3],'stone');
  for(const [x,width] of [[-7,8],[7,8]]){
    w.box(parent,[width,1.4,.28],[x,.74,-36],'#a9b9ad','stone');w.box(parent,[width+.14,.14,.50],[x,1.49,-36],'#7f9690','stone');
    for(let n=0;n<5;n++)flowerPot(w,parent,x-3+n*1.5,1.58,-36,1.1);
  }
  bench(w,parent,-2.7,-34.2);bench(w,parent,4.0,-34.2);
  w.sign(parent,'巷深处　慢慢坐',2.6,.55,[0,2.7,-35.8],'#79998c','#f4e3bf');
  for(const x of [-1.45,1.45])w.box(parent,[.10,3,.12],[x,1.5,-35.8],'#a98b67','wood');
  // Two paper birds cross above the rooftops; their wing groups hinge independently.
  for(let i=0;i<2;i++){
    const bird=new T.Group();bird.userData.animationRoot=true;bird.position.set(-2+i*2,13+i*.65,-14);parent.add(bird);
    w.shape(bird,[[0,-.08],[-.11,0],[0,.2],[.11,0]],[0,0,0],'#718e92',.018);
    for(const side of [-1,1]){const wing=new T.Group();wing.userData.side=side;bird.add(wing);w.shape(wing,[[0,0],[side*.55,.15],[side*.76,.38],[side*.26,.25]],[0,0,0],'#9fbabd',.015);}
    birds.push(bird);
  }
  return {sway,birds};
}
