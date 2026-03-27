// GPU Monitor Widget
(function() {
  'use strict';

  function createGpuMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget gpu-monitor';
    widget.innerHTML = `
      <div class="widget-header">GPU Monitor</div>
      <div class="widget-content">
        <div class="metric-row">
          <span class="metric-label">Status:</span>
          <span class="metric-value" id="gpu-status">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Name:</span>
          <span class="metric-value" id="gpu-name">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Utilization:</span>
          <span class="metric-value" id="gpu-util">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Memory:</span>
          <span class="metric-value" id="gpu-mem">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Temperature:</span>
          <span class="metric-value" id="gpu-temp">--</span>
        </div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot();
      if (!snapshot?.gpu) return;

      const statusEl = widget.querySelector('#gpu-status');
      const nameEl = widget.querySelector('#gpu-name');
      const utilEl = widget.querySelector('#gpu-util');
      const memEl = widget.querySelector('#gpu-mem');
      const tempEl = widget.querySelector('#gpu-temp');

      if (snapshot.gpu.available?.status === 'supported' && snapshot.gpu.available.value) {
        statusEl.textContent = 'Available';
        statusEl.style.color = '#4CAF50';

        if (snapshot.gpu.name?.status === 'supported') {
          nameEl.textContent = snapshot.gpu.name.value;
        }

        if (snapshot.gpu.utilization?.status === 'supported') {
          utilEl.textContent = `${snapshot.gpu.utilization.value}%`;
        }

        if (snapshot.gpu.memoryUsed?.status === 'supported' && snapshot.gpu.memoryTotal?.status === 'supported') {
          memEl.textContent = `${snapshot.gpu.memoryUsed.value} / ${snapshot.gpu.memoryTotal.value} MB`;
        }

        if (snapshot.gpu.temperature?.status === 'supported') {
          tempEl.textContent = `${snapshot.gpu.temperature.value}°C`;
        }
      } else {
        statusEl.textContent = 'Not Available';
        statusEl.style.color = '#f44336';
        nameEl.textContent = 'N/A';
        utilEl.textContent = 'N/A';
        memEl.textContent = 'N/A';
        tempEl.textContent = 'N/A';
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

  window.VCPDesktop.builtinWidgets.gpuMonitor = createGpuMonitorWidget;

})();
