// Battery Monitor Widget
(function() {
  'use strict';

  function createBatteryMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget battery-monitor';
    widget.innerHTML = `
      <div class="widget-header">Battery Monitor</div>
      <div class="widget-content">
        <div class="metric-large" id="battery-level">--</div>
        <div class="metric-row">
          <span class="metric-label">Status:</span>
          <span class="metric-value" id="battery-status">--</span>
        </div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot();
      if (!snapshot?.battery) return;

      const levelEl = widget.querySelector('#battery-level');
      const statusEl = widget.querySelector('#battery-status');

      if (snapshot.battery.level?.status === 'supported') {
        levelEl.textContent = `${snapshot.battery.level.value}%`;

        if (snapshot.battery.charging?.status === 'supported') {
          statusEl.textContent = snapshot.battery.charging.value ? 'Charging' : 'Discharging';
        }
      } else {
        levelEl.textContent = 'N/A';
        statusEl.textContent = snapshot.battery.level?.message || 'Not available';
      }
    }

    widget.startRefresh = function() {
      updateMetrics();
      refreshInterval = setInterval(updateMetrics, 5000);
    };

    widget.stopRefresh = function() {
      if (refreshInterval) clearInterval(refreshInterval);
    };

    return widget;
  }

  window.VCPDesktop.builtinWidgets.batteryMonitor = createBatteryMonitorWidget;

})();
