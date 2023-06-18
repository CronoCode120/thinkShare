import React, { useState } from 'react';
import Image from 'next/image';
import User from '@/models/userModel';
import connectMongo from '@/utils/connectMongo';
import { useStateContext } from '@/context/StateContext';
import { validateUniqueUsername, validateUsernameFormat, passwordFormatValidation, emailFormatValidation, emailUniquenessValidation } from '@/utils/credentialsValidation';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faPencil } from '@fortawesome/free-solid-svg-icons';

import blankPfp from '../public/blankPfp.jpg';
import { DeleteMessage, LoginPopup, EmailVerification } from '@/components';
import { toast } from 'react-hot-toast';

const cloudinaryURL = 'https://api.cloudinary.com/v1_1/djadxjcn4/image/upload';

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
}

const Settings = ({ users }) => {
  const { sessionUser, setSessionUser, showDeleteMessage, setShowDeleteMessage, session } = useStateContext();
  const [editUsername, setEditUsername] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  console.log(sessionUser);

  const [editPfp, setEditPfp] = useState(false);

  const updateUsername = async (newUsername) => {
    try {
      const res = await fetch('/api/test/update/updateUserData', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newUsername,
          userId: sessionUser._id
        })
      });
      toast.success('Nombre de usuario actualizado');
      const data = await res.json();
      setSessionUser({...data.updatedUser});
      setEditUsername(false);
    } catch (error) {
      toast.error('No hemos podido actualizar tu nombre de usuario');
      console.log(error);
    }
  }

  const setNewUsername = () => {
    const curUsername = document.getElementById('newUsername').value;
    const errorMsg = document.getElementById('usernameError');
    const password = document.getElementById('curPassword');
    const wrongPswd = document.getElementById('passwordError');

    if(password.value === sessionUser.password) {
      wrongPswd.style.opacity = 0;
      if(curUsername !== sessionUser.username) {
        if(validateUsernameFormat(curUsername) && validateUniqueUsername(users, curUsername)) {
          errorMsg.style.opacity = 0;
          updateUsername(curUsername);
        } else {
          if (!validateUsernameFormat(curUsername)) {
            errorMsg.textContent = "Debe tener entre 5 y 16 caracteres, sin incluir caracteres especiales.";
          } else {
            errorMsg.textContent = "Este nombre de usuario ya está en uso.";
          }
          errorMsg.style.opacity = 1;
        }
      } else {
        errorMsg.textContent = "Este es tu nombre de usuario actual.";
        errorMsg.style.opacity = 1;
      }
    } else {
      wrongPswd.style.opacity = 1;
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const res = await fetch('/api/test/update/updateUserData', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: newPassword,
          userId: sessionUser._id
        })
      });
      toast.success('Contraseña actualizada');
      const data = await res.json();
      setSessionUser({...data.updatedUser});
      setEditPassword(false);
    } catch (error) {
      toast.error('No hemos podido actualizar tu contraseña');
      console.log(error);
    }
  }

  const changePassword = () => {
    const curPassword = document.getElementById('curPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const repeatPassword = document.getElementById('repeatPassword').value;

    if(curPassword === sessionUser.password) {
      document.getElementById('wrongCurPassword').style.opacity = 0;
      if(passwordFormatValidation(newPassword)) {
        document.getElementById('wrongNewPassword').style.opacity = 0;
        if(newPassword === repeatPassword) {
          document.getElementById('wrongRepeatPassword').style.opacity = 0;
          updatePassword(newPassword);
        } else {
          document.getElementById('wrongRepeatPassword').style.opacity = 1;
        }
      } else {
        document.getElementById('wrongNewPassword').style.opacity = 1;
      }
    } else {
      document.getElementById('wrongCurPassword').style.opacity = 1;
    }
  }

  const updateProfilePicture = async (imageURL) => {
    try {
      const res = await fetch('api/test/update/updateUserData', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageURL,
          type: 'pfp',
          userId: sessionUser._id
        })
      });
      toast.success('Foto de perfil actualizada');
      const data = await res.json();
      setSessionUser({...data.updatedUser});
      setEditPfp(false);
      console.log(sessionUser.profilePicture);
    } catch (error) {
      toast.error('No se ha podido guardar tu foto');
      console.log(error);
    }
  }

  const changePfp = async () => {
    const image = document.getElementById('pfpInput').files[0];
    if(image.type === 'image/png' || image.type === 'image/jpeg' || image.type === 'image/gif' || image.type === 'image/webp') {
      const res = await fetch(`/api/test/get-signature/${sessionUser._id}?type=profile`, {method: 'GET'});
      const signature = await res.json();

      const data = new FormData();
      data.append("file", image);
      data.append("api_key", process.env.NEXT_PUBLIC_API_KEY);
      data.append("signature", signature.signature);
      data.append("timestamp", signature.timestamp);
      data.append("public_id", "profile_picture");
      data.append("folder", sessionUser._id);
      const uploadImg = await fetch(cloudinaryURL, {
        method: 'POST',
        body: data
      });
      const response = await uploadImg.json();
      updateProfilePicture(response.secure_url)
    }
  }

  const setNewEmail = () => {
    if(emailFormatValidation() && emailUniquenessValidation(users)) {
      setShowVerification(true);
    }
  }

  const updateEmail = async () => {
    const res = await fetch('/api/test/update/updateUserData', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: sessionUser._id,
        newEmail: document.getElementById('newEmail').value,
      }),
    });
    const data = await res.json();
    console.log(data);
    setSessionUser({...data.updatedUser});
    setEditEmail(false);
    setShowVerification(false);
  }

  return (
    <div className='w-screen h-screen bg-gradient-to-b from-black via-black to-emerald-700 via-75% pt-16'>
      <div className='w-[95vw] max-w-[600px] mx-auto'>
        <div className='bg-black rounded-3xl w-full border-[2px] border-gray-400'>
          <div className='flex items-center justify-left px-10 sm:px-20 bg-gray-900 p-4 rounded-t-3xl'>
            <div className='rounded-full w-[60px] h-[60px] mr-4 relative overflow-hidden flex justify-center items-center' onMouseOver={() => {
              document.getElementById('editPfpBtn').style.opacity = 1;
            }}
            onMouseLeave={() => {
              document.getElementById('editPfpBtn').style.opacity = 0;
            }}
            onClick={() => setEditPfp(true)}>
              <Image
                src={sessionUser.profilePicture || blankPfp}
                width={60}
                height={60} 
                alt='Imagen de perfil'
                unoptimized
                quality={100}
                className='min-w-full min-h-full shrink-0 object-cover'
              />
              <button type='button' id='editPfpBtn' title='Cambiar foto de perfil' className='flex justify-center items-center absolute top-0 left-0 w-[60px] h-[60px] bg-[rgba(0,0,0,.7)] rounded-full backdrop-blur-[5px] transition-all duration-200 opacity-0 cursor-pointer z-30'>
                <FontAwesomeIcon icon={faPencil} className='text-white'/>
              </button>
            </div>
            <h3 className='text-white font-semibold'>{sessionUser.username}</h3>
          </div>
          <div className='mx-5 sm:mx-12 py-5 flex justify-between'>
              <div>
                  <p className='text-xs font-bold'>NOMBRE DE USUARIO</p>
                  <p className=''>{sessionUser.username}</p>
              </div>
              <button type='button' className='px-4 rounded-md bg-gray-600 hover:translate-y-[-5px] hover:shadow-lg hover:shadow-gray-900 font-semibold transition-all duration-200' onClick={() => setEditUsername(true)}>Editar</button>
          </div>
          <div className='mx-5 sm:mx-12 pb-5 flex justify-between'>
              <div className='max-w-[60%]'>
                  <p className='text-xs font-bold'>CORREO ELECTRÓNICO</p>
                  <p className='text-ellipsis overflow-x-hidden w-full'>{sessionUser.email}</p>
              </div>
              <button type='button' className='px-4 rounded-md bg-gray-600 hover:translate-y-[-5px] hover:shadow-lg hover:shadow-gray-900 font-semibold transition-all duration-200' onClick={() => setEditEmail(true)}>Editar</button>
          </div>
        </div>
        <div className='my-6 mx-12'>
          <h3 className='text-lg font-bold mb-2'>Contraseña</h3>
          <button type='button' className='px-4 py-2 rounded-lg bg-emerald-600 text-black font-semibold hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500 transition-all duration-200' onClick={() => setEditPassword(true)}>Cambiar contraseña</button>
        </div>
        <div className='mt-16 mx-12'>
          <h3 className='text-lg font-bold mb-2'>Eliminar cuenta</h3>
          <button type='button' className='px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200' onClick={() => setShowDeleteMessage({ show: true, type: 'cuenta', contentId: sessionUser._id})}>Eliminar</button>
        </div>
      </div>

      {editUsername && (
        <div className='absolute w-screen h-screen top-0 left-0 z-40 bg-[rgba(0,0,0,.8)] backdrop-blur-[2px] transition-all duration-300 flex justify-center items-center'>
          <div className='w-[80vw] max-w-[500px] p-4 rounded-xl bg-gray-900'>
            <h3 className='text-xl font-bold text-center mb-4'>Editar nombre de usuario</h3>
            <p className='text-center'>Introduce tu nuevo nombre de usuario y tu contraseña actual.</p>
            <div className='mt-6 mb-2 sm:mx-6'>
              <label htmlFor='newUsername' className='text-xs font-bold text-left ml-2'>NUEVO NOMBRE DE USUARIO</label>
              <input id='newUsername' type='text' className='w-full bg-gray-600 py-1 rounded-xl text-white px-3 outline-none border-[2px] border-transparent focus:border-emerald-500 transition-all duration-300'></input>
              <p id='usernameError' className='italic text-xs text-red-400 font-semibold opacity-0 transition-all duration-200 text-right select-none'></p>
            </div>
            <div className='mb-6 mt-2 sm:mx-6'>
              <label htmlFor='curPassword' className='text-xs font-bold text-left ml-2'>CONTRASEÑA ACTUAL</label>
              <input id='curPassword' type='password' className='w-full bg-gray-600 py-1 rounded-xl text-white px-3 outline-none border-[2px] border-transparent focus:border-emerald-500 transition-all duration-300'></input>
              <p id='passwordError' className='italic text-xs text-red-400 font-semibold opacity-0 transition-all duration-200 text-right select-none'>Contraseña incorrecta.</p>
            </div>
            <div className='flex justify-end mx-6 mb-4 '>
              <button className='w-[100px] py-2 rounded bg-black hover:shadow-xl hover:shadow-gray-950 transition-all duration-200 hover:translate-y-[-5px]' onClick={() => setEditUsername(false)}>Cancelar</button>
              <button className='w-[100px] py-2 rounded bg-emerald-500 text-black ml-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-600 hover:translate-y-[-5px]' onClick={() => setNewUsername()}>Cambiar</button>
            </div>
          </div>
        </div>
      )}
      {editEmail && (
        <div className='absolute w-screen h-screen top-0 left-0 bg-[rgba(0,0,0,.8)] backdrop-blur-[2px] transition-all duration-300 flex justify-center items-center'>
          <div className='w-[80vw] max-w-[500px] p-4 rounded-xl bg-gray-900'>
            <h3 className='text-xl font-bold text-center mb-4'>Cambiar dirección de correo electrónico</h3>
            <div className='mt-6 mb-2 sm:mx-6'>
              <label htmlFor='newEmail' className='text-xs font-bold text-left ml-2'>NUEVO CORREO</label>
              <input id='newEmail' name='email' type='text' className='w-full bg-gray-600 py-1 rounded-xl text-white px-3 outline-none border-[2px] border-transparent focus:border-emerald-500 transition-all duration-300'></input>
            </div>
            <div className='flex justify-end mt-6 w-full'>
              <button className='w-[100px] py-2 rounded bg-black hover:shadow-xl hover:shadow-gray-950 transition-all duration-200 hover:translate-y-[-5px]' onClick={() => setEditEmail(false)}>Cancelar</button>
              <button className='w-[100px] py-2 rounded bg-emerald-500 text-black ml-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-600 hover:translate-y-[-5px]' onClick={() => setNewEmail()}>Cambiar</button>
            </div>
          </div>
        </div>
      )}
      {editPassword && (
        <div className='absolute w-screen h-screen top-0 left-0 z-40 bg-[rgba(0,0,0,.8)] backdrop-blur-[2px] transition-all duration-300 flex justify-center items-center'>
          <div className='w-[80vw] max-w-[500px] p-4 rounded-xl bg-gray-900'>
            <h3 className='text-xl font-bold text-center mb-4'>Cambiar contraseña</h3>
            <p className='text-center mb-2'>Introduce tu contraseña actual y la contraseña nueva.</p>
            <p className='text-center text-sm font-semibold text-black bg-yellow-600 p-2 rounded-md'><FontAwesomeIcon icon={faPencil} size='lg' className='mr-2'/>Debe tener al menos 8 caracteres, que incluyan como mínimo una letra, un número y un símbolo. No puede contener espacios.</p>
            <div className='mt-6 mb-2 sm:mx-6'>
              <label htmlFor='curPassword' className='text-xs font-bold text-left ml-2'>CONTRASEÑA ACTUAL</label>
              <input id='curPassword' type='password' className='w-full bg-gray-600 py-1 rounded-xl text-white px-3 outline-none border-[2px] border-transparent focus:border-emerald-500 transition-all duration-300'></input>
              <p id='wrongCurPassword' className='italic text-xs text-red-400 font-semibold opacity-0 transition-all duration-200 text-right select-none'>Contraseña actual incorrecta.</p>
            </div>
            <div className='mb-2 mt-2 sm:mx-6'>
              <label htmlFor='newPassword' className='text-xs font-bold text-left ml-2'>NUEVA CONTRASEÑA</label>
              <input id='newPassword' type='password' className='w-full bg-gray-600 py-1 rounded-xl text-white px-3 outline-none border-[2px] border-transparent focus:border-emerald-500 transition-all duration-300'></input>
              <p id='wrongNewPassword' className='italic text-xs text-red-400 font-semibold opacity-0 transition-all duration-200 text-right select-none'>Contraseña no válida.</p>
            </div>
            <div className='mb-6 mt-2 sm:mx-6'>
              <label htmlFor='newPassword' className='text-xs font-bold text-left ml-2'>REPITE LA NUEVA CONTRASEÑA</label>
              <input id='repeatPassword' type='password' className='w-full bg-gray-600 py-1 rounded-xl text-white px-3 outline-none border-[2px] border-transparent focus:border-emerald-500 transition-all duration-300'></input>
              <p id='wrongRepeatPassword' className='italic text-xs text-red-400 font-semibold opacity-0 transition-all duration-200 text-right select-none'>La contraseña no coincide.</p>
            </div>
            <div className='flex justify-end mx-6 mb-4 '>
              <button className='w-[100px] py-2 rounded bg-black hover:shadow-xl hover:shadow-gray-950 transition-all duration-200 hover:translate-y-[-5px]' onClick={() => setEditPassword(false)}>Cancelar</button>
              <button className='w-[100px] py-2 rounded bg-emerald-500 text-black ml-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-600 hover:translate-y-[-5px]' onClick={() => changePassword()}>Cambiar</button>
            </div>
          </div>
        </div>
      )}
      {editPfp && (
        <div className='absolute w-screen h-screen top-0 left-0 z-40 bg-[rgba(0,0,0,.8)] backdrop-blur-[2px] transition-all duration-300 flex justify-center items-center'>
          <div className='w-[300px] sm:w-[420px] p-4 rounded-xl bg-gray-900'>
            <h3 className='text-xl font-bold text-center mb-4'>Cambiar foto de perfil</h3>
            <p className='text-center font-semibold text-sm mb-1'>SUBIR IMAGEN</p>
            <div className='mb-6 w-full flex flex-col justify-center items-center'>
              <Image id='previewImg' alt='Tu imagen' src={''} className='hidden'/>
              <p id='imgName' className='mb-3'></p>

              <label htmlFor='pfpInput' className='cursor-pointer px-4 text-center py-2 rounded-2xl bg-gray-300 shadow-o shadow-gray-950 hover:shadow-gray-400 hover:bg-white transition-all duration-200'><FontAwesomeIcon icon={faArrowUpFromBracket} size='xl' className='text-black'/></label>

              <input id='pfpInput' type='file' accept='image/jpeg, image/png, image/webp' className='hidden' onChange={(e) => {
                const imgShowcase = document.getElementById('previewImg');
                const name = document.getElementById('imgName');
                const file = e.target.files[0];
                if(file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'image/webp') {
                  name.style.color = 'white';
                  const url = URL.createObjectURL(file);
                  imgShowcase.src = url;
                  imgShowcase.style.display = 'block';
                  name.textContent = file.name;
                } else {
                  name.textContent = 'Este archivo no es una imagen válida.';
                  name.style.color = 'red';
                  imgShowcase.style.display = 'none';
                }
              }}></input>
            </div>
            <div className='flex justify-center mx-2 mb-4 '>
              <button className='w-[100px] px-1 py-2 rounded bg-red-500 text-black text-sm font-semibold hover:shadow-xl hover:shadow-red-600 transition-all duration-200 hover:translate-y-[-5px]' onClick={() => {
                setShowDeleteMessage({show: true, type: 'foto de perfil', contentId: sessionUser._id});
                setEditPfp(false);
              }}>Eliminar foto</button>
              <button className='w-[100px] px-1 py-2 rounded bg-black text-white text-sm font-semibold ml-4 transition-all duration-200 hover:shadow-xl hover:shadow-gray-950 hover:translate-y-[-5px]' onClick={() => setEditPfp(false)}>Cancelar</button>
              <button className='w-[100px] px-1 py-2 rounded bg-emerald-500 text-black text-sm font-semibold ml-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-600 hover:translate-y-[-5px]' onClick={() => changePfp()}>Guardar foto</button>
            </div>
          </div>
        </div>
      )}
      {showVerification && <EmailVerification email={document.getElementById('newEmail').value} finishFunction={updateEmail}/>}
      {showDeleteMessage.show && <DeleteMessage/>}
      {!session && <LoginPopup />}
    </div>
  )
}

export default Settings;