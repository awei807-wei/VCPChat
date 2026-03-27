// Style Automation Engine
(function() {
  'use strict';

  const styleAutomation = {
    enabled: false,
    rules: [],

    enable() {
      this.enabled = true;
      this.startMonitoring();
    },

    disable() {
      this.enabled = false;
      this.stopMonitoring();
      this.resetStyles();
    },

    addRule(metricPath, cssVariable, min, max) {
      this.rules.push({ metricPath, cssVariable, min, max });
    },

    clearRules() {
      this.rules = [];
    },

    async applyAutomation() {
      if (!this.enabled) return;

      const snapshot = await window.VCPDesktop.metrics.getSnapshot();
      if (!snapshot) return;

      this.rules.forEach(rule => {
        const value = this.getMetricValue(snapshot, rule.metricPath);
        if (value !== null) {
          const normalized = this.normalize(value, rule.min, rule.max);
          document.documentElement.style.setProperty(rule.cssVariable, normalized);
        }
      });
    },

    getMetricValue(snapshot, path) {
      const parts = path.split('.');
      let value = snapshot;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) return null;
      }
      return value?.value ?? value;
    },

    normalize(value, min, max) {
      return Math.max(0, Math.min(1, (value - min) / (max - min)));
    },

    startMonitoring() {
      this.interval = setInterval(() => this.applyAutomation(), 2000);
    },

    stopMonitoring() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    resetStyles() {
      this.rules.forEach(rule => {
        document.documentElement.style.removeProperty(rule.cssVariable);
      });
    }
  };

  if (typeof window.VCPDesktop === 'undefined') {
    window.VCPDesktop = {};
  }
  window.VCPDesktop.styleAutomation = styleAutomation;

})();
