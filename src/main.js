import * as THREE from 'three';
import './style.css';

const sceneHost = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f7f8fa');

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(5.8, 3.8, 8.8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
sceneHost.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0xd9e0e4, 2.1));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
keyLight.position.set(5, 9, 7); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048); scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xdceaf0, 1.2);
fillLight.position.set(-7, 4, -4); scene.add(fillLight);

const mats = {
  blue: new THREE.MeshStandardMaterial({ color: '#3d879f', roughness: .42, metalness: .12 }),
  blueLight: new THREE.MeshStandardMaterial({ color: '#69a7b8', roughness: .38, metalness: .08 }),
  blade: new THREE.MeshStandardMaterial({ color: '#20272b', roughness: .34, metalness: .16 }),
  metal: new THREE.MeshStandardMaterial({ color: '#b9c2c7', roughness: .28, metalness: .78 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: '#59656c', roughness: .35, metalness: .72 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#353b3f', roughness: .8 }),
  white: new THREE.MeshStandardMaterial({ color: '#f8fafb', roughness: .32, metalness: .12 }),
  wire: new THREE.MeshStandardMaterial({ color: '#333b40', roughness: .65 })
};

const turbine = new THREE.Group();
scene.add(turbine);
const rotor = new THREE.Group();
turbine.add(rotor);

// Main blue PVC mast and cross supports
function cylinderBetween(parent, a, b, radius, material, radial=24) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
  const direction = new THREE.Vector3().subVectors(end, start);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), radial), material);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction.normalize());
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function box(parent, size, pos, material, radius=0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function cyl(parent, radiusTop, radiusBottom, height, pos, material, radial=32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial), material);
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

// Base tray and vertical stand
box(turbine, [4.5,.16,1.65], [0,.12,0], mats.metal);
box(turbine, [4.15,.055,1.38], [0,.225,0], mats.white);
cyl(turbine, .14, .17, 2.85, [0,1.72,0], mats.blue);
cyl(turbine, .18, .18, .13, [0,.35,0], mats.blueLight);
box(turbine, [.62,.13,.58], [0,.37,0], mats.darkMetal);
cylinderBetween(turbine, [-.02,2.55,0], [-1.05,2.55,0], .105, mats.blue);
cylinderBetween(turbine, [-.98,2.55,0], [-.98,2.08,0], .105, mats.blue);
cylinderBetween(turbine, [-.98,2.08,0], [-.03,2.08,0], .105, mats.blue);

// Rotor support bracket and axle (front faces toward +Z)
cylinderBetween(turbine, [0,3.12,-.08], [0,3.12,.50], .12, mats.blueLight);
cyl(turbine, .23, .23, .22, [0,3.12,.48], mats.darkMetal);
cyl(turbine, .15, .15, .38, [0,3.12,.70], mats.metal);

// Three swept blades, each tapered and slightly pitched
const bladePivot = new THREE.Group();
bladePivot.position.set(0,3.12,.94);
rotor.add(bladePivot);
const hub = new THREE.Mesh(new THREE.SphereGeometry(.24, 32, 24), mats.metal);
hub.castShadow = true; bladePivot.add(hub);
const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.12,32), mats.darkMetal);
hubCap.rotation.x = Math.PI/2; hubCap.position.z = .18; bladePivot.add(hubCap);

function makeBlade(angle) {
  const g = new THREE.Group();
  g.rotation.z = angle;
  const shape = new THREE.Shape();
  shape.moveTo(-.08,.12); shape.quadraticCurveTo(.02,.55,.17,1.28);
  shape.quadraticCurveTo(.21,1.62,.10,1.93);
  shape.quadraticCurveTo(-.10,1.60,-.19,1.24);
  shape.quadraticCurveTo(-.26,.62,-.08,.12);
  const geom = new THREE.ExtrudeGeometry(shape, { depth:.055, bevelEnabled:true, bevelSegments:2, steps:1, bevelSize:.025, bevelThickness:.025 });
  geom.translate(0,0,-.0275);
  const blade = new THREE.Mesh(geom, mats.blade);
  blade.castShadow = true; blade.receiveShadow = true;
  blade.rotation.x = -.10;
  g.add(blade); bladePivot.add(g);
}
for (let i=0;i<3;i++) makeBlade(i*Math.PI*2/3);

