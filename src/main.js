import * as THREE from 'three';
import './style.css';
import { HUD } from './ui/HUD.js';
import fragShader from './shaders/visualizer.frag?raw';

const vertShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const state = {
  mode: 0,
  zoom: 4.0,
  offset: new THREE.Vector2(0, 0)
};

const appContainer = document.querySelector('#app') || document.body;

// 1. Mount HUD UI
const hud = new HUD(appContainer, {
  onModeChange: (modeIndex) => {
    state.mode = modeIndex;
    uniforms.u_mode.value = modeIndex;
  },
  onExpressionChange: (expr) => {
    console.log('Formula submitted:', expr);
  },
  onParamChange: (param, val) => {
    console.log(param, val);
  }
});

// 2. WebGL Canvas Setup
const canvas = document.createElement('canvas');
canvas.id = 'viz-canvas';
appContainer.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_offset: { value: state.offset },
  u_zoom: { value: state.zoom },
  u_time: { value: 0 },
  u_mode: { value: state.mode }
};

const material = new THREE.ShaderMaterial({
  vertexShader: vertShader,
  fragmentShader: fragShader,
  uniforms
});

scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

// 3. Pan & Zoom
let isDragging = false;
let prevMouse = { x: 0, y: 0 };

window.addEventListener('pointerdown', (e) => {
  // Ignore clicks on the HUD panels so dragging works nicely
  if (e.target.closest('#hud-overlay')) return;
  isDragging = true;
  prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointermove', (e) => {
  if (isDragging) {
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    state.offset.x -= (dx / window.innerHeight) * state.zoom;
    state.offset.y += (dy / window.innerHeight) * state.zoom;
    prevMouse = { x: e.clientX, y: e.clientY };
  }

  // Update cursor readout in UI inspector
  const aspect = window.innerWidth / window.innerHeight;
  const zReal = ((e.clientX / window.innerWidth) * 2 - 1) * state.zoom * aspect + state.offset.x;
  const zImag = -((e.clientY / window.innerHeight) * 2 - 1) * state.zoom + state.offset.y;
  hud.updateReadouts(zReal, zImag, Math.pow(zReal, 2) - Math.pow(zImag, 2), 2 * zReal * zImag);
});

window.addEventListener('pointerup', () => (isDragging = false));

window.addEventListener('wheel', (e) => {
  const factor = e.deltaY > 0 ? 1.08 : 0.92;
  state.zoom = Math.max(0.01, Math.min(100.0, state.zoom * factor));
  uniforms.u_zoom.value = state.zoom;
}, { passive: true });

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

// 4. Render Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}
animate();
