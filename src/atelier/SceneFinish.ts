import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

class ContactPass extends SSAOPass{
  private excluded:T.Object3D[]=[];
  render(...args:Parameters<SSAOPass['render']>){
    this.scene.traverse(o=>{if(o.visible&&o.userData.noAO){o.visible=false;this.excluded.push(o);}});
    try{super.render(...args);}finally{this.excluded.forEach(o=>o.visible=true);this.excluded=[];}
  }
}
/** Real geometry contact shadows, linear-light composition, then one display transform. */
export class SceneFinish{
  private composer:EffectComposer;private ao:ContactPass;private output=new OutputPass();
  private ink:ShaderPass|null=null;
  constructor(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.PerspectiveCamera,illustrated=false){
    const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:4});
    this.composer=new EffectComposer(renderer,target);
    // MSAA resolves edge coverage in linear light. Unpremultiply before the display
    // transform, then restore premultiplication for the transparent browser canvas.
    this.output.material.fragmentShader=this.output.material.fragmentShader
      .replace('gl_FragColor = texture2D( tDiffuse, vUv );','gl_FragColor = texture2D( tDiffuse, vUv ); gl_FragColor.rgb /= max(gl_FragColor.a, 0.0001);')
      .replace('#endif\n\n\t\t}', '#endif\n gl_FragColor.rgb *= gl_FragColor.a;\n\t\t}');
    this.composer.addPass(new RenderPass(scene,camera));
    this.ao=new ContactPass(scene,camera,1,1,16);this.ao.kernelRadius=.36;this.ao.minDistance=.001;this.ao.maxDistance=.075;
    this.composer.addPass(this.ao);
    if(illustrated){
      this.ao.kernelRadius=.20;
      this.ink=new ShaderPass({uniforms:{tDiffuse:{value:null},normals:{value:this.ao.normalRenderTarget.texture},resolution:{value:new T.Vector2(1,1)}},
        vertexShader:'varying vec2 uvInk;void main(){uvInk=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:`uniform sampler2D tDiffuse;uniform sampler2D normals;uniform vec2 resolution;varying vec2 uvInk;
          void main(){vec4 color=texture2D(tDiffuse,uvInk);vec2 px=1.1/resolution;
            vec3 n=texture2D(normals,uvInk).rgb;
            float edge=length(n-texture2D(normals,uvInk+vec2(px.x,0.)).rgb)+length(n-texture2D(normals,uvInk+vec2(0.,px.y)).rgb);
            float ink=smoothstep(.25,.75,edge)*.58;
            color.rgb=mix(color.rgb,vec3(.12,.10,.082)*color.a,ink);gl_FragColor=color;
          }`});this.composer.addPass(this.ink);
    }
    this.composer.addPass(this.output);
  }
  resize(w:number,h:number){this.composer.setSize(w,h);this.ink?.uniforms.resolution.value.set(this.ao.width,this.ao.height);}
  render(){this.composer.render();}
  dispose(){this.ink?.dispose();this.ao.dispose();this.ao.ssaoMaterial.dispose();this.ao.noiseTexture.dispose();this.output.dispose();this.composer.dispose();}
}
