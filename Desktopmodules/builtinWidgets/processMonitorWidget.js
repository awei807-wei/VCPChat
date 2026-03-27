// Process Monitor Widget
(function() {
  'use strict';

  function createProcessMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget process-monitor';
    widget.innerHTML = `
      <div class="widget-header">Process Monitor</div>
      <div class="widget-content">
        <div class="metric-row">
          <span class="metric-label">Total:</span>
          <span class="metric-value" id="proc-count">--</span>
        </div>
        <div id="proc-list"></div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot({ includeProcesses: true });
      if (!snapshot?.processes) return;

      const countEl = widget.querySelector('#proc-count');
      const listEl = widget.querySelector('#proc-list');

      if (snapshot.processes.count?.status === 'supported') {
        countEl.textContent = snapshot.processes.count.value;
      }

      if (snapshot.processes.list?.status === 'supported') {
        const processes = snapshot.processes.list.value;
        listEl.innerHTML = processes.map(proc =>
          `<div class="process-item">${proc}</div>`
        ).join('');
      } else {
        listEl.innerHTML = '<div class="metric-info">Process list unavailable</div>';
      }
    }

    widget.startRefresh = function() {
      updateMetrics();
      refreshInterval = setInterval(updateMetrics, 3000);
    };

    widget.stopRefresh = function() {
      if (refreshInterval) clearInterval(refreshInterval);
    };

    return widget;
  }

  window.VCPDesktop.builtinWidgets.processMonitor = createProcessMonitorWidget;

})();
