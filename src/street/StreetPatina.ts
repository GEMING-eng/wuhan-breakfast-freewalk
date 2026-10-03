import * as T from 'three';
import {PaperWorkshop} from '../atelier/PaperWorkshop';
/** Small marks are geometry in the scene, not a dirt filter over the whole picture. */
export function addStreetPatina(w:PaperWorkshop,parent:T.Group,sockets:Map<string,T.Group>){
 const chipGeo=new T.PlaneGeometry(.085,.025);w.geometries.add(chipGeo);
 const chips=new T.InstancedMesh(chipGeo,w.material('#8e9e8c','stone'),380),matrix=new T.Matrix4(),q=new T.Quaternion();
 for(let i=0;i<380;i++){const row=i%60,col=(i*7)%10,x=-4.5+col+(row%2)*.12+Math.sin(i*17.3)*.34,z=22-row*.93+Math.sin(i*9.4)*.30;q.setFromEuler(new T.Euler(-Math.PI/2,0,i*1.7));matrix.compose(new T.Vector3(x,.057,z),q,new T.Vector3(.5+(i%4)*.5,1,1));chips.setMatrixAt(i,matrix);chips.setColorAt(i,new T.Color(i%3?'#9eae9a':'#dedec4'));}
 chips.castShadow=false;chips.receiveShadow=true;chips.name='pavement-wear-marks';parent.add(chips);
 for(let i=0;i<34;i++){
  const x=-3.9+(i%8)*1.05,z=19-i*1.47;
  const crack=w.line(parent,[new T.Vector3(x,.059,z),new T.Vector3(x+.12,.059,z-.11),new T.Vector3(x+.17,.059,z-.10),new T.Vector3(x+.27,.059,z-.20)],'#7c8b77',.005);crack.castShadow=false;
 }
 for(const [index,socket] of [...sockets.values()].entries()){
  const g=new T.Group();g.name='plaster-and-brick-details-'+index;socket.add(g);
  for(const side of [-1,1]){
   for(let row=0;row<7;row++)for(let col=0;col<2;col++)w.box(g,[.19,.11,.026],[side*(4.33+col*.22),.27+row*.14,2.72],['#a88d73','#bb9f7d','#93947f'][(row+index+col)%3],'stone');
   w.shape(g,[[-.16,0],[.09,.02],[.15,.12],[.10,.24],[-.06,.27],[-.17,.15]],[side*4.43,1.26,2.74],'#c4bea3',.012);
   w.box(g,[.39,.48,.035],[side*4.42,3.04,2.69],'#ded8ba','stone');
   for(let slit=0;slit<5;slit++)w.box(g,[.27,.018,.025],[side*4.42,2.90+slit*.065,2.722],'#7d8c7a');
   for(let j=0;j<3;j++)w.box(g,[.028,.55,.02],[side*(4.16+j*.06),1.40+j*.09,2.74],'#a6ad91');
  }
  // Small repairs and mortar joints along the raised street-side foundation.
  for(let j=0;j<14;j++){w.box(g,[.42,.025,.035],[-3.2+j*.48,.20,2.74],j%3?'#b5b49b':'#dad4ba','stone');}
 }
}
