import * as T from 'three';
import {PaperWorkshop} from './PaperWorkshop';

/** Small built objects add contact shadows and material scale to the printed paper theatre. */
export function addShopDetails(w:PaperWorkshop,parent:T.Group){
  const steamers=new T.Group();steamers.position.set(2.75,1.79,.27);parent.add(steamers);
  for(let level=0;level<3;level++){
    const y=.12+level*.24;
    w.cylinder(steamers,.32,.22,[0,y,0],['#a57b46','#bb9059','#ac8453'][level],48,'wood');
    for(const band of [-.09,.09]){
      const hoop=w.mesh(steamers,new T.TorusGeometry(.321,.016,6,48),w.material('#725333','wood'),[0,y+band,0]);hoop.rotation.x=Math.PI/2;
    }
    for(let i=0;i<20;i++){const a=i*Math.PI/10;const tie=w.box(steamers,[.010,.15,.013],[Math.sin(a)*.326,y,Math.cos(a)*.326],'#debd7e','wood');tie.rotation.y=a;}
  }
  w.cylinder(steamers,.331,.036,[0,.735,0],'#ba965d',48,'wood');
  const loop=w.mesh(steamers,new T.TorusGeometry(.067,.012,6,24,Math.PI),w.material('#5f4b2e'),[0,.758,0]);loop.rotation.y=Math.PI/2;
  const towel=new T.PlaneGeometry(.32,.7,10,20);const pos=towel.getAttribute('position');
  for(let i=0;i<pos.count;i++)pos.setZ(i,Math.cos(pos.getX(i)*70)*.017+Math.pow(pos.getY(i),2)*.08);
  towel.computeVertexNormals();const cloth=w.material('#cfbea0','cloth');cloth.side=T.DoubleSide;
  const rag=w.mesh(parent,towel,cloth,[2.82,2.64,.12]);rag.rotation.z=-.045;
  w.box(parent,[.45,.04,.06],[2.82,3.00,.1],'#76634c','wood');
  for(let i=0;i<3;i++)w.box(parent,[.32,.013,.007],[2.8,2.4+i*.035,.15],'#915044');
  // Stool nails and worn cross rails remain attached to the same physical prop in both eras.
  w.box(parent,[.98,.08,.91],[-3.06,.10,1.13],'#919b8d','stone');
  for(const y of [.83,3.30]){w.box(parent,[.12,.17,.025],[-3.52,y,.48],'#53594f','metal');w.cylinder(parent,.035,.19,[-3.57,y,.505],'#5a6055',16,'metal');}
  // A pair of low tea tins and stamped brass feet provide bright points against matte timber.
  for(let i=0;i<2;i++){
    w.cylinder(parent,.105,.27,[1.74+i*.23,1.93,.42],i?'#a78452':'#768782',32,'metal');
    w.cylinder(parent,.112,.025,[1.74+i*.23,2.08,.42],'#b3b5a4',32,'metal');
  }
}
