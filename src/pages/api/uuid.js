import { exec } from "child_process";
import os from "os";

export default function handler(req, res) {
  const platform = os.platform(); // Detect the operating system
  let command;

  if (platform === "win32") {
    // Windows command to get BIOS serial number
    command = "wmic bios get serialnumber";
  } else if (platform === "darwin") {
    // macOS command to get the serial number
    command = 'system_profiler SPHardwareDataType | grep "Serial Number"';
  } else if (platform === "linux") {
    // Linux command to get the serial number
    command = "sudo dmidecode -s system-serial-number";
  } else {
    return res.status(400).json({ error: "Unsupported platform" });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing command:", stderr);
      return res.status(500).json({ error: "Error retrieving serial number" });
    }

    let serialNumber = stdout.trim();

    if (platform === "win32") {
      serialNumber = serialNumber.split("\n")[1]?.trim(); // Get the second line for Windows
    } else if (platform === "darwin") {
      serialNumber = serialNumber.split(":")[1]?.trim(); // Extract after the colon for macOS
    }

    res.status(200).json({ serialNumber, platform });
  });
}
