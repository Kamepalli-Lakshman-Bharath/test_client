"use client";
import Image from "next/image";
import SerialNumber from "./components/SerialNumber";

export default function Home() {
  return (
    <main className="h-screen bg-slate-50 w-screen grid place-items-center">
      <SerialNumber />
    </main>
  );
}
