// Disk Monitor Widget
(function() {
  'use strict';

  function createDiskMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget disk-monitor';
    widget.innerHTML = `
      <div class="widget-header">Disk Monitor</div>
      <div class="widget-content">
        <div class="metric-large" id="disk-usage">--</div>
        <div class="metric-row">
          <span class="metric-label">Total:</span>
          <span class="metric-value" id="disk-total">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Free:</span>
          <span class="metric-value" id="disk-free">--</span>
        </div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot();
      if (!snapshot?.disk) return;

      const usageEl = widget.querySelector('#disk-usage');
      const totalEl = widget.querySelector('#disk-total');
      const freeEl = widget.querySelector('#disk-free');

      if (snapshot.disk.usage?.status === 'supported') {
        usageEl.textContent = `${snapshot.disk.usage.value}%`;
      } else {
        usageEl.textContent = 'N/A';
      }

      if (snapshot.disk.total?.status === 'supported') {
        totalEl.textContent = `${snapshot.disk.total.value} GB`;
      } else {
        totalEl.textContent = 'N/A';
      }

      if (snapshot.disk.free?.status === 'supported') {
        freeEl.textContent = `${snapshot.disk.free.value} GB`;
      } else {
        freeEl.textContent = 'N/A';
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

  window.VCPDesktop.builtinWidgets.diskMonitor = createDiskMonitorWidget;

})();
