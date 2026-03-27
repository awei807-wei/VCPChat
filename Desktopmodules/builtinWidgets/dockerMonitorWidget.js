// Docker Monitor Widget
(function() {
  'use strict';

  function createDockerMonitorWidget() {
    const widget = document.createElement('div');
    widget.className = 'desktop-widget docker-monitor';
    widget.innerHTML = `
      <div class="widget-header">Docker Monitor</div>
      <div class="widget-content">
        <div class="metric-row">
          <span class="metric-label">Status:</span>
          <span class="metric-value" id="docker-status">--</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Containers:</span>
          <span class="metric-value" id="docker-count">--</span>
        </div>
        <div id="docker-list"></div>
      </div>
    `;

    let refreshInterval;

    async function updateMetrics() {
      const snapshot = await window.VCPDesktop.metrics.getSnapshot({ includeDocker: true });
      if (!snapshot?.docker) return;

      const statusEl = widget.querySelector('#docker-status');
      const countEl = widget.querySelector('#docker-count');
      const listEl = widget.querySelector('#docker-list');

      if (snapshot.docker.available?.status === 'supported' && snapshot.docker.available.value) {
        statusEl.textContent = 'Available';
        statusEl.style.color = '#4CAF50';

        if (snapshot.docker.count?.status === 'supported') {
          countEl.textContent = snapshot.docker.count.value;
        }

        if (snapshot.docker.containers?.status === 'supported') {
          const containers = snapshot.docker.containers.value;
          listEl.innerHTML = containers.map(c =>
            `<div class="process-item">${c.name}: ${c.status}</div>`
          ).join('');
        }
      } else {
        statusEl.textContent = 'Not Available';
        statusEl.style.color = '#f44336';
        countEl.textContent = '0';
        listEl.innerHTML = '<div class="metric-info">Docker not running</div>';
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

  window.VCPDesktop.builtinWidgets.dockerMonitor = createDockerMonitorWidget;

})();
