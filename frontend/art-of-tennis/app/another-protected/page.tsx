"use client";

import ProtectionProvider from "@/app/components/ProtectionProvider";

export default function ProtectedRoute() {
  return (
    <ProtectionProvider>
      <h1>
        This is Another protected route.
      </h1>
    </ProtectionProvider>
  );
}