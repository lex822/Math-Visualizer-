import * as THREE from 'three';
import vertShader from './shaders/domainColoring.vert?raw';
import fragShader from './shaders/domainColoring.frag?raw';

// --- State ---
const state = {
  zoom: 4.0,
  offset: new THREE.Vector2(0, 0),
  showContours: true,
  activeScreen: 'start-screen', // 'start-screen' | 'concept-screen' | 'hud'
};

// --- DOM Setup ---
const canvas = document.querySelector('#viz-canvas');
const startScreen = document.querySelector('#start-screen');
const conceptScreen = document.querySelector('#concept-screen');
const hud = document.querySelector('#hud');

function setScreen(screenName) {
  state.activeScreen = screenName;
  startScreen.classList.toggle('is-active', screenName === 'start-screen');
  conceptScreen.classList.toggle('is-active', screenName === 'concept-screen');
  hud.classList.toggle('is-active', screenName === 'hud');
}

// --- Event Listeners ---
document.querySelector('#start-explore')?.addEventListener('click', () => setScreen('hud'));
document.querySelector('#start-skip')?.addEventListener('click', () => setScreen('concept-screen'));
document.querySelector('#back-to-concepts')?.addEventListener('click', () => setScreen('concept-screen'));

document.querySelectorAll('.concept-card').forEach((card) => {
  card.addEventListener('click', () => setScreen('hud'));
});

// --- Three.js Setup ---
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const scene = new THREE.Scene();

const uniforms = {
  u_resolution: { value: new THREE.Vector2() },
  u_offset: { value: state.offset },
  u_zoom: { value: state.zoom },
  u_time: { value: 0 },
  u_showContours: { value: state.showContours },
};

const material = new THREE.ShaderMaterial({
  vertexShader: vertShader,
  fragmentShader: fragShader,
  uniforms,
});

const geometry = new THREE.PlaneGeometry(2, 2);
scene.add(new THREE.Mesh(geometry, material));

// --- Resize Handling ---
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  uniforms.u_resolution.value.set(w, h);
}
window.addEventListener('resize', onResize);
onResize();

// --- Pan & Zoom Controls ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('pointerdown', (e) => {
  if (state.activeScreen !== 'hud') return;
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  const aspect = window.innerWidth / window.innerHeight;
  state.offset.x -= (deltaX / window.innerHeight) * state.zoom;
  state.offset.y += (deltaY / window.innerHeight) * state.zoom;

  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointerup', () => (isDragging = false));

window.addEventListener('wheel', (e) => {
  if (state.activeScreen !== 'hud') return;
  const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
  state.zoom = Math.max(0.1, Math.min(50.0, state.zoom * zoomFactor));
  uniforms.u_zoom.value = state.zoom;
}, { passive: true });

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  uniforms.u_time.value = clock.getElapsedTime();
  renderer.render(scene, camera);
}

animate();
