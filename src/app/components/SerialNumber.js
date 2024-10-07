import React, { useState, useEffect } from "react";
import sha256 from "crypto-js/sha256";

// Generate Audio Fingerprint
function generateAudioFingerprint() {
  return new Promise((resolve) => {
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
      audioContext
        .startRendering()
        .then((buffer) => {
          const audioData = buffer.getChannelData(0);
          const audioDataSum = audioData.reduce(
            (acc, val) => acc + Math.abs(val),
            0
          );
          resolve(audioDataSum.toString());
        })
        .catch(() => {
          resolve("audio:notSupported");
        });
    } catch (e) {
      resolve("audio:notSupported");
    }
  });
}

// Generate Device Fingerprint
async function generateDeviceFingerprint() {
  const components = [];

  if (typeof window !== "undefined" && window.navigator) {
    // Stable components
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

    if (navigator.deviceMemory) {
      components.push(`memory:${navigator.deviceMemory}`);
    }

    if (navigator.platform) {
      components.push(`platform:${navigator.platform}`);
    }

    // Browser language and locale
    components.push(`language:${navigator.language}`);
    if (navigator.languages) {
      components.push(`languages:${navigator.languages.join(",")}`);
    }

    // Touchscreen support
    components.push(`touchPoints:${navigator.maxTouchPoints}`);

    // CPU architecture (32-bit vs. 64-bit)
    const is64Bit =
      navigator.platform.indexOf("64") !== -1 ? "64-bit" : "32-bit";
    components.push(`cpuArchitecture:${is64Bit}`);

    // Session and Local Storage support
    try {
      const test = "storage_test";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      components.push("sessionStorage:available");
    } catch (e) {
      components.push("sessionStorage:notAvailable");
    }

    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      components.push("localStorage:available");
    } catch (e) {
      components.push("localStorage:notAvailable");
    }

    // Cookies enabled
    components.push(`cookiesEnabled:${navigator.cookieEnabled}`);

    // Media devices (camera, microphone, etc.)
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioVideoDevices = devices
        .filter(
          (device) =>
            device.kind === "audioinput" || device.kind === "videoinput"
        )
        .map((device) => `${device.kind}:${device.label}`);
      components.push(`mediaDevices:${audioVideoDevices.join(",")}`);
    } catch (e) {
      components.push("mediaDevices:notSupported");
    }

    // GPU Information
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

    // Browser Plugins
    const plugins = Array.from(navigator.plugins)
      .map((plugin) => plugin.name)
      .join(",");
    components.push(`plugins:${plugins}`);

    components.push(`ua:${navigator.userAgent}`);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    components.push(`tz:${timeZone}`);

    // Audio fingerprint
    const audioFingerprint = await generateAudioFingerprint();
    components.push(`audio:${audioFingerprint}`);

    // Enhanced canvas fingerprinting (including WebGL)
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
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

    // WebRTC IP Detection
    try {
      const rtcConnection = new RTCPeerConnection({ iceServers: [] });
      rtcConnection.createDataChannel("");
      rtcConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
          if (ipMatch) {
            components.push(`localIP:${ipMatch[0]}`);
          }
        }
      };
      await rtcConnection.createOffer();
      await rtcConnection.setLocalDescription(rtcConnection.localDescription);
    } catch (e) {
      components.push(`webrtcIP:notSupported`);
    }

    // Final fingerprint generation
    const fingerprint = components.join("|||");

    // Use SHA-256 for better hashing
    const hash = sha256(fingerprint).toString();

    return hash;
  }

  return null;
}

const DeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState("Loading...");

  // Use async function inside useEffect to handle async fingerprint generation
  useEffect(() => {
    const fetchFingerprint = async () => {
      const fp = await generateDeviceFingerprint();
      setFingerprint(fp);
    };
    fetchFingerprint();
  }, []);

  return (
    <div className="space-y-2 bg-slate-100 shadow rounded-md min-w-80 max-w-fit p-5">
      <h1 className="font-semibold text-2xl text-black/70 text-center">
        Device Fingerprint
      </h1>
      <div className="font-semibold w-50 ">
        <p
          title={fingerprint || "No value"}
          className="h-8 grid px-1 place-items-center tracking-wide bg-red-400 text-white rounded-md min-w-fit max-w-full truncate"
        >
          {fingerprint || ""}
        </p>
      </div>
    </div>
  );
};

export default DeviceFingerprint;
