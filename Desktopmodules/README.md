# Desktop Metrics System

Cross-platform desktop metrics collection and monitoring system for VCPChat.

## Features

### Core Infrastructure
- **IPC Metrics Collection** (`modules/ipc/desktopMetrics.js`)
  - CPU, memory, disk, network, battery, processes, Docker, GPU
  - Unified snapshot API with capability detection
  - Platform-specific implementations (Windows, Linux, macOS)

- **Preload Bridge** (`preload.js`)
  - Secure renderer access via `window.electronAPI`
  - `desktopMetricsGetSnapshot(options)`
  - `desktopMetricsGetCapabilities()`

### Monitoring Widgets (9 total)

1. **System Monitor** - Overview of all metrics
2. **CPU Monitor** - Usage %, cores, model, load average
3. **Memory Monitor** - Total, used, free, usage %
4. **Disk Monitor** - Total, free, usage %
5. **Battery Monitor** - Level, charging status
6. **Network Monitor** - Interfaces, traffic (sent/received)
7. **Docker Monitor** - Container count and status
8. **GPU Monitor** - NVIDIA GPU utilization, memory, temperature
9. **Process Monitor** - Running process list

### Advanced Features

- **Agent API** (`api/agentMetricsAPI.js`)
  - Programmatic metrics access for AI agents
  - `window.VCPDesktop.agentAPI.metrics`

- **Style Automation** (`core/styleAutomation.js`)
  - Map metric values to CSS variables
  - Dynamic desktop appearance based on system state
  - Enable/disable with configurable rules

## Usage

### Basic Metrics Collection

```javascript
// Get current metrics snapshot
const snapshot = await window.electronAPI.desktopMetricsGetSnapshot({
  includeProcesses: true,
  includeDocker: true
});

console.log(snapshot.cpu.usage.value); // CPU usage %
console.log(snapshot.memory.usage.value); // Memory usage %
```

### Creating Widgets

```javascript
// Create and start a CPU monitor widget
const cpuWidget = window.VCPDesktop.builtinWidgets.cpuMonitor();
document.body.appendChild(cpuWidget);
cpuWidget.startRefresh();

// Stop refresh when done
cpuWidget.stopRefresh();
```

### Agent API

```javascript
// Get current CPU usage for AI agent
const cpuUsage = await window.VCPDesktop.agentAPI.metrics.getCpuUsage();

// Get full system info
const sysInfo = await window.VCPDesktop.agentAPI.metrics.getSystemInfo();
```

### Style Automation

```javascript
// Map CPU usage (0-100) to CSS variable (0-1)
const automation = window.VCPDesktop.styleAutomation;
automation.addRule('cpu.usage', '--cpu-intensity', 0, 100);
automation.enable();

// Use in CSS: background: hsl(calc(120 - var(--cpu-intensity) * 120), 70%, 50%);
```

## Platform Support

| Metric | Windows | Linux | macOS |
|--------|---------|-------|-------|
| CPU | ✓ | ✓ | ✓ |
| Memory | ✓ | ✓ | ✓ |
| Disk | ✓ | - | - |
| Network | ✓ | ✓ | ✓ |
| Battery | ✓ | - | - |
| Processes | ✓ | - | - |
| Docker | ✓ | ✓ | ✓ |
| GPU (NVIDIA) | ✓ | ✓ | - |

## Architecture

```
Main Process (modules/ipc/)
  └─ desktopMetrics.js ─── Collects metrics via OS APIs
  └─ desktopHandlers.js ── Registers IPC handlers

Preload (preload.js)
  └─ Exposes IPC to renderer via contextBridge

Renderer (Desktopmodules/)
  ├─ api/
  │  ├─ desktopMetrics.js ─── Metrics service
  │  └─ agentMetricsAPI.js ── Agent API
  ├─ builtinWidgets/
  │  └─ *MonitorWidget.js ── 9 monitoring widgets
  └─ core/
     └─ styleAutomation.js ── Style automation engine
```
