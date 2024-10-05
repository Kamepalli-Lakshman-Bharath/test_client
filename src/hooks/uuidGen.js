export default function generateDeviceId() {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    navigator.deviceMemory,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    navigator.platform,
  ];

  // Add canvas fingerprinting
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (gl) {
    components.push(gl.getParameter(gl.VENDOR));
    components.push(gl.getParameter(gl.RENDERER));
  }

  // Add font detection
  const fonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
  ];
  const detectedFonts = fonts.filter((font) =>
    document.fonts.check(`12px "${font}"`)
  );
  components.push(detectedFonts.join(","));

  // Generate a hash from the components
  const fingerprint = components.join("###");
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to a hexadecimal string
  const deviceId = Math.abs(hash).toString(16);

  // Store the device ID in local storage
  localStorage.setItem("deviceId", deviceId);

  return deviceId;
}
