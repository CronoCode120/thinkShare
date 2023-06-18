import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import { useStateContext } from '@/context/StateContext';

const Layout = ({ children }) => {
  const { session } = useStateContext();

  return (
    <div>
      <Head>
        <title>VeganApp</title>
      </Head>
      <header>
        {session && <Navbar />}
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout;
