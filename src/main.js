import * as THREE from 'three';

// Vertex Shader
const vertShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Uniform State
const state = {
  mode: 0, // 0: Complex Domain, 1: Fractals, 2: Flow Field, 3: Linear Algebra
  zoom: 4.0,
  offset: new THREE.Vector2(0, 0)
};

// Canvas & WebGL Setup
const canvas = document.querySelector('#viz-canvas') || document.createElement('canvas');
if (!canvas.id) {
  canvas.id = 'viz-canvas';
  document.body.appendChild(canvas);
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Uniforms
const uniforms = {
  u_resolution: { value: new THREE.Vector2() },
  u_offset: { value: state.offset },
  u_zoom: { value: state.zoom },
  u_time: { value: 0 },
  u_mode: { value: state.mode }
};

// Fetch Fragment Shader or Inline
async function init() {
  const fragShaderResponse = await fetch('/src/shaders/visualizer.frag');
  const fragShader = await fragShaderResponse.text();

  const material = new THREE.ShaderMaterial({
    vertexShader: vertShader,
    fragmentShader: fragShader,
    uniforms
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  onResize();
  animate();
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  uniforms.u_resolution.value.set(w, h);
}

window.addEventListener('resize', onResize);

// Interactivity: Pan & Zoom
let isDragging = false;
let prevMouse = { x: 0, y: 0 };

window.addEventListener('pointerdown', (e) => {
  isDragging = true;
  prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevMouse.x;
  const dy = e.clientY - prevMouse.y;

  state.offset.x -= (dx / window.innerHeight) * state.zoom;
  state.offset.y += (dy / window.innerHeight) * state.zoom;

  prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointerup', () => (isDragging = false));

window.addEventListener('wheel', (e) => {
  const factor = e.deltaY > 0 ? 1.08 : 0.92;
  state.zoom = Math.max(0.01, Math.min(100.0, state.zoom * factor));
  uniforms.u_zoom.value = state.zoom;
}, { passive: true });

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}

// Module Switcher Helper
window.setModuleMode = function(modeIndex) {
  state.mode = modeIndex;
  uniforms.u_mode.value = modeIndex;
};

init();
