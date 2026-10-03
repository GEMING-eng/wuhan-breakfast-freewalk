import * as T from 'three';
import {PaperWorkshop} from '../atelier/PaperWorkshop';
import {makeSteam} from '../atelier/Steam';
const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
/** Two distinct tasting counters occupy the existing sockets, without changing the street. */
export class FoodStalls{
 private steam:ReturnType<typeof makeSteam>[]=[];
 constructor(w:PaperWorkshop,sockets:Map<string,T.Group>,interiors:HTMLImageElement[]){
  for(const id of ['doupi','mianwo']){
   const socket=sockets.get(id)!;socket.getObjectByName('removable-closure-'+id)?.removeFromParent();
   const g=new T.Group();g.name='food-stall-'+id;socket.add(g);const doupi=id==='doupi';
   w.box(g,[9.2,5.9,.12],[0,3,-2.42],doupi?'#c5cfb6':'#ded3b4','stone');
   w.print(g,interiors[doupi?0:1],9.2,5.9,[0,3,-2.349]);
   for(let row=0;row<3;row++)for(let col=0;col<18;col++){w.box(g,[.46,.22,.025],[-4.3+col*.5+(row%2)*.12,.2+row*.25,-2.34],['#9ba88e','#b1b59c','#929d89'][(row+col)%3],'stone');}
   w.box(g,[8.8,.22,3.9],[0,.03,-.4],'#bbb7a3','stone');
   for(const x of [-4.2,4.2])w.box(g,[.16,5.6,.16],[x,2.8,1.18],'#9a7553','wood');
   w.box(g,[8.7,.16,.21],[0,5.48,1.18],'#87674a','wood');
   w.sign(g,doupi?'三 鲜 豆 皮':'现 炸 面 窝',5.9,.94,[0,4.76,1.21],doupi?'#bb764f':'#748d78','#f2e4bf',doupi?'糯 米 软 香　·　趁 热 尝 尝':'厚 边 薄 心　·　早 起 一 口');
   for(let i=0;i<12;i++){const awning=w.box(g,[.69,.045,2.2],[-3.8+i*.69,4.07,1.43],i%2?'#eee0b5':doupi?'#c89961':'#96ad89','cloth');awning.rotation.x=.16;w.box(g,[.69,.27,.03],[-3.8+i*.69,3.78,2.53],i%2?'#eee0b5':doupi?'#c89961':'#96ad89','cloth');}
   const counter=new T.Group();counter.position.set(0,0,1.0);counter.scale.y=.78;g.add(counter);
   w.box(counter,[6.4,1.83,1.4],[0,1.06,0],doupi?'#ad805c':'#809b87','wood');w.box(counter,[6.68,.14,1.64],[0,2.04,0],'#d0b08b','wood');
   for(let i=0;i<14;i++)w.box(counter,[.016,1.49,.012],[-3+i*.46,1.10,.708],'#685d46','wood');
   for(const x of [-2.9,2.9])for(const y of [.45,1.8]){const nail=w.mesh(counter,new T.SphereGeometry(.025,6,4),w.material('#5a6556','metal'),[x,y,.723]);nail.scale.z=.25;}
   w.box(g,[1.65,.09,.50],[-3.0,3.07,-2.15],'#ac805b','wood');
   for(let j=0;j<3;j++){const jar=w.cylinder(g,.15,.27,[-3.54+j*.52,3.24,-2.08],j%2?'#d6ddd0':'#829d90',20,'ceramic');w.cylinder(g,.155,.035,[jar.position.x,3.385,-2.08],'#8b6c48',16,'wood');}
   for(let i=0;i<4;i++){const plate=w.cylinder(counter,.38,.065,[2.31,2.14+i*.075,.04],'#d8decc',28,'ceramic');plate.receiveShadow=true;}
   w.cylinder(counter,.23,.45,[2.70,2.30,-.29],'#a78b5e',20,'wood');for(let i=0;i<9;i++)w.box(counter,[.027,.65,.027],[2.56+(i%3)*.10,2.60,-.4+Math.floor(i/3)*.10],'#836443','wood');
   w.sign(counter,doupi?'一口糯香':'一口酥香',1.9,.6,[1.6,1.11,.74],'#eee1bd','#71694d');
   if(doupi){
    w.box(counter,[3.25,.11,1.18],[-1,2.16,0],'#71786b','metal');
    for(let row=0;row<3;row++)for(let col=0;col<5;col++){
     const x=-2.18+col*.58,z=-.39+row*.38;w.box(counter,[.53,.12,.33],[x,2.28,z],'#e5d4a1');w.box(counter,[.54,.035,.34],[x,2.355,z],'#d4a24a');
     for(let j=0;j<3;j++)w.box(counter,[.04,.022,.045],[x-.15+j*.13,2.38,z+Math.sin(col+j)*.10],j===0?'#79935a':'#a47240');
    }
    w.box(counter,[.39,.025,.44],[.36,2.29,.08],'#9aa698','metal');w.box(counter,[.07,.05,.64],[.36,2.33,-.36],'#99754d','wood');
   }else{
    const pan=w.mesh(counter,new T.SphereGeometry(.81,32,16,0,Math.PI*2,0,Math.PI/2),w.material('#626d61','metal'),[-1.13,2.35,-.03]);pan.rotation.x=Math.PI;pan.scale.y=.22;
    w.cylinder(counter,.75,.012,[-1.13,2.29,-.03],'#b29450',32);
    for(let j=0;j<5;j++){const ring=w.mesh(counter,new T.TorusGeometry(.22,.084,8,22),w.material(j%2?'#cc9650':'#dcb367'),[-1.44+(j%2)*.59,2.40, -.39+Math.floor(j/2)*.36]);ring.rotation.x=-Math.PI/2;ring.scale.y=.83;}
    w.line(counter,[V(-.4,2.36,-.1),V(.1,2.53,-.36),V(.35,2.58,-.45)],'#798b7a',.037);
    w.box(counter,[.1,.08,.40],[.35,2.60,-.53],'#a87850','wood');
   }
   const steamParent=new T.Group();steamParent.userData.animationRoot=true;counter.add(steamParent);this.steam.push(makeSteam(w,steamParent,V(-1,2.48,0)));
   const lamp=w.mesh(g,new T.SphereGeometry(.105,12,8),w.ownMaterial(new T.MeshStandardMaterial({color:'#fff2c9',emissive:'#ffd49a',emissiveIntensity:.7})),[0,3.52,.38]);lamp.castShadow=false;w.line(g,[V(0,4.13,.38),V(0,3.6,.38)],'#65715f',.012);
  }
 }
 update(time:number,camera:T.Camera){this.steam.forEach(s=>s.update(time,camera,true));}
}
