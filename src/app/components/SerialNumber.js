import React, { useState, useEffect } from "react";

/*const generateDeviceFingerprint = () => {
  const components = [];

  // Ensure this code only runs in the browser (not during SSR)
  if (typeof window !== "undefined") {
    // Screen properties (consistent across browsers)
    // components.push(window.screen.width);
    // components.push(window.screen.height);
    components.push(window.screen.colorDepth);

    // Time zone offset (consistent for the device)
    components.push(new Date().getTimezoneOffset());

    if (window.devicePixelRatio) {
      components.push(window.devicePixelRatio);
    }
    components.push("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // CPU cores (if supported)
    // if (navigator.hardwareConcurrency) {
      // components.push(navigator.hardwareConcurrency);
    // }

    // Generate a hash from the components
    const fingerprint = components.join("###");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert hash to a hexadecimal string
    return Math.abs(hash).toString(16);
  }

  return "unknown"; // Fallback value during SSR
}; */

function generateHardwareFingerprint() {
  const components = [];

  if (typeof window !== "undefined" && window.navigator) {
    // CPU information
    if (navigator.hardwareConcurrency) {
      components.push(`cores:${navigator.hardwareConcurrency}`);
    }

    // Device memory
    if (navigator.deviceMemory) {
      components.push(`memory:${navigator.deviceMemory}`);
    }

    // Screen color depth
    if (window.screen && window.screen.colorDepth) {
      components.push(`color:${window.screen.colorDepth}`);
    }

    // GPU information
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        components.push(`gpu:${vendor}-${renderer}`);
      }
    }

    // Audio context (simplified, synchronous version)
    try {
      const audioContext = new (window.OfflineAudioContext ||
        window.webkitOfflineAudioContext)(1, 44100, 44100);
      const oscillator = audioContext.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      const compressor = audioContext.createDynamicsCompressor();
      oscillator.connect(compressor);
      compressor.connect(audioContext.destination);
      oscillator.start(0);
      audioContext.startRendering();
      const audioFingerprint = audioContext.currentTime.toString();
      components.push(`audio:${audioFingerprint}`);
    } catch (e) {
      console.error("Audio fingerprinting failed:", e);
    }

    // Timezone
    const timezoneOffset = new Date().getTimezoneOffset();
    components.push(`timezone:${timezoneOffset}`);
    console.log('components: ', components);

    // Generate a hash from the components
    const fingerprint = components.join("|");
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert hash to a hexadecimal string
    return Math.abs(hash).toString(16);
  }

  return null; // Return null if window is undefined (e.g., server-side rendering)
}



const DeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState("Loading...");

  useEffect(() => {
    // Generate fingerprint on the client side only after mounting
    const fp = generateHardwareFingerprint();
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
