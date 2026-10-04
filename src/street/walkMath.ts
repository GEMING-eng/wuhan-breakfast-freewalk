/** Walkable street, inset from the shop counters and street furniture. */
export const WALK_BOUNDS = {minX:-3.95,maxX:3.95,minZ:-32,maxZ:19};
export const EYE_HEIGHT = 2.45;
export function walkStep(x:number,z:number,yaw:number,side:number,forward:number,dt:number){
 const length=Math.max(1,Math.hypot(side,forward)),distance=3.2*Math.min(Math.max(dt,0),.08);
 return {x:Math.max(WALK_BOUNDS.minX,Math.min(WALK_BOUNDS.maxX,x+(Math.cos(yaw)*side+Math.sin(yaw)*forward)/length*distance)),
 z:Math.max(WALK_BOUNDS.minZ,Math.min(WALK_BOUNDS.maxZ,z+(Math.sin(yaw)*side-Math.cos(yaw)*forward)/length*distance))};
}
export const clampFov=(fov:number)=>Math.max(38,Math.min(96,fov));
export const angleDelta=(from:number,to:number)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
