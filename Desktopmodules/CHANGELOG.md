# Changelog - Desktop Metrics Enhancement

All notable changes to the desktop metrics system implemented in the `桌面指标增强` branch.

## [Unreleased]

### Added

#### Core Infrastructure
- Cross-platform desktop metrics collection system (`modules/ipc/desktopMetrics.js`)
  - CPU usage, cores, model, load average
  - Memory total, used, free, usage percentage
  - Disk total, free, usage percentage (Windows)
  - Network interfaces, traffic statistics (sent/received bytes)
  - Battery level and charging status (Windows)
  - Process count and list (Windows)
  - Docker container monitoring (cross-platform)
  - NVIDIA GPU monitoring via nvidia-smi (Windows, Linux)

- IPC handlers (`modules/ipc/desktopHandlers.js`)
  - `desktop-metrics-get-snapshot` - Get current metrics
  - `desktop-metrics-get-capabilities` - Get platform capabilities

- Preload bridge exposure (`preload.js`)
  - `window.electronAPI.desktopMetricsGetSnapshot(options)`
  - `window.electronAPI.desktopMetricsGetCapabilities()`

#### Renderer Components

- Desktop metrics API service (`Desktopmodules/api/desktopMetrics.js`)
  - Wraps IPC calls for renderer access
  - Caches last snapshot
  - Exposes via `window.VCPDesktop.metrics`

- Agent API (`Desktopmodules/api/agentMetricsAPI.js`)
  - Programmatic metrics access for AI agents
  - Helper methods: `getCpuUsage()`, `getMemoryUsage()`, `getDiskUsage()`, `getSystemInfo()`
  - Exposes via `window.VCPDesktop.agentAPI.metrics`

- **9 Monitoring Widgets** (`Desktopmodules/builtinWidgets/`)
  1. System Monitor - Overview of all metrics
  2. CPU Monitor - Detailed CPU metrics with large usage display
  3. Memory Monitor - Memory usage with total/used/free breakdown
  4. Disk Monitor - Disk space usage and availability
  5. Battery Monitor - Battery level and charging status
  6. Network Monitor - Network interfaces and traffic statistics
  7. Docker Monitor - Docker container count and status list
  8. GPU Monitor - NVIDIA GPU utilization, memory, temperature
  9. Process Monitor - Running process count and top processes

- Style Automation Engine (`Desktopmodules/core/styleAutomation.js`)
  - Map metric values to CSS variables
  - Configurable rules (metric path, CSS var, min/max range)
  - Enable/disable automation
  - Normalize values to 0-1 range for CSS
  - Demo: CPU-based background color automation

- Demo Page (`Desktopmodules/desktop.html`)
  - Grid layout showcasing all 9 widgets
  - Style automation demo with enable/disable controls
  - Auto-refresh for all widgets

- Documentation
  - Comprehensive README with usage examples
  - Platform support matrix
  - Architecture diagram

### Technical Details

- **Platform Support**: Windows (full), Linux (partial), macOS (basic)
- **Graceful Degradation**: All metrics include status indicators (supported/unsupported/error)
- **Refresh Intervals**: 2-5 seconds depending on metric type
- **Security**: Read-only IPC, no shell injection vulnerabilities
- **Performance**: Cached snapshots, optional process/Docker collection
