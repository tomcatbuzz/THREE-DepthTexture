import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment from './shader/fragment.glsl';
import vertex from './shader/vertex.glsl';
import * as dat from 'dat.gui';
// import gsap from 'gsap';

import model from '../img/facefull.glb';

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.scene1 = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1); 
    this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.count = 0;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      5
    );

    this.camera1 = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      2.1,
      3
    );


    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, -0.5, 1);
    this.camera1.position.set(0, 0, 2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0.6,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 6, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    

    // image cover
    this.imageAspect = 1;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect) {
      a1 = (this.width/this.height) * this.imageAspect ;
      a2 = 1;
    } else{
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;


    // optional - cover with quad
    // const dist  = this.camera.position.z;
    // const height = 1;
    // this.camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

    // // if(w/h>1) {
    // if(this.width/this.height>1){
    //   this.plane.scale.x = this.camera.aspect;
    //   // this.plane.scale.y = this.camera.aspect;
    // } else{
    //   this.plane.scale.y = 1/this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();


  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        depthInfo: { value: 0 },
        progress: { value: 0.6 },
        cameraNear: { value: this.camera1.near },
        cameraFar: { value: this.camera1.far },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });
    console.log(this.camera,'cam');

    

    
    this.geometry = new THREE.PlaneGeometry(2, 2, 100, 100);

    this.mesh = new THREE.Mesh(this.geometry,this.material);
    // this.scene.add(this.mesh)




    

    for (let i = 0; i <= 100; i++) {
      this.geometry = new THREE.PlaneBufferGeometry(2, 0.005, 300, 1);

      let y = [];
      let len = this.geometry.attributes.position.array.length;
      for (let j = 0; j < len/3; j++) {
        y.push(i/100)
      }
      this.geometry.setAttribute('y', new THREE.BufferAttribute(new Float32Array(y),1))
      

      
      this.plane = new THREE.Mesh(this.geometry, this.material);
      this.plane.position.y = (i - 50)/50
      this.scene.add(this.plane);
    }



    this.loader = new GLTFLoader()
    // =================
    let format = THREE.DepthFormat;
    let type = THREE.UnsignedShortType;

    this.target = new THREE.WebGLRenderTarget( this.width,this.height);
    this.target.texture.format = THREE.RGBFormat;
    this.target.texture.minFilter = THREE.NearestFilter;
    this.target.texture.magFilter = THREE.NearestFilter;
    this.target.texture.generateMipmaps = false;
    this.target.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
    this.target.depthBuffer = true;
    this.target.depthTexture = new THREE.DepthTexture();
    this.target.depthTexture.format = format;
    this.target.depthTexture.type = type;


    this.target1 = new THREE.WebGLRenderTarget( this.width,this.height);
    this.target1.texture.format = THREE.RGBFormat;
    this.target1.texture.minFilter = THREE.NearestFilter;
    this.target1.texture.magFilter = THREE.NearestFilter;
    this.target1.texture.generateMipmaps = false;
    this.target1.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
    this.target1.depthBuffer = true;
    this.target1.depthTexture = new THREE.DepthTexture();
    this.target1.depthTexture.format = format;
    this.target1.depthTexture.type = type;

    this.loader.load(model,(gltf)=>{
      this.model = gltf.scene.children[0];
      this.model.position.set(0, -1, -1.5);
      this.model.rotation.set(0, 0, 0);
      this.model.scale.set(4000,2000,2000);
      console.log(this.model.scale);
      this.scene.add(this.model);
      this.model.traverse(o=>{
        if(o.isMesh){
          console.log(o);
          o.material = new THREE.MeshBasicMaterial({color:0x000000})
        }
      });
    });
    
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    this.time++;
    if (!this.isPlaying) return;

    if(this.model) {
      this.model.position.z = -1.7 + 0.15*Math.sin(this.time/50);
      this.model.rotation.y =   + 0.25*Math.sin(this.time/100);
    }




    this.renderer.setRenderTarget(this.target);
    this.renderer.render(this.scene, this.camera1);

    this.material.uniforms.depthInfo.value = this.target1.depthTexture;
    // this.material.uniforms.progress.value = this.settings.progress;

    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);






    // this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));

    // swap
    let temp = this.target;
    this.target = this.target1;
    this.target1 = temp;

  }
}

new Sketch({
  dom: document.getElementById("container")
});
