import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shopPlots,streetViews} from '../src/street/layout.ts';
import * as T from 'three';
import {PaperWorkshop} from '../src/atelier/PaperWorkshop.ts';

function bounds(p:typeof shopPlots[number]){
  const dx=Math.abs(Math.cos(p.rotation))*p.width/2+Math.abs(Math.sin(p.rotation))*p.depth/2;
  const dz=Math.abs(Math.sin(p.rotation))*p.width/2+Math.abs(Math.cos(p.rotation))*p.depth/2;
  return {left:p.x-dx,right:p.x+dx,back:p.z-dz,front:p.z+dz};
}
test('shop footprints do not block the central walking lane',()=>{
  for(const plot of shopPlots){const b=bounds(plot);assert.ok(b.right<=-4.75||b.left>=4.75,plot.id+' intrudes into the walking lane');}
});
test('all shop volumes are mutually separate with room for shared structure',()=>{
  for(let i=0;i<shopPlots.length;i++)for(let j=i+1;j<shopPlots.length;j++){
    const a=bounds(shopPlots[i]),b=bounds(shopPlots[j]);assert.ok(a.right+.5<=b.left||b.right+.5<=a.left||a.front+.5<=b.back||b.front+.5<=a.back,`${shopPlots[i].id} overlaps ${shopPlots[j].id}`);
  }
});
test('reusable shop sockets face toward the street and have stable identifiers',()=>{
  assert.equal(new Set(shopPlots.map(p=>p.id)).size,shopPlots.length);
  for(const p of shopPlots){assert.ok(Math.sin(p.rotation)*p.x<0);assert.ok(p.width>0&&p.depth>0&&p.height>0);}
});
test('street camera views have a useful nonzero distance and stay above ground',()=>{
  for(const v of Object.values(streetViews)){assert.ok(v.position[1]>2);assert.ok([...v.position,...v.target].every(Number.isFinite));assert.ok(Math.hypot(...v.position.map((n,i)=>n-v.target[i]))>5);}
});
test('replaceable closure remains independently removable after scenery batching',()=>{
  const workshop=new PaperWorkshop();workshop.illustrated=true;
  const root=new T.Group(),closure=new T.Group();closure.name='removable-closure-example';closure.userData.animationRoot=true;root.add(closure);
  for(let i=0;i<4;i++){workshop.box(closure,[1,2,.1],[i,1,0],'#8b7458','wood');workshop.box(root,[1,2,.1],[i,1,-3],'#8b7458','wood');}
  workshop.batchStatic(root);workshop.batchScenery(root);
  assert.ok(closure.children.some(c=>c instanceof T.Mesh));const before=new T.Box3().setFromObject(root);assert.ok(before.max.z>=.04);
  closure.removeFromParent();const after=new T.Box3().setFromObject(root);assert.ok(after.max.z<-2.9);workshop.dispose();
});
