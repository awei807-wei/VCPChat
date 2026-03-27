// Memory Monitor Widget
(function() {
  'use strict';

  function createMemoryMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget memory-monitor';
    widget.innerHTML = `
      <div class="widget-header">Memory Monitor</div>
      <div class="widget-content">
        <div class="metric-large" id="mem-usage">--</div>
        <div class="metric-row">
          <span class="metric-label">Total:</span>
          <span class="metric-value" id="mem-total">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Used:</span>
          <span class="metric-value" id="mem-used">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Free:</span>
          <span class="metric-value" id="mem-free">--</span>
        </div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot();
      if (!snapshot?.memory) return;

      const usageEl = widget.querySelector('#mem-usage');
      const totalEl = widget.querySelector('#mem-total');
      const usedEl = widget.querySelector('#mem-used');
      const freeEl = widget.querySelector('#mem-free');

      if (snapshot.memory.usage?.status === 'supported') {
        usageEl.textContent = `${snapshot.memory.usage.value}%`;
      }

      if (snapshot.memory.total?.status === 'supported') {
        totalEl.textContent = `${snapshot.memory.total.value} GB`;
      }

      if (snapshot.memory.used?.status === 'supported') {
        usedEl.textContent = `${snapshot.memory.used.value} GB`;
      }

      if (snapshot.memory.free?.status === 'supported') {
        freeEl.textContent = `${snapshot.memory.free.value} GB`;
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

  window.VCPDesktop.builtinWidgets.memoryMonitor = createMemoryMonitorWidget;

})();
