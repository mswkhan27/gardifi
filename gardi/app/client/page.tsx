"use client"; // Mark this as a Client Component

import BluetoothComponent from "../components/BluetoothComponent";

export default function ClientPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Client-Side Bluetooth Page</h1>
      <BluetoothComponent />
      <a href="/ssr" className="mt-4 text-blue-500">Go to SSR Page</a>
    </div>
  );
}
