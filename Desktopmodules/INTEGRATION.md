# Desktop Metrics Integration Guide

Quick guide for integrating the desktop metrics system into VCPChat.

## Prerequisites

The following files have already been added/modified:
- ✓ `modules/ipc/desktopMetrics.js` - Metrics collection
- ✓ `modules/ipc/desktopHandlers.js` - IPC handlers
- ✓ `main.js` - Handler registration
- ✓ `preload.js` - IPC exposure

## Integration Steps

### 1. Load Desktop Metrics in Your Window

Add to your HTML file:

```html
<script src="Desktopmodules/api/desktopMetrics.js"></script>
<script src="Desktopmodules/api/agentMetricsAPI.js"></script>
```

### 2. Use Metrics in Your Application

```javascript
// Get current metrics
const snapshot = await window.VCPDesktop.metrics.getSnapshot();
console.log('CPU:', snapshot.cpu.usage.value + '%');

// For AI agents
const cpuUsage = await window.VCPDesktop.agentAPI.metrics.getCpuUsage();
```

### 3. Add Monitoring Widgets

```html
<!-- Load widget scripts -->
<script src="Desktopmodules/builtinWidgets/cpuMonitorWidget.js"></script>

<!-- Create and display widget -->
<script>
const widget = window.VCPDesktop.builtinWidgets.cpuMonitor();
document.body.appendChild(widget);
widget.startRefresh();
</script>
```

### 4. Enable Style Automation (Optional)

```html
<script src="Desktopmodules/core/styleAutomation.js"></script>
<script>
const automation = window.VCPDesktop.styleAutomation;
automation.addRule('cpu.usage', '--cpu-level', 0, 100);
automation.enable();
</script>
```

## Testing

1. Start the Electron app
2. Open DevTools (F12)
3. Test metrics collection:
   ```javascript
   await window.electronAPI.desktopMetricsGetSnapshot()
   ```
4. Open `Desktopmodules/desktop.html` to see the full demo

## Available Widgets

All widgets follow the same pattern:
```javascript
const widget = window.VCPDesktop.builtinWidgets.{widgetName}();
widget.startRefresh();  // Start auto-refresh
widget.stopRefresh();   // Stop auto-refresh
```

Widget names: `systemMonitor`, `cpuMonitor`, `memoryMonitor`, `diskMonitor`, `batteryMonitor`, `networkMonitor`, `dockerMonitor`, `gpuMonitor`, `processMonitor`
