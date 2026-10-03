import type {Detail} from './content';

/** Subject-centred camera rigs; distance is fitted to both viewport axes. */
export const views: Record<Detail, {target: [number,number,number]; width:number; height:number; elevation:number; yaw:number}> = {
  welcome: {target:[0,3.05,0],width:11.8,height:8.8,elevation:.20,yaw:.16},
  keeper: {target:[-.38,3.14,.3],width:2.75,height:2.4,elevation:.04,yaw:.07},
  bowl: {target:[.51,2.32,1.6],width:2.35,height:1.6,elevation:.18,yaw:.09},
  jar: {target:[-1.76,2.13,1.1],width:1.50,height:1.28,elevation:.34,yaw:.16},
  stool: {target:[-2.94,.53,2.08],width:1.8,height:1.55,elevation:.36,yaw:.28},
};

export function viewDistance(detail:Detail,aspect:number,fov:number){
  const v=views[detail];
  return Math.max(v.height,v.width/Math.max(aspect,.3))/(2*Math.tan(fov*Math.PI/360));
}
