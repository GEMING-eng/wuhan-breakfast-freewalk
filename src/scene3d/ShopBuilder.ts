import * as T from 'three';
import {PaperFactory} from './PaperPart';
import {shops,shopIds,type ShopId} from '../content/story';
import {centers} from './cameraPresets';
export {centers} from './cameraPresets';
export const ownerPaths={lin:'M207 45 Q168 55 163 108 L158 170 Q126 178 128 212 L122 240 Q87 255 70 300 L42 508 Q31 548 61 562 L123 555 L128 697 Q241 730 368 697 L376 555 L426 561 Q461 548 450 507 L423 299 Q410 263 370 242 L348 219 L340 162 L337 109 Q330 52 275 43Z',zhou:'M178 53 Q241 20 310 48 Q340 59 346 113 L344 181 L330 222 Q330 241 374 254 L400 270 L426 330 L450 510 Q461 552 422 567 L374 554 L373 703 Q250 722 124 703 L125 557 L75 566 Q35 550 44 509 L72 331 L93 276 Q137 252 166 234 L168 203 L153 159 L155 103Z',chen:'M176 51 Q253 23 321 53 L349 100 L349 167 L333 206 L333 236 L379 256 L412 294 L447 500 Q463 546 425 563 L375 550 L373 705 Q250 724 122 705 L126 550 L72 565 Q36 549 46 507 L73 300 L100 266 L168 237 L168 206 L151 164 L154 102Z'};
export const objectPaths={noodle:'M63 223Q65 158 250 150Q432 147 440 223Q420 410 250 437Q85 417 63 223Z',doupi:'M38 368L55 307 142 200 308 161 410 241 461 370Q459 448 250 447Q36 434 38 368Z',mianwo:'M65 267C65 210 101 157 150 156C190 124 224 147 251 135C291 122 329 156 358 158C406 158 439 200 442 247C459 305 410 359 370 368C330 410 279 393 252 411C210 421 167 393 137 388C89 379 50 323 65 267Z',saucejar:'M121 54L146 52 207 190Q275 184 360 203L376 379Q372 423 253 422Q127 421 124 379L135 224Z',spatula:'M222 67Q252 56 278 68L278 226 266 226 266 267Q309 265 315 274L330 430Q249 454 170 430L187 272 237 264 237 228 220 228Z'};
export interface Anchor {id:string;label:string;kind:'person'|'food'|'object'|'shop';shop:ShopId;object:T.Object3D;local:T.Vector3}
export interface BuiltStage {root:T.Group;anchors:Anchor[];owners:Record<ShopId,T.Mesh>;ownerPrints:Record<ShopId,[T.Texture,T.Texture]>;shops:Record<ShopId,T.Group>;steam:T.Group[]}
export async function buildStage(f:PaperFactory,period:'past'|'present',base:string):Promise<BuiltStage>{
  const root=new T.Group();root.name='wuhan-paper-street';const anchors:Anchor[]=[],owners={} as Record<ShopId,T.Mesh>,ownerPrints={} as Record<ShopId,[T.Texture,T.Texture]>,shopGroups={} as Record<ShopId,T.Group>,steam:T.Group[]=[];
  f.board(root,'ground-paper',[16,.16,8.8],[0,-.13,.15],period==='past'?'#d8c5a1':'#e1d4b8','stone');
  f.board(root,'rear-fold',[15,6,.08],[0,2.95,-2.5],'#dbcdb0','wall');
  // Distant cutout homes are geometry, separated from the facade.
  for(let i=0;i<6;i++){const x=-7+i*2.8;f.shape(root,'distant-house-'+i,[[-1.5,0],[-1.5,3.4],[-.5,4.1],[.4,3.8],[1.5,4.1],[1.5,0]],[x,0,-2.30],'#c4b69b',.055);for(let j=0;j<2;j++)f.board(root,'distant-window-'+i+'-'+j,[.36,.64,.035],[x-.6+j*1.2,2.6,-2.22],'#8a8d7a');}
  for(const id of shopIds){const group=new T.Group();group.position.x=centers[id];root.add(group);shopGroups[id]=group;const color=id==='noodle'?'#a75643':id==='doupi'?'#c2a773':'#688477';const name=id==='noodle'?'lin':id==='doupi'?'zhou':'chen';
    f.board(group,id+'-backwall',[4.3,3.6,.08],[0,1.8,-1.12],period==='past'?'#ddcca9':'#e6dcc4','wall');
    f.board(group,id+'-left-return',[.09,3.6,1.15],[-2.13,1.8,-.53],'#c6b28d','wall');f.board(group,id+'-right-return',[.09,3.6,1.15],[2.13,1.8,-.53],'#c6b28d','wall');
    for(const x of [-2.02,2.02])f.board(group,id+'-door-post-'+x,[.16,3.55,.16],[x,1.78,.08],'#8b6a48','wood');
    f.board(group,id+'-door-lintel',[4.2,.18,.2],[0,3.50,.10],'#8b6a48','wood');
    // Roof is folded cardboard: top pitched face, separate hanging scalloped face.
    const roof=f.board(group,id+'-roof',[4.48,.08,1.65],[0,3.78,-.43],'#6d7064','roof');roof.rotation.x=.14;
    const awning=f.board(group,id+'-folded-awning',[4.48,.06,1.45],[0,3.29,.72],color,'awning');awning.rotation.x=.20;
    const edge:[number,number][]=[[-2.24,.25],[2.24,.25],[2.24,-.02]];for(let i=0;i<14;i++)edge.push([2.24-(i+.5)*4.48/14,-.11-(i%2)*.06]);edge.push([-2.24,-.02]);f.shape(group,id+'-awning-valance',edge,[0,3.13,1.47],color,.045);
    f.text(group,id+'-shop-sign',shops[id].name,2.10,.51,[0,3.88,1.55],'#efe2c0','#614a35',160);
    f.board(group,id+'-counter',[3.76,1.22,1.04],[0,.67,1.04],period==='past'?'#a68352':'#b79c72','wood');f.board(group,id+'-counter-top',[3.96,.09,1.17],[0,1.33,1.02],'#c4a577','wood');
    for(const x of [-1.60,-.82,0,.82,1.60])f.board(group,id+'-counter-seam-'+x,[.019,1.07,.025],[x,.64,1.585],'#72573e');
    f.board(group,id+'-shelf-top',[1.60,.065,.36],[.85,2.68,-.76],'#a28056','wood');f.board(group,id+'-shelf-low',[1.60,.065,.36],[.85,2.00,-.76],'#a28056','wood');
    for(let row=0;row<2;row++)for(let j=0;j<3;j++){const bowl=f.shape(group,id+'-shelf-bowl-'+row+'-'+j,[[-.18,.08],[.18,.08],[.12,-.10],[-.12,-.10]],[.27+j*.48,2.10+row*.68,-.70],'#eee3c9',.025);f.board(group,id+'-bowl-blue-'+row+'-'+j,[.30,.025,.017],[.27+j*.48,2.09+row*.68,-.661],'#6d8a95');bowl.castShadow=true;}
    f.board(group,id+'-window-frame',[.98,1.23,.055],[-1.22,2.35,-.985],'#846b4a','wood');f.board(group,id+'-window-pane',[.78,1.04,.04],[-1.22,2.35,-.94],'#98a39a');f.board(group,id+'-window-bar',[.045,1.08,.055],[-1.22,2.35,-.9],'#b39a70','wood');
    const neutral=await f.loadPrint(name+'-neutral',base+'characters/'+name+'-neutral.svg'),warm=await f.loadPrint(name+'-warm',base+'characters/'+name+'-'+(name==='zhou'?'thought':'warm')+'.svg');ownerPrints[id]=[neutral,warm];
    const owner=f.card(group,id+'-paper-owner',ownerPaths[name],neutral,1.42,2.35,[-.82,1.95,.30],period==='past'?'character-'+id:null);owners[id]=owner;if(period==='present')owner.visible=false;
    const foodTex=await f.loadPrint(id+'-food',base+'objects/'+id+'.svg');const food=f.card(group,id+'-food',objectPaths[id],foodTex,id==='doupi'?1.12:.98,id==='doupi'?1.0:.87,[.62,1.61,1.57],'food-'+id,[500,500]);food.rotation.y=-.04;
    let observation:T.Object3D;
    if(id==='noodle'){const tex=await f.loadPrint('saucejar',base+'objects/saucejar.svg');observation=f.card(group,'sauce-jar',objectPaths.saucejar,tex,.69,.82,[-.91,1.62,1.57],'observe-noodle',[500,500]);}
    else if(id==='doupi'){const tex=await f.loadPrint('spatula',base+'objects/spatula.svg');observation=f.card(group,'old-spatula',objectPaths.spatula,tex,.68,1.17,[-.02,2.14,-.79],'observe-doupi',[500,500]);}
    else{const stool=new T.Group();stool.position.set(-.72,0,2.28);group.add(stool);stool.name='old-stool';stool.userData.interactionId='observe-mianwo';f.board(stool,'stool-seat',[.87,.075,.63],[0,.69,0],'#b9915e','wood','observe-mianwo');for(const x of [-.31,.31])for(const z of [-.22,.22]){const leg=f.board(stool,'stool-leg-'+x+'-'+z,[.09,.66,.085],[x,.34,z],'#a77c4c','wood','observe-mianwo');leg.rotation.z=-x*.17;}f.board(stool,'stool-brace',[.64,.07,.08],[0,.27,.23],'#9d7549','wood','observe-mianwo');observation=stool;}
    const pot=f.board(group,id+'-cooking-pan',[.74,.18,.40],[1.13,1.46,.93],id==='doupi'?'#58625d':'#78817a');pot.rotation.y=.07;
    anchors.push({id:'shop-'+id,label:shops[id].name,kind:'shop',shop:id,object:group,local:new T.Vector3(0,2.38,1.05)},{id:'character-'+id,label:'与'+shops[id].owner+'聊聊',kind:'person',shop:id,object:owner,local:new T.Vector3(-.65,.56,.10)},{id:'food-'+id,label:'看看'+(id==='noodle'?'热干面':id==='doupi'?'豆皮':'面窝'),kind:'food',shop:id,object:food,local:new T.Vector3(0,.05,.09)},{id:'observe-'+id,label:'观察'+shops[id].objectName,kind:'object',shop:id,object:observation,local:id==='mianwo'?new T.Vector3(0,.73,.12):new T.Vector3(0,0,.09)});
    const vapor=new T.Group();group.add(vapor);vapor.position.set(.64,1.98,1.64);vapor.name=id+'-steam';steam.push(vapor);for(let i=0;i<3;i++){const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.12,.12,.09,.23,0,.34);shape.lineTo(.05,.34);shape.bezierCurveTo(.16,.20,-.05,.11,.05,0);const m=new T.MeshBasicMaterial({color:'#f2e9cd',transparent:true,opacity:.30,side:T.DoubleSide,depthWrite:false});const v=new T.Mesh(new T.ShapeGeometry(shape),m);v.position.x=(i-1)*.12;v.castShadow=false;v.userData.phase=i*1.9;vapor.add(v);}
  }
  // Foreground paper plants have independent depth and silhouette shadows.
  for(const x of [-7.3,7.3]){const g=new T.Group();g.position.set(x,0,1.8);root.add(g);f.board(g,'plant-trunk-'+x,[.12,4.5,.08],[0,2.2,0],'#92764e','wood');for(let i=0;i<7;i++){const leaf=f.shape(g,'leaf-'+x+'-'+i,[[0,-.12],[-.48,.12],[-.70,.50],[-.28,.67],[.1,.28]],[i%2?.32:-.10,1.9+i*.33,.04+i*.02],i%2?'#8c9b76':'#71856c',.03);leaf.rotation.z=i%2?-.45:.35;}}
  if(period==='present'){f.text(root,'contemporary-note','清晨 · 仍在继续',3,.5,[.1,4.85,-2.0],'#dfdac6','#647064',140);for(const x of [-4.5,0,4.5]){f.board(root,'present-metal-'+x,[3.64,.035,.045],[x,1.34,1.63],'#a9b9b5');}}
  root.updateMatrixWorld(true);return {root,anchors,owners,ownerPrints,shops:shopGroups,steam};
}
