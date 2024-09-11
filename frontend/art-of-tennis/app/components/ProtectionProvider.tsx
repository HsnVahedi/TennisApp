"use client";

import {
    useSession, signIn
} from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [signingIn, setSigningIn] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const alreadyLoggedIn = searchParams.get('alreadyLoggedIn') === '1';

  const authenticate = () => {
    // alert('Are you sure?')
    const azureUri = `${process.env.NEXT_PUBLIC_DOMAIN}`
    const path = `${process.env.NEXT_PUBLIC_NEXT_JS_HOME_PAGE_URI || azureUri}${pathname}`;
    alert(path)
    setSigningIn(true);
    alert('1')
    signIn('django', { callbackUrl: path }, { frontendPage: path });
    alert('2')
  };  

  useEffect(() => {
    if (alreadyLoggedIn) {
      authenticate();
    }
  }, [alreadyLoggedIn]);

  if (signingIn) {
    return <div>Signing in...</div>;
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }


  if (!session || !session.user) {
    return (
      <div>
        <button onClick={() => authenticate()}>Sign in</button>
      </div>
    );
  }

  return <>{children}</>;
}