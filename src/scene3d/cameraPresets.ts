import type {ShopId} from '../content/story.ts';
export const centers:Record<ShopId,number>={noodle:-4.5,doupi:0,mianwo:4.5};
export interface CameraPreset {id:string;position:[number,number,number];target:[number,number,number];fov:number}
export function cameraPreset(scene:string,portrait:boolean,streetIndex=0,observation=false):CameraPreset {
  const shop=(scene.endsWith('-shop')?scene.replace('-shop',''):null) as ShopId|null;
  if(shop){const x=centers[shop];if(observation){const focus=shop==='noodle'?[-.91,1.70,1.57]:shop==='doupi'?[-.02,2.14,-.70]:[-.72,.53,2.28];return {id:'observe-'+shop+(portrait?'-portrait':'-landscape'),position:[x+focus[0]+.60,focus[1]+.95,focus[2]+(portrait?3.1:3.6)],target:[x+focus[0]+(portrait?0:.65),focus[1],focus[2]],fov:portrait?35:30};}return {id:'shop-'+shop+(portrait?'-portrait':'-landscape'),position:[x+(portrait?.65:2.70),3.50,8.1],target:[x+(portrait?0:1.18),1.95,.38],fov:portrait?43:35};}
  if(portrait){const x=centers[['noodle','doupi','mianwo'][streetIndex] as ShopId];return {id:'street-portrait-'+streetIndex,position:[x+.8,3.9,10.0],target:[x,1.95,.3],fov:40};}
  return {id:'street-landscape',position:[6.4,6.4,20.2],target:[0,1.62,.15],fov:35};
}
