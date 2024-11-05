'use client'
import { SignIn } from '@clerk/nextjs';
// import { useEffect } from 'react';
import { useEffect } from 'react';
const SignInPage = () => {
  useEffect(() => {
    // This will log when the component is mounted.
    console.log('Sign-in page loaded');
  }, []);

  return <SignIn />;
};

export default SignInPage;
