// app/components/BluetoothComponent.tsx
"use client"; // Ensure this is client-side rendering

import { useState, useEffect } from "react";

export default function BluetoothComponent() {
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Mark component as client-side after mount
  }, []);

  const connectToBluetooth = async () => {
    if (typeof navigator === "undefined" || !navigator?.bluetooth) {
      setError("Bluetooth API is not supported in this browser.");
      return;
    }

    try {
      setError(null);
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service"],
      });

      setDeviceName(device.name || "Unknown Device");

      const server = await device.gatt?.connect();
      if (!server) throw new Error("Failed to connect to device.");

      const service = await server.getPrimaryService("battery_service");
      const characteristic = await service.getCharacteristic("battery_level");

      const value = await characteristic.readValue();
      setBatteryLevel(`${value.getUint8(0)}%`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // If we're not on the client yet, return null (nothing) or a loading message
  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={connectToBluetooth}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Connect to Bluetooth Device
      </button>

      {deviceName && <p className="mt-4">Connected to: {deviceName}</p>}
      {batteryLevel && <p>Battery Level: {batteryLevel}</p>}
      {error && <p className="text-red-500 mt-2">Error: {error}</p>}
    </div>
  );
}
