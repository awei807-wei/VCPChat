const os = require('os');
const { execSync } = require('child_process');

const platform = os.platform();
let lastCpuInfo = null;

function getMetricValue(status, value, unit, source, message) {
  return { status, value, unit, source, message };
}

function getCpuMetrics() {
  try {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    let usage = 0;
    if (lastCpuInfo) {
      let totalIdle = 0, totalTick = 0;
      cpus.forEach((cpu, i) => {
        const last = lastCpuInfo[i];
        const idle = cpu.times.idle - last.times.idle;
        const total = Object.values(cpu.times).reduce((a, b) => a + b) -
                     Object.values(last.times).reduce((a, b) => a + b);
        totalIdle += idle;
        totalTick += total;
      });
      usage = 100 - (100 * totalIdle / totalTick);
    }
    lastCpuInfo = cpus;

    return {
      usage: getMetricValue('supported', usage.toFixed(1), '%', 'os.cpus'),
      cores: getMetricValue('supported', cpus.length, 'cores', 'os.cpus'),
      model: getMetricValue('supported', cpus[0]?.model || 'Unknown', '', 'os.cpus'),
      loadAvg: getMetricValue('supported', loadAvg, '', 'os.loadavg')
    };
  } catch (err) {
    return {
      usage: getMetricValue('error', null, null, null, err.message)
    };
  }
}

function getMemoryMetrics() {
  try {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = (used / total * 100).toFixed(1);

    return {
      total: getMetricValue('supported', (total / 1024 / 1024 / 1024).toFixed(2), 'GB', 'os.totalmem'),
      used: getMetricValue('supported', (used / 1024 / 1024 / 1024).toFixed(2), 'GB', 'os.freemem'),
      free: getMetricValue('supported', (free / 1024 / 1024 / 1024).toFixed(2), 'GB', 'os.freemem'),
      usage: getMetricValue('supported', usagePercent, '%', 'os.freemem')
    };
  } catch (err) {
    return {
      total: getMetricValue('error', null, null, null, err.message)
    };
  }
}

function getDiskMetrics() {
  try {
    if (platform === 'win32') {
      const output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1);
      const disks = lines.filter(l => l.trim()).map(line => {
        const parts = line.trim().split(/\s+/);
        return { drive: parts[0], free: parseInt(parts[1]), total: parseInt(parts[2]) };
      });
      const total = disks.reduce((sum, d) => sum + (d.total || 0), 0);
      const free = disks.reduce((sum, d) => sum + (d.free || 0), 0);
      return {
        total: getMetricValue('supported', (total / 1024 / 1024 / 1024).toFixed(2), 'GB', 'wmic'),
        free: getMetricValue('supported', (free / 1024 / 1024 / 1024).toFixed(2), 'GB', 'wmic'),
        usage: getMetricValue('supported', ((total - free) / total * 100).toFixed(1), '%', 'wmic')
      };
    }
    return { total: getMetricValue('unsupported', null, null, null, 'Platform not implemented') };
  } catch (err) {
    return { total: getMetricValue('error', null, null, null, err.message) };
  }
}

function getNetworkMetrics() {
  try {
    const interfaces = os.networkInterfaces();
    const active = Object.entries(interfaces).filter(([_, addrs]) =>
      addrs.some(a => !a.internal && a.family === 'IPv4')
    );

    let traffic = { status: 'unsupported' };
    if (platform === 'win32') {
      try {
        const output = execSync('netstat -e', { encoding: 'utf8' });
        const lines = output.split('\n');
        const statsLine = lines.find(l => l.includes('Bytes'));
        if (statsLine) {
          const values = statsLine.split(/\s+/).filter(v => v && !isNaN(v));
          if (values.length >= 2) {
            traffic = getMetricValue('supported', {
              received: parseInt(values[0]),
              sent: parseInt(values[1])
            }, 'bytes', 'netstat');
          }
        }
      } catch (e) {
        traffic = getMetricValue('error', null, null, null, e.message);
      }
    }

    return {
      interfaces: getMetricValue('supported', active.length, 'count', 'os.networkInterfaces'),
      details: getMetricValue('supported', active.map(([name]) => name), '', 'os.networkInterfaces'),
      traffic
    };
  } catch (err) {
    return { interfaces: getMetricValue('error', null, null, null, err.message) };
  }
}

