import React, { useState } from 'react';
import connectMongo from '@/utils/connectMongo';
import { emailFormatValidation, emailUniquenessValidation, passwordFormatValidation, validateUsernameFormat, validateUniqueUsername } from '@/utils/credentialsValidation';
import User from '../models/userModel';
import { EmailVerification } from '@/components';
import { useStateContext } from '@/context/StateContext';

export const getServerSideProps = async () => {
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
};

const SignUpPage = ({ users }) => {
  const [showVerification, setShowVerification] = useState(false);

  const { router } = useStateContext();
    
  const signUpUser = async () => {
    const res = await fetch('/api/test/add/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: document.getElementsByName('username')[0].value,
        email: document.getElementsByName('email')[0].value,
        password: document.getElementsByName('password')[0].value,
        age: document.getElementsByName('age')[0].value,
      })
    });
    const data = await res.json();
    console.log(data);
    router.replace('/');
  }
  
  const validateSignUp = (usersData) => {
    const password = document.getElementById('signup-pwd').value;
    const username = document.getElementById('signup-username').value;
    const age = document.getElementById('signup-age').value;
    const emailError = document.getElementById('wrongEmail');
    const pwdError = document.getElementById('wrongPassword');
    const usernameError = document.getElementById('wrongUsername');
    const ageError = document.getElementById('wrongAge');
    emailError.style.opacity = 0;
    pwdError.style.opacity = 0;
    usernameError.style.opacity = 0;
    ageError.style.opacity = 0;
    if(emailFormatValidation() && emailUniquenessValidation(usersData) && passwordFormatValidation(password) && validateUniqueUsername(usersData, username) && validateUsernameFormat(username) && age >= 18) {
      return true;
    } else {
      if(!emailFormatValidation()) {
        emailError.textContent = 'Este correo no es válido.';
        emailError.style.opacity = 1;
      } else if(!emailUniquenessValidation(usersData)) {
        emailError.textContent = 'Este correo ya está en uso.';
        emailError.style.opacity = 1;
      }
      if(!passwordFormatValidation(password)) {
        pwdError.textContent = 'La contraseña debe contener al menos 8 caracteres: al menos una letra, un número y un símbolo.';
        pwdError.style.opacity = 1;
      }
      if(!validateUsernameFormat(username)) {
        usernameError.textContent = 'El nombre de usuario debe contener entre 5 y 16 caracteres, sin incluir símbolos ni espacios.';
        usernameError.style.opacity = 1;
      } else if(!validateUniqueUsername(usersData, username)) {
        usernameError.textContent = 'Este nombre de usuario ya está en uso.';
        usernameError.style.opacity = 1;
      }
      if(age < 18) {
        ageError.textContent = 'Debes tener 18 años o más para registrarte.';
        ageError.style.opacity = 1;
      }
    }
  }
  return (
    <div className='h-screen flex-col justify-center items-center absolute top-0 left-0 w-screen z-40 bg-black'>
      <h2 className='text-2xl font-semibold text-center my-5'>Registrar nueva cuenta</h2>
      <form className='w-[300px] sm:w-[400px] h-[80vh] flex flex-col bg-emerald-950 justify-evenly rounded-2xl mx-auto p-5 sm:p-10' onSubmit={(e) => {
        e.preventDefault();
        if(validateSignUp(users)) {
          setShowVerification(true);
        }
      }}>
        <div>
          <label htmlFor='signup-email' className='after:content-["*"] after:text-red-400'>Correo electrónico</label>
          <input
            id='signup-email'
            name='email'
            type='text'
            required
            placeholder='Correo electrónico'
            className='w-full h-8 bg-transparent outline-none border-b-2 focus:border-b-[3px] text-emerald-200 placeholder-emerald-300 font-semibold border-emerald-300 transition-all duration-200'  
          ></input>
          <p id='wrongEmail' className='opacity-1 italic text-sm text-red-400'></p>
        </div>
        <div>
          <label htmlFor='signup-pwd' className='after:content-["*"] after:text-red-400'>Contraseña</label>
          <input
            id='signup-pwd'
            name='password'
            type='password'
            placeholder='Contraseña'
            required
            className='w-full h-8 bg-transparent outline-none border-b-2 focus:border-b-[3px] text-emerald-200 placeholder-emerald-300 font-semibold border-emerald-300 transition-all duration-200'
          ></input>
          <p id='wrongPassword' className='opacity-1 text-red-400 italic text-sm'></p>
        </div>
        <div>
          <label htmlFor='signup-username' className='after:content-["*"] after:text-red-400'>Nombre de usuario</label>
          <input id='signup-username' name='username' type='text' required placeholder='Usuario' className='w-full h-8 bg-transparent outline-none border-b-2 focus:border-b-[3px] text-emerald-200 placeholder-emerald-300 font-semibold border-emerald-300 transition-all duration-200'></input>
          <p id='wrongUsername' className='opacity-1 text-red-400 italic text-sm'></p>
        </div>
        <div>
          <label htmlFor='signup-age' className='after:content-["*"] after:text-red-400'>Edad</label>
          <input id='signup-age' name='age' type='number' required placeholder='Edad' className='w-full h-8 bg-transparent outline-none border-b-2 focus:border-b-[3px] text-emerald-200 placeholder-emerald-300 font-semibold border-emerald-300 transition-all duration-200'></input>
          <p id='wrongAge' className='opacity-1 text-red-400 italic text-sm'></p>
        </div>
        <input type='submit' value='Crear cuenta' className='w-full bg-black h-10 rounded-3xl border-2 border-emerald-400 cursor-pointer shadow-o shadow-emerald-700 font-semibold hover:bg-emerald-400 hover:text-black transition-all duration-200'></input>
      </form>
      {showVerification && <EmailVerification email={document.getElementById('signup-email').value} finishFunction={signUpUser}/>}
    </div>
  );
}

export default SignUpPage;