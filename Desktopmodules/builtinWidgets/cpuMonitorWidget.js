// CPU Monitor Widget
(function() {
  'use strict';

  function createCpuMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget cpu-monitor';
    widget.innerHTML = `
      <div class="widget-header">CPU Monitor</div>
      <div class="widget-content">
        <div class="metric-large" id="cpu-usage">--</div>
        <div class="metric-row">
          <span class="metric-label">Cores:</span>
          <span class="metric-value" id="cpu-cores">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Model:</span>
          <span class="metric-value" id="cpu-model">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Load Avg:</span>
          <span class="metric-value" id="cpu-load">--</span>
        </div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot();
      if (!snapshot?.cpu) return;

      const usageEl = widget.querySelector('#cpu-usage');
      const coresEl = widget.querySelector('#cpu-cores');
      const modelEl = widget.querySelector('#cpu-model');
      const loadEl = widget.querySelector('#cpu-load');

      if (snapshot.cpu.usage?.status === 'supported') {
        usageEl.textContent = `${snapshot.cpu.usage.value}%`;
      }

      if (snapshot.cpu.cores?.status === 'supported') {
        coresEl.textContent = snapshot.cpu.cores.value;
      }

      if (snapshot.cpu.model?.status === 'supported') {
        modelEl.textContent = snapshot.cpu.model.value;
      }

      if (snapshot.cpu.loadAvg?.status === 'supported') {
        const loads = snapshot.cpu.loadAvg.value;
        loadEl.textContent = loads.map(l => l.toFixed(2)).join(', ');
      }
    }

    widget.startRefresh = function() {
      updateMetrics();
      refreshInterval = setInterval(updateMetrics, 2000);
    };

    widget.stopRefresh = function() {
      if (refreshInterval) clearInterval(refreshInterval);
    };

    return widget;
  }

  window.VCPDesktop.builtinWidgets.cpuMonitor = createCpuMonitorWidget;

})();
