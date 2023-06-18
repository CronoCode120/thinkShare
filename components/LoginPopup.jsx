import React, { useEffect } from 'react';
import Link from 'next/link';

const LoginPopup = () => {
  useEffect(() => {
    const popUp = document.getElementById('login-msg');
    popUp.style.opacity = '1';
    popUp.style.top = '50%';
  }, []);

  return (
    <div className='w-screen h-screen fixed z-40 top-0 left-0 bg-[rgba(0,0,0,.2)] backdrop-blur-[10px]'>
      <div id='login-msg' className='w-[300px] sm:w-[400px] h-[65vh] fixed z-40 bg-gradient-to-br from-gray-400 via-gray-800 via-30% to-black to-70% top-[45%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-2xl px-14 py-20 text-center shadow-o opacity-0 transition-all duration-1000'>
        <p className='text-xl'>Inicia sesión para ver este contenido.</p>
        <Link href={'/'}><button className='w-full h-12 bg-emerald-500 hover:bg-emerald-300 text-black font-bold rounded-3xl mt-10 sm:mt-20 transition-all duration-200 shadow-lg hover:shadow-emerald-200'>Iniciar sesión</button></Link>
        <p className='mt-10 sm:mt-16'>¿No tienes una cuenta?</p>
        <Link href={'/signup-page'}><button className='w-full h-12 bg-gray-400 hover:bg-white text-black font-bold rounded-3xl mt-1 transition-all duration-200 shadow-lg hover:shadow-gray-300'>Regístrate</button></Link>
      </div>
    </div>
  )
}

export default LoginPopup
