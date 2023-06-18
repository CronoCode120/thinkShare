import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faBell as faSolidBell, faChevronRight, faCircleExclamation, faDice } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useStateContext } from '@/context/StateContext';
import blankPfp from '../public/blankPfp.jpg';

const Navbar = () => {
  const { sessionUser, setSession, setSessionUser, router } = useStateContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const logOut = () => {
    setSession(false);
    localStorage.removeItem('sessionUser');
    router.replace('/');
  }

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(sessionUser ? sessionUser.notifications?.length : 0);

  console.log(sessionUser)

  useEffect(() => {
    setNotifications(sessionUser.notifications?.length);
  }, [sessionUser]);

  const readNotifications = async (notifId) => {
    const res = await fetch('/api/test/update/readNotifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: sessionUser._id,
        notifId: notifId
      })
    });
    const data = await res.json();
    console.log(data);
    setNotifications(prevNotif => prevNotif - 1);
    setSessionUser(data);
  }

  return (
    <div className='fixed z-30 w-full p-4 flex justify-start sm:justify-center items-center bg-[rgba(0,0,0,.4)] backdrop-blur-[10px] shadow-md shadow-[rgba(255,255,255,.1)] border-b-[1px] border-gray-400 rounded-b-2xl'>
      <div className='max-sm:ml-8 flex justify-evenly w-[35vw]'>
        <Link href={'/home'}><FontAwesomeIcon icon={faHouse} size='xl' className='hover:cursor-pointer hover:text-green-500 transition-all duration-200' /></Link>
        <Link href={'/explore'}><FontAwesomeIcon icon={faDice} size='xl' className='hover:cursor-pointer hover:text-green-500 transition-all duration-200' /></Link>
      </div>
      <div className='flex justify-center items-start absolute right-5 lg:right-20 top-1.5 z-2'>
        <span title='Notificaciones' className='cursor-pointer relative top-2'
          onClick={() => {
            setShowNotifications(true);
          }}
        >
          <FontAwesomeIcon icon={notifications > 0 ? faSolidBell : faBell} size='xl'/>
          {notifications > 0 && <span className='absolute top-[-30%] left-[50%] h-5 w-fit px-2 rounded-full flex justify-center items-center bg-emerald-400 text-black'>{notifications}</span>}
        </span>
        <div className='flex flex-col justify-center items-center'>
          <div className='hover:shadow-o transition-all duration-200 mx-8 rounded-full hover:cursor-pointer w-[45px] h-[45px] overflow-hidden flex justify-center items-center' onClick={() => {
                showProfileMenu ? setShowProfileMenu(false) : setShowProfileMenu(true);
              }}>
            <Image
              src={sessionUser?.profilePicture || blankPfp}
              width={45}
              height={45}
              alt='Your profile picture'
              className='hover:cursor-pointer rounded-full min-w-full min-h-full object-cover'
              unoptimized
              quality={100}
            />
          </div>
          {showProfileMenu && <div id='pf-menu' className='relative z-10 flex flex-col text-center bg-[rgba(0,0,0,.5)] backdrop-blur-[10px] border mt-2 rounded-2xl transition-all duration-300 select-none' onClick={() => setShowProfileMenu(false)}>
          <Link href={`/profile/${sessionUser._id}`} className='w-full p-2  hover:bg-gray-900 hover:cursor-pointer rounded-t-2xl'><span className='w-full'>Tu perfil</span></Link>
            <Link href={'/settings'} className='w-full p-2  hover:bg-gray-900 hover:cursor-pointer border-t border-gray-400'><span className='w-full'>Ajustes</span></Link>
            <span className='p-2 w-full border-t border-gray-400 hover:bg-gray-900 hover:cursor-pointer rounded-br-2xl rounded-bl-2xl' onClick={() => logOut()}>Cerrar sesión</span>
          </div>}
          {showNotifications &&
          <div className='w-screen h-screen bg-[rgba(0,0,0,.7)] fixed top-0 left-0'>
            <div className='bg-[rgba(0,0,0,.7)] backdrop-blur-[10px] border-r-[2px] border-gray-700 h-screen w-full sm:w-[360px] overflow-y-scroll overscroll-none'>
              <div className='flex justify-between items-center p-10'>
                <h4 className='text-2xl font-bold'>Notificaciones</h4>
                <button title='Cerrar pestaña' type='button'
                  onClick={() => {
                    setShowNotifications(false);
                  }}>
                    <FontAwesomeIcon icon={faChevronRight} size='xl'/>
                  </button>
              </div>
              <div className='flex flex-col justify-start items-start'>
                {notifications > 0 ? sessionUser.notifications.map(notification => (
                  <Link href={notification.url}
                    onClick={() => {
                      setShowNotifications(false);
                      readNotifications(notification.id);
                    }}
                  >
                    <div className='flex justify-start items-center px-4 sm:w-[330px]'>
                      <span><FontAwesomeIcon icon={faCircleExclamation} size='2xl'/></span>
                      <p className='px-4 py-5 border-b '>{notification.message}</p>
                    </div>
                  </Link>
                )) : (
                  <p className='w-full flex justify-center'>No tienes notificaciones.</p>
                )}
              </div>
            </div>
          </div>
          }
        </div>
      </div>
    </div>
  )
}

export default Navbar;
