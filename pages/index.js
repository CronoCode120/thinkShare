import React, { useEffect } from 'react';
import { useStateContext } from '@/context/StateContext';
import Link from 'next/link';
import connectMongo from '@/utils/connectMongo';
import User from '@/models/userModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';

export const getServerSideProps = async() => {
  try {
    console.log('Connecting to Mongo');
    await connectMongo();
    console.log('Connected to mongo');
  
    console.log('Fetching documents');
    const users = await User.find();
    console.log('Fetched documents');
  
    return {
      props: {
        users: JSON.parse(JSON.stringify(users))
      }
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true
    };
  };
}

const LoginPage = ({ users }) => {
  const { setSessionUser, session, setSession, router } = useStateContext();
  
  useEffect(() => {
    if(session) {
      console.log('logged In')
      router.replace('/home');
    }
  }, []);

  const login = () => {
    const curEmail = document.getElementById('login-email').value;
    const curPwd = document.getElementById('login-pwd').value;
    const checkEmail = users.findIndex(user => user.email === curEmail);
    const warning = document.getElementById('wrongCredentials');
    const warningContainer = document.getElementById('warningContainer');
    warningContainer.style.opacity = 0;
    if(checkEmail !== -1) {
      const userPassword = users[checkEmail].password;
      if (userPassword == curPwd) {
        setSession(true);
        const user = users[checkEmail];
        setSessionUser({...user});
        try {
          localStorage.setItem('sessionUser', JSON.stringify({...user}));
          console.log(localStorage.getItem('sessionUser'));
        } catch (error) {
          console.log(error);
        }
        router.replace('/home');
      } else {
        warning.textContent = ' Contraseña incorrecta. Inténtalo de nuevo.';
        warningContainer.style.opacity = 1;
      }
    } else {
      warning.textContent = ' No existe ninguna cuenta asociada a este correo.';
      warningContainer.style.opacity = 1;
    }
  }

  return (
    <div className='h-screen p-10 relative z-40 bg-black w-screen'>
      <h1 className='h-20 relative text-center text-4xl sm:text-6xl font-bold shadow bg-gradient-to-r from-emerald-700 to-emerald-700 via-green-600 bg-x2 animate-bgMove bg-clip-text text-transparent select-none before:absolute before:w-full before:h-full before:-z-10 before:bg-gradient-to-r before:from-emerald-800 before:to-emerald-800 before:via-green-600 before:left-0 before:top-0 before:content-["VeganApp"] before:text-transparent before:bg-clip-text before:bg-x2 before:animate-bgMove before:blur-[15px]'>ThinkShare</h1>
      <h3 className='text-center text-gray-400 text-lg mb-6'>Comparte lo que piensas</h3>
      <div className='h-200 flex flex-col lg:flex-row items-center h-[400px]'>
        <div className='min-w-[45vw] text-center flex lg:flex-col'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl h-12 lg:mb-6 font-semibold select-none'>Conoce.</h2>
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl h-12 lg:mb-6 font-semibold select-none'>Comparte.</h2>
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl h-12 lg:mb-6 font-semibold select-none'>Conecta.</h2>
        </div>
        <div>
          <form onSubmit={(e) => {
            e.preventDefault();
            login();
          }} className='h-[380px] sm:h-[400px] max-w-[400px] min-w-[300px] mx-auto flex flex-col items-center p-8 sm:p-10 bg-emerald-400 rounded-2xl shadow-xl shadow-teal-700 text-teal-900'>
            <div className='w-full h-[35%]'>
              <label htmlFor='login-email'>Correo electrónico</label>
              <input name='login-email' id='login-email' type='text' className='w-full h-8 bg-transparent border-b focus:border-b-[3px] focus:outline-0 transition-all duration-100 border-teal-900 focus:border-white text-black'></input>
            </div>
            <div className='w-full h-[35%]'>
              <label htmlFor='login-pwd'>Contraseña</label>
              <input name='login-pwd' id='login-pwd' type='password' className='w-full h-8 bg-transparent border-b focus:border-b-[3px] focus:outline-0 transition-all duration-100 border-teal-900 focus:border-white text-black'></input>
              <p id='warningContainer' className='text-black bg-red-400 p-1 h-fit text-sm text-center w-full font-semibold rounded-2xl mt-2 transition-all duration-200 opacity-0'>
                <FontAwesomeIcon icon={faWarning} size='lg'/>
                <span id='wrongCredentials'></span>
              </p>
            </div>
            <input type='submit' value='Iniciar sesión' className='w-full h-10 rounded-xl cursor-pointer mt-2 mb-4 bg-teal-900 text-white hover:bg-teal-700 transition-all duration-200'></input>
            <p>¿No tienes una cuenta? <Link href={'/signup-page'} className='text-slate-950 font-semibold hover:underline'>Regístrate aquí</Link>.</p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;