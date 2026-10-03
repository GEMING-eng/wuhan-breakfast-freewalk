export interface AssetEntry {id:string;path:string;purpose:string;period:'past'|'present'|'shared';status:'final'|'draft'|'missing';referenceId:string;license:string;alpha:boolean;dimensions:[number,number]|null}
const print=(id:string,path:string,purpose:string,dimensions:[number,number]):AssetEntry=>({id,path,purpose,period:'past',status:'final',referenceId:'ART02',license:'本项目原创 SVG 印刷图案；空间光影由 Three.js 灯光产生，非历史档案。',alpha:true,dimensions});
export const assetManifest:AssetEntry[]=[
  ...(['lin','zhou','chen'] as const).flatMap(id=>['neutral',id==='zhou'?'thought':'warm'].map(pose=>print(id+'-'+pose,'characters/'+id+'-'+pose+'.svg','独立轮廓纸偶与印刷表情',[500,750]))),
  ...(['noodle','doupi','mianwo','saucejar','spatula','stool'] as const).map(id=>print(id,'objects/'+id+'.svg','纸面图案 / 食物小札；小凳本体采用立体纸板组装',[500,500])),
  {id:'photo-front',path:'scenes/photo-front.png',purpose:'同一历史纸景、固定街景镜头渲染的剧情照片',period:'past',status:'final',referenceId:'ART02',license:'本项目原创三维纸景渲染，不是档案照片',alpha:false,dimensions:[960,540]},
  {id:'paper-geometry',path:'src/scene3d/ShopBuilder.ts',purpose:'地面、后墙、独立门框、折雨棚、盒柜台、货架、凳、轮廓人物与物件、前景植被',period:'shared',status:'final',referenceId:'ERA01 / ART02',license:'本项目原创程序几何；时代组合属艺术化演绎',alpha:false,dimensions:null},
  {id:'paper-materials',path:'src/scene3d/PaperPart.ts',purpose:'原创纸纹、砖面、木纹、雨棚和屋瓦印刷面；暖米白纸边',period:'shared',status:'final',referenceId:'ART02',license:'本项目原创 Canvas 程序纹理与材质',alpha:false,dimensions:[1024,512]},
  {id:'photo-back',path:'src/app/App.tsx',purpose:'照片背面创作留言与 HTML 相纸边框',period:'shared',status:'final',referenceId:'ART02',license:'本项目原创文字与 CSS 纸纹',alpha:false,dimensions:null},
  {id:'steam',path:'src/scene3d/ShopBuilder.ts',purpose:'每店三条有限纸片蒸汽；低性能/简化动效时关闭',period:'past',status:'final',referenceId:'ART02',license:'本项目原创形状、材质与程序运动',alpha:true,dimensions:null},
  ...['ambient-present','ambient-past','paper','choice'].map(id=>({id,path:'audio/'+id+'.wav',purpose:'原创合成环境与交互声音',period:'shared' as const,status:'final' as const,referenceId:'AUD01',license:'本项目原创程序合成；无采样、真人声音或配音',alpha:false,dimensions:null}))
];
