import React, { useState, useEffect } from "react";

const generateDeviceFingerprint = () => {
  const components = [];
  const userObj = {};

  // Ensure this code only runs in the browser (not during SSR)
  if (typeof window !== "undefined") {
    // Screen properties (consistent across browsers)
    components.push(window.screen.width);
    components.push(window.screen.height);
    components.push(window.screen.colorDepth);
    userObj.width = window.screen.width;
    userObj.height = window.screen.height;
    userObj.colorDepth = window.screen.colorDepth;

    // Time zone offset (consistent for the device)
    components.push(new Date().getTimezoneOffset());
    userObj.time = new Date().getTimezoneOffset();

    if (window.devicePixelRatio) {
      components.push(window.devicePixelRatio);
      userObj.pixel = window.devicePixelRatio;
    }
    components.push("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // CPU cores (if supported)
    if (navigator.hardwareConcurrency) {
      components.push(navigator.hardwareConcurrency);
      userObj.pixel = navigator.hardwareConcurrency;
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
  }

  return "unknown"; // Fallback value during SSR
};

const DeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState("Loading...");

  useEffect(() => {
    // Generate fingerprint on the client side only after mounting
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
