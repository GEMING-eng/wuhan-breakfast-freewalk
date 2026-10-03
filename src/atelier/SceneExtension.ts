import type * as T from 'three';
import type {PaperWorkshop} from './PaperWorkshop';
import type {Detail} from './content';

/** An environment adds world-space scenery while the original shop owns its details. */
export interface SceneExtension{
  readonly illustrated?:boolean;
  configure(scene:T.Scene,renderer:T.WebGLRenderer,camera:T.PerspectiveCamera,shop:T.Group):void;
  build(workshop:PaperWorkshop,scene:T.Scene,shop:T.Group):Promise<void>;
  view(detail:Detail,aspect:number,orbit:number):{position:T.Vector3;target:T.Vector3;direct?:boolean;fov?:number};
  /** turn is the actual wall hinge progress (0 past, 1 present), even when ambient motion pauses. */
  update(time:number,camera:T.PerspectiveCamera,turn:number):void;
  dispose():void;
}
