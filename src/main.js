import './style.css';
import { HUD } from './ui/HUD.js';

// Initialize Canvas Container
const appContainer = document.querySelector('#app') || document.body;

// Instantiate Glassmorphism HUD Overlay
const hud = new HUD(appContainer, {
  onModeChange: (modeIndex) => {
    window.setModuleMode?.(modeIndex);
  },
  onExpressionChange: (expressionStr) => {
    console.log('Evaluating custom formula:', expressionStr);
    // AST Parser hook goes here
  },
  onParamChange: (paramKey, value) => {
    if (paramKey === 'speed') uniforms.u_timeSpeed.value = value;
    if (paramKey === 'detail') uniforms.u_iterations.value = value;
  }
});

// Update cursor readouts inside your animation loop or pointermove event
window.addEventListener('pointermove', (e) => {
  const aspect = window.innerWidth / window.innerHeight;
  const zReal = ((e.clientX / window.innerWidth) * 2 - 1) * state.zoom * aspect + state.offset.x;
  const zImag = -((e.clientY / window.innerHeight) * 2 - 1) * state.zoom + state.offset.y;

  // Example placeholder update
  hud.updateReadouts(zReal, zImag, Math.pow(zReal, 2) - Math.pow(zImag, 2), 2 * zReal * zImag);
});
