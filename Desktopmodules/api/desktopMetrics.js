// Desktop Metrics API Service
(function() {
  'use strict';

  const metricsService = {
    lastSnapshot: null,
    capabilities: null,

    async getCapabilities() {
      if (!this.capabilities) {
        this.capabilities = await window.electronAPI.desktopMetricsGetCapabilities();
      }
      return this.capabilities;
    },

    async getSnapshot(options = {}) {
      try {
        this.lastSnapshot = await window.electronAPI.desktopMetricsGetSnapshot(options);
        return this.lastSnapshot;
      } catch (error) {
        console.error('[DesktopMetrics] Error getting snapshot:', error);
        return null;
      }
    },

    getLastSnapshot() {
      return this.lastSnapshot;
    }
  };

  if (typeof window.VCPDesktop === 'undefined') {
    window.VCPDesktop = {};
  }
  window.VCPDesktop.metrics = metricsService;

})();