// Rear pulley / wheel and belt detail, matching the reference photo
const pulley = new THREE.Mesh(new THREE.TorusGeometry(.72,.045,12,64), mats.metal);
pulley.position.set(0,3.12,-.28); pulley.castShadow = true; turbine.add(pulley);
const pulleySpokes = new THREE.Group(); pulleySpokes.position.copy(pulley.position); turbine.add(pulleySpokes);
for (let i=0;i<4;i++) {
  const spoke = box(pulleySpokes, [.055,1.36,.055], [0,0,0], mats.metal);
  spoke.rotation.z = i*Math.PI/4;
}
const motor = cyl(turbine, .25,.25,.82, [0,1.10,-.16], mats.darkMetal);
motor.rotation.x = Math.PI/2;
cyl(turbine,.29,.29,.09,[0,1.10,.27],mats.metal).rotation.x=Math.PI/2;
cyl(turbine,.18,.18,.08,[0,1.10,-.59],mats.darkMetal).rotation.x=Math.PI/2;
for (let i=0;i<8;i++) {
  const fin = box(turbine,[.035,.58,.055],[0,1.10,-.16],mats.metal);
  fin.rotation.z = i*Math.PI/4;
}
cylinderBetween(turbine,[0,1.10,-.62],[0,.68,-.62],.035,mats.wire);
cylinderBetween(turbine,[.10,1.10,-.62],[.22,.72,-.62],.025,mats.wire);

// Ground shadow plane
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200,200), new THREE.ShadowMaterial({opacity:.12}));
floor.rotation.x=-Math.PI/2; floor.position.y=.025; floor.receiveShadow=true; scene.add(floor);

// Camera presets and slide content
const slides = [
  { eyebrow:'01 — OVERVIEW', title:'A small idea.<br><em>Clean energy.</em>', body:'A miniature wind turbine that uses moving air to turn a DC motor and demonstrate how wind energy can be converted into electricity.', caption:'FULL ASSEMBLY · FRONT THREE-QUARTER', chip:'01 / OVERVIEW', camera:[5.8,3.8,8.8], target:[0,2.05,0], note:'Drag to inspect · Scroll to zoom' },
  { eyebrow:'02 — STRUCTURE', title:'Built around<br><em>a simple frame.</em>', body:'The blue support structure holds the rotor assembly above the base. The stand keeps the model upright while the turbine is being demonstrated.', caption:'SIDE PROFILE · SUPPORT STRUCTURE', chip:'02 / STRUCTURE', camera:[9.5,3.2,.4], target:[0,1.95,0], note:'Side angle · Support and mounting' },
  { eyebrow:'03 — ROTOR', title:'The blades<br><em>catch the wind.</em>', body:'Three lightweight blades are fixed to a central hub. Airflow pushes the blades and makes the rotor spin around its axle.', caption:'ROTOR DETAIL · THREE-BLADE ASSEMBLY', chip:'03 / ROTOR', camera:[2.3,4.0,5.0], target:[0,3.1,.65], note:'Close-up · Blades and hub' },
  { eyebrow:'04 — GENERATOR', title:'Turning motion<br><em>meets electricity.</em>', body:'A small DC motor is used as a generator. When its shaft is driven by the rotating mechanism, it can produce an electrical output.', caption:'REAR DETAIL · DC MOTOR', chip:'04 / GENERATOR', camera:[4.0,1.7,-5.5], target:[0,1.35,-.1], note:'Rear angle · Motor housing' },
  { eyebrow:'05 — CONNECTION', title:'A path for<br><em>the output.</em>', body:'Wires carry the electrical output from the motor to an external load or measuring device. The exact voltage depends on rotation speed and the motor.', caption:'LOWER DETAIL · WIRING AND BASE', chip:'05 / CONNECTION', camera:[4.5,1.0,4.0], target:[0,.9,0], note:'Lower angle · Base and wiring' },
  { eyebrow:'06 — COMPLETE VIEW', title:'One model.<br><em>Many angles.</em>', body:'Explore the complete miniature turbine from all sides. The model combines the rotor, support frame, DC motor, wiring and base into one demonstration.', caption:'COMPLETE ASSEMBLY · REAR THREE-QUARTER', chip:'06 / COMPLETE VIEW', camera:[-6.0,4.0,-7.5], target:[0,2.0,0], note:'Drag to orbit · Scroll to zoom' }
];

