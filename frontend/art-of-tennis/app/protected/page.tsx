"use client";

import ProtectionProvider from "@/app/components/ProtectionProvider";

export default function ProtectedRoute() {
  return (
    <ProtectionProvider>
      <div>
        This is a protected route.
        <br />
        You will only see this if you are authenticated.
      </div>
    </ProtectionProvider>
  );
}
