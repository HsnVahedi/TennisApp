"use client";

import {
    useSession, signIn
} from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PageLayout from '@/app/components/layouts/1';
import Link from 'next/link';


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
    // alert(path)
    setSigningIn(true);
    // alert('1')
    signIn('django', { callbackUrl: path }, { frontendPage: path });
    // alert('2')
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
          <PageLayout>
            <div className="flex flex-col justify-center items-center min-h-screen">
              <div className="max-w-6xl mx-auto text-center text-purple-900 px-4 flex-grow flex flex-col justify-center items-center">
                {/* Lock Icon */}
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10em" height="10em" viewBox="0 0 20 20" fill="currentColor" className="text-purple-700">
                    <path d="M15 8V5s0-5-5-5a4.63 4.63 0 0 0-4.88 4h2C7.31 2.93 8 2 10 2c3 0 3 2 3 3.5V8H3.93A1.93 1.93 0 0 0 2 9.93v8.15A1.93 1.93 0 0 0 3.93 20h12.14A1.93 1.93 0 0 0 18 18.07V9.93A1.93 1.93 0 0 0 16.07 8zm-5 8a2 2 0 1 1 2-2a2 2 0 0 1-2 2"/>
                  </svg>
                </div>
                {/* Main Content */}
                <h1 className="text-3xl font-bold mb-4">
                  To access this page, you need to login first.
                </h1>
                <br />
                <br />
                <br />
                <button onClick={() => authenticate()} className="bg-purple-700 text-white font-bold py-4 px-8 text-2xl rounded hover:bg-purple-600 transition duration-300">
                  Click Here to Login now
                </button>
              </div>
            </div>
          </PageLayout>
      // <div>
      //   <button onClick={() => authenticate()}>Sign in</button>
      // </div>
    );
  }

  return <>{children}</>;
}