let current = 0;
let spinning = true;
let dragging = false;
let pointer = {x:0,y:0};
let orbitOffset = {theta:0, phi:0};
let desiredCamera = new THREE.Vector3(...slides[0].camera);
let desiredTarget = new THREE.Vector3(...slides[0].target);
let currentTarget = desiredTarget.clone();

const $ = (s) => document.querySelector(s);
const dots = $('#dots');
slides.forEach((s,i)=>{
  const b=document.createElement('button'); b.className='dot'+(i===0?' active':'');
  b.setAttribute('aria-label',`Go to slide ${i+1}`); b.addEventListener('click',()=>go(i)); dots.appendChild(b);
});
function go(index) {
  current=(index+slides.length)%slides.length;
  const s=slides[current];
  $('#eyebrow').textContent=s.eyebrow;
  $('#slide-title').innerHTML=s.title;
  $('#slide-body').textContent=s.body;
  $('#model-caption').textContent=s.caption;
  $('#view-chip').textContent=s.chip;
  $('#model-note').textContent=s.note;
  $('#slide-count').textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  $('#slide-progress').style.width=`${(current+1)/slides.length*100}%`;
  [...dots.children].forEach((d,i)=>d.classList.toggle('active',i===current));
  orbitOffset={theta:0,phi:0};
  desiredCamera.set(...s.camera); desiredTarget.set(...s.target);
}
$('#next-button').addEventListener('click',()=>go(current+1));
$('#prev-button').addEventListener('click',()=>go(current-1));
$('#reset-button').addEventListener('click',()=>{orbitOffset={theta:0,phi:0};desiredCamera.set(...slides[current].camera);desiredTarget.set(...slides[current].target);});
$('#spin-button').addEventListener('click',()=>{
  spinning=!spinning; $('#spin-button').classList.toggle('selected',!spinning);
  $('#spin-button').firstChild.textContent=spinning?'Ⅱ ':'▶ ';
});
window.addEventListener('keydown',(e)=>{
  if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();go(current+1);}
  if(e.key==='ArrowLeft'){e.preventDefault();go(current-1);}
  if(e.key.toLowerCase()==='r') $('#reset-button').click();
});
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;pointer={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!dragging)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y; pointer={x:e.clientX,y:e.clientY};
  orbitOffset.theta-=dx*.006; orbitOffset.phi=Math.max(-.65,Math.min(.65,orbitOffset.phi+dy*.004));
});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();const v=desiredCamera.clone().sub(desiredTarget);v.multiplyScalar(e.deltaY>0?1.06:.94);desiredCamera.copy(desiredTarget).add(v);},{passive:false});

function resize() {
  const w=sceneHost.clientWidth,h=sceneHost.clientHeight;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(sceneHost); resize();
const clock=new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.04);
  if(spinning) bladePivot.rotation.z += dt*.48;
  const base=desiredCamera.clone().sub(desiredTarget);
  const spherical=new THREE.Spherical().setFromVector3(base);
  spherical.theta += orbitOffset.theta; spherical.phi=Math.max(.18,Math.min(Math.PI-.18,spherical.phi+orbitOffset.phi));
  const adjusted=new THREE.Vector3().setFromSpherical(spherical).add(desiredTarget);
  camera.position.lerp(adjusted,.055); currentTarget.lerp(desiredTarget,.055);
  camera.lookAt(currentTarget);
  renderer.render(scene,camera);
}
animate();
go(0);
