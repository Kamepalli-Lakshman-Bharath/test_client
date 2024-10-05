import React, { useMemo } from "react";

const generateDeviceFingerprint = () => {
  const components = [];

  // Screen properties (consistent across browsers)
  components.push(screen.width);
  components.push(screen.height);
  components.push(screen.colorDepth);

  // Time zone offset (consistent for the device)
  components.push(new Date().getTimezoneOffset());

  // Available device memory (if supported)
  if (navigator.deviceMemory) {
    components.push(navigator.deviceMemory);
  }

  // CPU cores (if supported)
  if (navigator.hardwareConcurrency) {
    components.push(navigator.hardwareConcurrency);
  }

  // GPU information (if available)
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (gl) {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
      components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    }
  }

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
};

const DeviceFingerprint = () => {
  const fingerprint = useMemo(() => generateDeviceFingerprint(), []);

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
