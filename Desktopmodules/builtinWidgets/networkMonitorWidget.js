// Network Monitor Widget
(function() {
  'use strict';

  function createNetworkMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget network-monitor';
    widget.innerHTML = `
      <div class="widget-header">Network Monitor</div>
      <div class="widget-content">
        <div class="metric-row">
          <span class="metric-label">Interfaces:</span>
          <span class="metric-value" id="net-interfaces">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Received:</span>
          <span class="metric-value" id="net-received">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Sent:</span>
          <span class="metric-value" id="net-sent">--</span>
        </div>
        <div id="net-details"></div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot();
      if (!snapshot?.network) return;

      const ifacesEl = widget.querySelector('#net-interfaces');
      const receivedEl = widget.querySelector('#net-received');
      const sentEl = widget.querySelector('#net-sent');
      const detailsEl = widget.querySelector('#net-details');

      if (snapshot.network.interfaces?.status === 'supported') {
        ifacesEl.textContent = snapshot.network.interfaces.value;
      }

      if (snapshot.network.traffic?.status === 'supported') {
        const traffic = snapshot.network.traffic.value;
        receivedEl.textContent = `${(traffic.received / 1024 / 1024).toFixed(2)} MB`;
        sentEl.textContent = `${(traffic.sent / 1024 / 1024).toFixed(2)} MB`;
      } else {
        receivedEl.textContent = 'N/A';
        sentEl.textContent = 'N/A';
      }

      if (snapshot.network.details?.status === 'supported') {
        const names = snapshot.network.details.value;
        detailsEl.innerHTML = names.map(n =>
          `<div class="metric-info">${n}</div>`
        ).join('');
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

  window.VCPDesktop.builtinWidgets.networkMonitor = createNetworkMonitorWidget;

})();
