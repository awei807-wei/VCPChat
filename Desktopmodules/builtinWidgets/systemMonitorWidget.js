// System Monitor Widget
(function() {
  'use strict';

  function createSystemMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget system-monitor';
    widget.innerHTML = `
      <div class="widget-header">System Monitor</div>
      <div class="widget-content">
        <div class="metric-row">
          <span class="metric-label">CPU:</span>
          <span class="metric-value" id="cpu-value">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Memory:</span>
          <span class="metric-value" id="memory-value">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Disk:</span>
          <span class="metric-value" id="disk-value">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Network:</span>
          <span class="metric-value" id="network-value">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Battery:</span>
          <span class="metric-value" id="battery-value">--</span>
        </div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot({ includeProcesses: false });
      if (!snapshot) return;

      const cpuEl = widget.querySelector('#cpu-value');
      const memEl = widget.querySelector('#memory-value');
      const diskEl = widget.querySelector('#disk-value');
      const netEl = widget.querySelector('#network-value');
      const batEl = widget.querySelector('#battery-value');

      if (snapshot.cpu?.usage?.status === 'supported') {
        cpuEl.textContent = `${snapshot.cpu.usage.value}%`;
      } else {
        cpuEl.textContent = 'N/A';
      }

      if (snapshot.memory?.usage?.status === 'supported') {
        memEl.textContent = `${snapshot.memory.usage.value}%`;
      } else {
        memEl.textContent = 'N/A';
      }

      if (snapshot.disk?.usage?.status === 'supported') {
        diskEl.textContent = `${snapshot.disk.usage.value}%`;
      } else {
        diskEl.textContent = snapshot.disk?.total?.message || 'N/A';
      }

      if (snapshot.network?.interfaces?.status === 'supported') {
        netEl.textContent = `${snapshot.network.interfaces.value} active`;
      } else {
        netEl.textContent = 'N/A';
      }

      if (snapshot.battery?.level?.status === 'supported') {
        batEl.textContent = `${snapshot.battery.level.value}%`;
      } else {
        batEl.textContent = snapshot.battery?.level?.message || 'N/A';
      }
    }

    widget.startRefresh = function() {
      updateMetrics();
      refreshInterval = setInterval(updateMetrics, 2000);
    };

    widget.stopRefresh = function() {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    };

    return widget;
  }

  if (typeof window.VCPDesktop === 'undefined') {
    window.VCPDesktop = {};
  }
  if (typeof window.VCPDesktop.builtinWidgets === 'undefined') {
    window.VCPDesktop.builtinWidgets = {};
  }
  window.VCPDesktop.builtinWidgets.systemMonitor = createSystemMonitorWidget;

})();
