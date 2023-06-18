import React, { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';
import { useStateContext } from '@/context/StateContext';

export default function Verification({ email, finishFunction }) {
  const [verificationCode, setVerificationCode] = useState('');
  const { router } = useStateContext();

  const sendEmail = () => {
    const code = Math.floor(Math.random() * 1000000);
    setVerificationCode(code);

    const params = {
      verificationCode: code,
      emailTo: email
    };

    emailjs.send('gmail', 'template', params, process.env.NEXT_PUBLIC_EMAILJS_KEY)
      .then(function(response) {
        console.log({message: 'success', response: response})
      }, function(error) {
        console.log('FAILED', error);
        console.log({error});
      }
    );
  }

  useEffect(() => {
    document.getElementById('main').style.opacity = 1;
    sendEmail();
  }, []);

  return (
    <div id='main' className='w-screen h-screen flex justify-center items-center fixed top-0 left-0 z-40 bg-[rgba(0,0,0,.9)] opacity-0 transition-all duration-300'>
      <div className='bg-emerald-800 rounded-2xl w-[300px] sm:w-[400px] h-[400px] p-8 flex flex-col'>
          <h1 className='font-bold text-xl text-center mb-2'>Verifica tu dirección de correo</h1>
          <p className='text-center mb-6'>Escribe debajo el código de 6 dígitos que hemos enviado a tu correo electrónico.</p>
          <div className='w-full flex flex-col justify-center items-center mb-6'>
            <label htmlFor='code' className='font-semibold text-emerald-200'>CÓDIGO:</label>
            <input id='code' type='text' maxLength={6} className='bg-transparent text-2xl w-[125px] text-center p-2 border-b-[3px] outline-none tracking-[0.25em]'
              onChange={async (e) => {
                if(e.target.value == verificationCode) {
                  toast.success('Verificación completada');
                  finishFunction();
                }
              }}
            ></input>
          </div>
          <p className='text-sm text-center mb-2'>Si no te ha llegado ningún correo, reenvíalo aquí.</p>
          <button type='button' className='px-2 py-1 bg-emerald-300 text-emerald-950 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-400 transition-all duration-200' onClick={() => sendEmail()}>Reenviar código</button>
      </div>
    </div>
  );
}