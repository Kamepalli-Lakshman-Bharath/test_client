import React, { useState, useEffect } from "react";

function generateDeviceFingerprint() {
  const components = [];

  if (typeof window !== "undefined" && window.navigator) {
    // Existing components
    if (navigator.hardwareConcurrency) {
      components.push(`cores:${navigator.hardwareConcurrency}`);
    }

    if (window.screen) {
      components.push(`screen:${screen.width}x${screen.height}`);
      components.push(`depth:${screen.colorDepth}`);
    }

    if (window.devicePixelRatio) {
      components.push(`pixelRatio:${window.devicePixelRatio}`);
    }

    if (window.innerWidth && window.innerHeight) {
      components.push(`innerSize:${window.innerWidth}x${window.innerHeight}`);
    }

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        components.push(`gpu:${vendor}-${renderer}`);
      }
    }

    if (navigator.deviceMemory) {
      components.push(`memory:${navigator.deviceMemory}`);
    }

    if (navigator.platform) {
      components.push(`platform:${navigator.platform}`);
    }

    components.push(`ua:${navigator.userAgent}`);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    components.push(`tz:${timeZone}`);

    // New components
    // Audio context fingerprint
    try {
      const audioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
      const oscillator = audioContext.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      const compressor = audioContext.createDynamicsCompressor();
      oscillator.connect(compressor);
      compressor.connect(audioContext.destination);
      oscillator.start(0);
      audioContext.startRendering();
      const audioFingerprint = audioContext.oncomplete = function(e) {
        const audioData = e.renderedBuffer.getChannelData(0);
        const audioDataSum = audioData.reduce((acc, val) => acc + Math.abs(val), 0);
        return audioDataSum.toString();
      };
      components.push(`audio:${audioFingerprint}`);
    } catch (e) {
      components.push(`audio:notSupported`);
    }

    // Canvas fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Hello, world!", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Hello, world!", 4, 17);
      const canvasUrl = canvas.toDataURL();
      components.push(`canvas:${canvasUrl}`);
    } catch (e) {
      components.push(`canvas:notSupported`);
    }

    // List of installed fonts
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const testFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'];
      const installedFonts = testFonts.filter(font => {
        context.font = `12px "${font}", Arial`;
        return context.measureText('abcdefghijklmnopqrstuvwxyz').width !== context.measureText('abcdefghijklmnopqrstuvwxyz').width;
      });
      components.push(`fonts:${installedFonts.join(',')}`);
    } catch (e) {
      components.push(`fonts:notSupported`);
    }

    // Battery status
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        components.push(`battery:${battery.charging},${battery.level}`);
      });
    }

    // Available storage
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        components.push(`storage:${estimate.quota}`);
      });
    }

    console.log(components);
    const fingerprint = components.join("|||");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  return null;
}

// Usage
const deviceFingerprint = generateDeviceFingerprint();
console.log('Device Fingerprint:', deviceFingerprint);

const DeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState("Loading...");

  useEffect(() => {
    const fp = generateDeviceFingerprint();
    setFingerprint(fp);
  }, []);

  return (
    <div className="space-y-2 bg-slate-100 shadow rounded-md w-80 p-5">
      <h1 className="font-semibold text-2xl text-black/70 text-center">
        Device Fingerprint
      </h1>
      <div className="font-semibold w-50">
        <p
          title={fingerprint || "No value"}
          className="h-8 grid place-items-center tracking-wide bg-red-400 text-white rounded-md min-w-fit max-w-full truncate"
        >
          {fingerprint || ""}
        </p>
      </div>
    </div>
  );
};

export default DeviceFingerprint;
