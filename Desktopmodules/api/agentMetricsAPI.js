// Agent API for Metrics
(function() {
  'use strict';

  const agentMetricsAPI = {
    async getCurrentMetrics(options = {}) {
      return await window.VCPDesktop.metrics.getSnapshot(options);
    },

    async getCapabilities() {
      return await window.VCPDesktop.metrics.getCapabilities();
    },

    async getCpuUsage() {
      const snapshot = await this.getCurrentMetrics();
      return snapshot?.cpu?.usage?.value || null;
    },

    async getMemoryUsage() {
      const snapshot = await this.getCurrentMetrics();
      return snapshot?.memory?.usage?.value || null;
    },

    async getDiskUsage() {
      const snapshot = await this.getCurrentMetrics();
      return snapshot?.disk?.usage?.value || null;
    },

    async getSystemInfo() {
      const snapshot = await this.getCurrentMetrics();
      return {
        hostname: snapshot?.system?.hostname?.value,
        uptime: snapshot?.system?.uptime?.value,
        platform: snapshot?.platform
      };
    }
  };

  if (typeof window.VCPDesktop === 'undefined') {
    window.VCPDesktop = {};
  }
  if (typeof window.VCPDesktop.agentAPI === 'undefined') {
    window.VCPDesktop.agentAPI = {};
  }
  window.VCPDesktop.agentAPI.metrics = agentMetricsAPI;

})();
