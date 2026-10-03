import * as T from 'three';
import {PaperWorkshop} from './PaperWorkshop';

/** Low-density ribbons rise from the food surface; no solid smoke planes in shadows or AO. */
export function makeSteam(w:PaperWorkshop,parent:T.Object3D,origin:T.Vector3){
  const wisps:T.Mesh<T.PlaneGeometry,T.ShaderMaterial>[]=[];
  for(let i=0;i<5;i++){
    const material=w.ownMaterial(new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
      uniforms:{time:{value:0},seed:{value:i*2.37},strength:{value:.32}},
      vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float time; uniform float seed; uniform float strength; varying vec2 vUv;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
        void main(){float y=vUv.y;float sway=sin(y*8.-time*.65+seed)*(.05+y*.12)+sin(y*17.-time+seed)*.025;
          float width=.045+y*.125;float ribbon=exp(-pow((vUv.x-.5-sway)/width,2.));
          float n=noise(vec2(vUv.x*8.+seed,y*6.-time*.47));n=.45+.55*n;
          float fade=smoothstep(0.,.1,y)*(1.-smoothstep(.5,1.,y));
          float pulse=.66+.34*sin(time*.8+seed+y*9.);
          gl_FragColor=vec4(vec3(.97,.95,.88),ribbon*n*fade*pulse*strength);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` }));
    const mesh=w.mesh(parent,new T.PlaneGeometry(.63,1.18+i%2*.18),material) as T.Mesh<T.PlaneGeometry,T.ShaderMaterial>;
    mesh.position.copy(origin).add(new T.Vector3((i-2)*.10,.55, .025*i));mesh.castShadow=false;mesh.receiveShadow=false;mesh.renderOrder=2;mesh.userData.noAO=true;wisps.push(mesh);
  }
  const cameraRotation=new T.Quaternion(),parentRotation=new T.Quaternion();
  return {meshes:wisps,update(time:number,camera:T.Camera,visible:boolean){camera.getWorldQuaternion(cameraRotation);parent.getWorldQuaternion(parentRotation).invert();wisps.forEach(m=>{m.visible=visible;m.material.uniforms.time.value=time;m.quaternion.copy(parentRotation).multiply(cameraRotation);});}};
}
