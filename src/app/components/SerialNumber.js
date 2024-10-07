import React, { useState, useEffect } from "react";

function generateDeviceFingerprint() {
  const components = [];

  if (typeof window !== "undefined" && window.navigator) {
    // Hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency) {
      components.push(`cores:${navigator.hardwareConcurrency}`);
    }

    // Screen properties
    if (window.screen) {
      components.push(`screen:${screen.width}x${screen.height}`);
      components.push(`depth:${screen.colorDepth}`);
    }

    // Device pixel ratio
    if (window.devicePixelRatio) {
      components.push(`pixelRatio:${window.devicePixelRatio}`);
    }

    // Available screen size (may vary slightly between browsers but useful for device characterization)
    if (window.innerWidth && window.innerHeight) {
      components.push(`innerSize:${window.innerWidth}x${window.innerHeight}`);
    }

    // GPU info (can be detailed and device-specific)
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

    if (navigator.deviceMemory) {
      components.push(`memory:${navigator.deviceMemory}`);
    }

    if (navigator.platform) {
      components.push(`platform:${navigator.platform}`);
    }

    components.push(`ua:${navigator.userAgent}`);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    components.push(`tz:${timeZone}`);

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

const deviceFingerprint = generateDeviceFingerprint();
console.log("Device Fingerprint:", deviceFingerprint);

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
