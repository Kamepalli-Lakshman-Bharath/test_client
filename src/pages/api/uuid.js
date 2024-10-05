import { exec } from "child_process";
import os from "os";

export default function handler(req, res) {
  const platform = os.platform(); // Get the operating system

  let command;

  if (platform === "win32") {
    // Windows command to get BIOS serial number
    command = "wmic bios get serialnumber";
  } else if (platform === "darwin") {
    // macOS command to get the serial number
    command = 'system_profiler SPHardwareDataType | grep "Serial Number"';
  } else {
    // If the platform is not supported
    return res.status(400).json({ error: "Unsupported platform", platform });
  }

  // Execute the system command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: "Error retrieving serial number" });
    }

    let serialNumber;

    if (platform === "win32") {
      // For Windows, we extract the serial number from the output
      serialNumber = stdout.trim().split("\n")[1].trim();
    } else if (platform === "darwin") {
      // For macOS, we extract the serial number from the output
      serialNumber = stdout.trim().split(":")[1].trim();
    }

    // Return the serial number in the response
    res.status(200).json({ serialNumber });
  });
}
