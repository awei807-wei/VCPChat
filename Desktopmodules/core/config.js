// Desktop Metrics Configuration
(function() {
  'use strict';

  const defaultConfig = {
    widgets: {
      system: { enabled: true, refreshInterval: 2000 },
      cpu: { enabled: true, refreshInterval: 2000 },
      memory: { enabled: true, refreshInterval: 2000 },
      disk: { enabled: true, refreshInterval: 3000 },
      battery: { enabled: true, refreshInterval: 5000 },
      network: { enabled: true, refreshInterval: 2000 },
      docker: { enabled: true, refreshInterval: 5000 },
      gpu: { enabled: true, refreshInterval: 2000 },
      process: { enabled: true, refreshInterval: 3000 }
    },
    metrics: {
      includeProcesses: false,
      includeDocker: false
    }
  };

  const config = {
    current: { ...defaultConfig },

    load() {
      const saved = localStorage.getItem('vcp-desktop-metrics-config');
      if (saved) {
        this.current = { ...defaultConfig, ...JSON.parse(saved) };
      }
      return this.current;
    },

    save() {
      localStorage.setItem('vcp-desktop-metrics-config', JSON.stringify(this.current));
    },

    reset() {
      this.current = { ...defaultConfig };
      this.save();
    },

    setWidgetEnabled(widgetName, enabled) {
      if (this.current.widgets[widgetName]) {
        this.current.widgets[widgetName].enabled = enabled;
        this.save();
      }
    },

    setRefreshInterval(widgetName, interval) {
      if (this.current.widgets[widgetName]) {
        this.current.widgets[widgetName].refreshInterval = interval;
        this.save();
      }
    }
  };

  if (typeof window.VCPDesktop === 'undefined') {
    window.VCPDesktop = {};
  }
  window.VCPDesktop.config = config;

})();