function getBatteryMetrics() {
  try {
    if (platform === 'win32') {
      const output = execSync('wmic path Win32_Battery get BatteryStatus,EstimatedChargeRemaining', { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1);
      if (lines.length > 0 && lines[0].trim()) {
        const parts = lines[0].trim().split(/\s+/);
        return {
          level: getMetricValue('supported', parts[1], '%', 'wmic'),
          charging: getMetricValue('supported', parts[0] === '2', '', 'wmic')
        };
      }
    }
    return { level: getMetricValue('unsupported', null, null, null, 'No battery detected') };
  } catch (err) {
    return { level: getMetricValue('unsupported', null, null, null, 'No battery') };
  }
}

function getProcessMetrics(includeProcesses) {
  if (!includeProcesses) {
    return { count: getMetricValue('supported', 0, 'count', 'skipped') };
  }
  try {
    if (platform === 'win32') {
      const output = execSync('tasklist /FO CSV /NH', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 5 });
      const lines = output.trim().split('\n');
      return {
        count: getMetricValue('supported', lines.length, 'count', 'tasklist'),
        list: getMetricValue('supported', lines.slice(0, 10).map(l => l.split(',')[0].replace(/"/g, '')), '', 'tasklist')
      };
    }
    return { count: getMetricValue('unsupported', null, null, null, 'Platform not implemented') };
  } catch (err) {
    return { count: getMetricValue('error', null, null, null, err.message) };
  }
}

function getDockerMetrics(includeDocker) {
  if (!includeDocker) {
    return { available: getMetricValue('supported', false, '', 'skipped') };
  }
  try {
    const output = execSync('docker ps --format "{{.Names}}\t{{.Status}}"', { encoding: 'utf8', timeout: 3000 });
    const lines = output.trim().split('\n').filter(l => l);
    return {
      available: getMetricValue('supported', true, '', 'docker'),
      count: getMetricValue('supported', lines.length, 'containers', 'docker'),
      containers: getMetricValue('supported', lines.map(l => {
        const [name, status] = l.split('\t');
        return { name, status };
      }), '', 'docker')
    };
  } catch (err) {
    return { available: getMetricValue('unsupported', false, '', null, 'Docker not available') };
  }
}

function getGpuMetrics() {
  try {
    const output = execSync('nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits', { encoding: 'utf8', timeout: 3000 });
    const line = output.trim().split('\n')[0];
    if (line) {
      const [name, util, memUsed, memTotal, temp] = line.split(',').map(s => s.trim());
      return {
        available: getMetricValue('supported', true, '', 'nvidia-smi'),
        name: getMetricValue('supported', name, '', 'nvidia-smi'),
        utilization: getMetricValue('supported', util, '%', 'nvidia-smi'),
        memoryUsed: getMetricValue('supported', memUsed, 'MB', 'nvidia-smi'),
        memoryTotal: getMetricValue('supported', memTotal, 'MB', 'nvidia-smi'),
        temperature: getMetricValue('supported', temp, '°C', 'nvidia-smi')
      };
    }
  } catch (err) {
    return { available: getMetricValue('unsupported', false, '', null, 'NVIDIA GPU not available') };
  }
}

function getCapabilities() {
  return {
    platform,
    metrics: {
      cpu: { status: 'supported' },
      memory: { status: 'supported' },
      disk: { status: platform === 'win32' ? 'supported' : 'unsupported' },
      network: { status: 'supported' },
      battery: { status: platform === 'win32' ? 'supported' : 'unsupported' },
      processes: { status: platform === 'win32' ? 'supported' : 'unsupported' },
      docker: { status: 'supported' },
      gpu: { status: 'supported' },
      sensors: { status: 'unsupported' }
    }
  };
}

function getSnapshot(options = {}) {
  const { includeProcesses = false, includeDocker = false } = options;

  return {
    collectedAt: new Date().toISOString(),
    platform,
    cpu: getCpuMetrics(),
    memory: getMemoryMetrics(),
    disk: getDiskMetrics(),
    network: getNetworkMetrics(),
    battery: getBatteryMetrics(),
    processes: getProcessMetrics(includeProcesses),
    docker: getDockerMetrics(includeDocker),
    gpu: getGpuMetrics(),
    system: {
      hostname: getMetricValue('supported', os.hostname(), '', 'os.hostname'),
      uptime: getMetricValue('supported', (os.uptime() / 3600).toFixed(1), 'hours', 'os.uptime')
    },
    capabilities: getCapabilities()
  };
}

module.exports = { getSnapshot, getCapabilities };
