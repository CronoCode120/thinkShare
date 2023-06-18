import React from 'react';
import { useStateContext } from '@/context/StateContext';

const DeleteMessage = () => {
  const { showDeleteMessage, setShowDeleteMessage, refreshData, router, setSessionUser } = useStateContext();

  const handleDelete = async () => {
    const res = await fetch('/api/test/delete/deleteContent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentId: showDeleteMessage.contentId,
          type: showDeleteMessage.type
        })
    });
    const data = await res.json();
    console.log(data);
    if(showDeleteMessage.type === 'publicación') {
      router.replace('/home');
    } else if(showDeleteMessage.type === 'foto de perfil') {
      setSessionUser({...data.updatedUser});
    } else {
      refreshData();
    }
    setShowDeleteMessage({show: false, type: '', contentId: ''});
  }

  return (
    <div className='bg-[rgba(0,0,0,.8)] fixed z-50 w-screen h-screen top-0 left-0'>
      <div className='bg-gray-900 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[300px] sm:w-[350px] h-fit p-3 rounded-xl'>
        <h3 className='font-semibold mb-2 mt-1'>Eliminar {showDeleteMessage.type}</h3>
        <p className='mb-5'>{showDeleteMessage.type === 'cuenta' ? 'Si eliminas tu cuenta perderás todos los datos y no podrás recuperarla. ¿Estás seguro/a de que quieres borrar tu cuenta?' : '¿Seguro que quieres eliminar este contenido?'}</p>
        <div className='flex justify-end align-end'>
          <button type='button' className='mr-4 rounded-xl hover:underline' onClick={() => setShowDeleteMessage(prevData => ({ ...prevData, show: false }))}>Cancelar</button>
          <button type='button' className='py-1 px-4 rounded-xl bg-red-800 hover:bg-red-950' onClick={() => handleDelete()}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export default DeleteMessage;