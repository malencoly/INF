const form = document.getElementById('submissionForm');
const statusBox = document.getElementById('status');

async function collectMetadata() {

  // Geolocation with browser permission
  const geolocation = await new Promise((resolve) => {

    if (!navigator.geolocation) {
      return resolve({
        enabled: false,
        error: 'Unsupported'
      });
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          enabled: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        resolve({
          enabled: false,
          error: error.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });

  // Battery API
  let battery = {};

  if (navigator.getBattery) {
    try {
      const batteryInfo = await navigator.getBattery();

      battery = {
        charging: batteryInfo.charging,
        level: batteryInfo.level
      };
    } catch {}
  }

  // Connection information
  const connection = navigator.connection || {};

  // Permission states
  const permissions = {};

  if (navigator.permissions) {
    try {
      permissions.geolocation = (
        await navigator.permissions.query({
          name: 'geolocation'
        })
      ).state;
    } catch {}
  }

  // Canvas support
  let canvasSupport = false;

  try {
    const canvas = document.createElement('canvas');
    canvasSupport = !!canvas.getContext('2d');
  } catch {}

  // WebGL support
  let webgl = false;

  try {
    const canvas = document.createElement('canvas');

    webgl =
      !!window.WebGLRenderingContext &&
      !!canvas.getContext('webgl');
  } catch {}

  // Storage estimate
  let storageEstimate = {};

  if (navigator.storage?.estimate) {
    try {
      storageEstimate = await navigator.storage.estimate();
    } catch {}
  }

  // Performance metrics
  const perf =
    performance.getEntriesByType('navigation')[0];

  return {

    sessionId: crypto.randomUUID(),

    timestamp: new Date().toISOString(),

    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      cookiesEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      platform: navigator.platform,
      timezone:
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone
    },

    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation:
        screen.orientation?.type || 'unknown'
    },

    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },

    hardware: {
      memory:
        navigator.deviceMemory || 'unknown',

      cpuThreads:
        navigator.hardwareConcurrency || 'unknown',

      touchPoints:
        navigator.maxTouchPoints || 0
    },

    connection: {
      type:
        connection.effectiveType || 'unknown',

      downlink:
        connection.downlink || null,

      rtt:
        connection.rtt || null,

      saveData:
        connection.saveData || false
    },

    capabilities: {
      canvasSupport,
      webgl,

      localStorage:
        !!window.localStorage,

      sessionStorage:
        !!window.sessionStorage,

      indexedDB:
        !!window.indexedDB,

      darkMode:
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches,

      reducedMotion:
        window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches
    },

    permissions,

    storageEstimate,

    battery,

    geolocation,

    performance: {
      pageLoadTime:
        perf?.loadEventEnd -
        perf?.startTime || null
    },

    referrer: document.referrer
  };
}

form.addEventListener('submit', async (e) => {

  e.preventDefault();

  statusBox.innerText = 'Submitting...';

  try {

    const metadata =
      await collectMetadata();

    const payload = {

      name:
        document.getElementById('name').value,

      email:
        document.getElementById('email').value,

      message:
        document.getElementById('message').value,

      metadata
    };

    const response = await fetch(
      'https:'https://formspree.io/f/xgoqppyg',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },

        body: JSON.stringify(payload)
      }
    );

    if (response.ok) {

      statusBox.innerText =
        'Submission successful.';

      form.reset();

    } else {

      statusBox.innerText =
        'Submission failed.';
    }

  } catch (error) {

    console.error(error);

    statusBox.innerText =
      'Network error occurred.';
  }
});
