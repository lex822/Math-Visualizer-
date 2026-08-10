export class HUD {
  constructor(container, options = {}) {
    this.container = container;
    this.onModeChange = options.onModeChange || (() => {});
    this.onExpressionChange = options.onExpressionChange || (() => {});
    this.onParamChange = options.onParamChange || (() => {});

    this.activeMode = 0;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div id="hud-overlay">
        <!-- Top Bar -->
        <header id="top-bar" class="glass-panel hud-interactive">
          <div class="brand">
            <div class="brand-dot"></div>
            <span>Math Visualizer</span>
          </div>
          <nav class="mode-selector">
            <button class="mode-btn active" data-mode="0">Complex Domain</button>
            <button class="mode-btn" data-mode="1">Fractals</button>
            <button class="mode-btn" data-mode="2">Flow Fields</button>
            <button class="mode-btn" data-mode="3">Linear Algebra</button>
          </nav>
        </header>

        <!-- Left Controls -->
        <aside id="control-panel" class="glass-panel hud-interactive">
          <span class="panel-title">Function Input</span>
          
          <div class="field-group">
            <div class="field-label">
              <span>Formula f(z)</span>
            </div>
            <div class="expression-input-wrapper">
              <input type="text" id="expr-input" class="expression-input" value="z^3 - 1" spellcheck="false" />
            </div>
          </div>

          <span class="panel-title">Parameters</span>

          <div class="field-group">
            <div class="field-label">
              <span>Time Speed (t)</span>
              <span id="speed-val" class="field-value">1.0</span>
            </div>
            <input type="range" id="speed-slider" min="0" max="3" step="0.1" value="1.0" />
          </div>

          <div class="field-group">
            <div class="field-label">
              <span>Iterations / Detail</span>
              <span id="detail-val" class="field-value">64</span>
            </div>
            <input type="range" id="detail-slider" min="16" max="256" step="16" value="64" />
          </div>
        </aside>

        <!-- Right Inspector -->
        <aside id="inspector-panel" class="glass-panel hud-interactive">
          <span class="panel-title">Realtime Inspector</span>
          
          <div class="readout-card">
            <div class="readout-label">Cursor Position (z)</div>
            <div id="readout-z" class="readout-value">0.00 + 0.00i</div>
          </div>

          <div class="readout-card">
            <div class="readout-label">Value f(z)</div>
            <div id="readout-fz" class="readout-value">0.00 + 0.00i</div>
          </div>
        </aside>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Mode Switching
    const modeBtns = this.container.querySelectorAll('.mode-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeMode = parseInt(btn.dataset.mode, 10);
        this.onModeChange(this.activeMode);
      });
    });

    // Expression Input
    const exprInput = this.container.querySelector('#expr-input');
    exprInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.onExpressionChange(exprInput.value);
      }
    });

    // Slider Controls
    const speedSlider = this.container.querySelector('#speed-slider');
    const speedVal = this.container.querySelector('#speed-val');
    speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      speedVal.textContent = val.toFixed(1);
      this.onParamChange('speed', val);
    });

    const detailSlider = this.container.querySelector('#detail-slider');
    const detailVal = this.container.querySelector('#detail-val');
    detailSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      detailVal.textContent = val;
      this.onParamChange('detail', val);
    });
  }

  updateReadouts(zReal, zImag, fzReal, fzImag) {
    const readoutZ = this.container.querySelector('#readout-z');
    const readoutFz = this.container.querySelector('#readout-fz');

    if (readoutZ) {
      readoutZ.textContent = `${zReal.toFixed(2)} ${zImag >= 0 ? '+' : '-'} ${Math.abs(zImag).toFixed(2)}i`;
    }
    if (readoutFz) {
      readoutFz.textContent = `${fzReal.toFixed(2)} ${fzImag >= 0 ? '+' : '-'} ${Math.abs(fzImag).toFixed(2)}i`;
    }
  }
}
