import React, { useEffect, useState } from 'react';
import calculatePostTime from '@/utils/calculatePostTime';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faSquarePen } from '@fortawesome/free-solid-svg-icons';
import { useStateContext } from '@/context/StateContext';
import Image from 'next/image';
import Link from 'next/link';
import blankPfp from '../public/blankPfp.jpg'

const Comment = ({com, nowDate, curPost, users }) => {
  const { sessionUser, commentEdition, setCommentEdition, setEditedCommentId, setShowDeleteMessage } = useStateContext();
  const [showCommentOpt, setShowCommentOpt] = useState(false);

  const comCreator = users.find(user => user._id === com.author);


  return (
    <div className='w-[90vw] sm:w-[75vw] lg:w-[50vw] mx-auto py-6 group '>
      <div className='flex justify-between w-full items-center'>
        <div className='flex items-center'>
          <Link href={`/profile/${comCreator._id}`} className='rounded-full w-[40px] h-[40px] flex justify-center items-center mr-4 overflow-hidden'>
            <Image
              src={comCreator.profilePicture || blankPfp}
              width={40}
              height={40}
              unoptimized
              quality={100}
              alt='Foto del autor del comentario'
              className='rounded-full min-w-full min-h-full object-cover'
            />
          </Link>
          <Link href={`/profile/${comCreator._id}`}><p className='font-semibold cursor-pointer'>{comCreator.username}</p></Link>
          {com.author === curPost.author && <span title='Autor/a de la publicación'><FontAwesomeIcon icon={faSquarePen} size='lg' className='text-emerald-500 ml-3' /></span>}
          <p className='ml-4 text-xs sm:text-sm text-gray-400'>{calculatePostTime(com.date, nowDate)}</p>
        </div>
        {sessionUser._id === com.author && (
          <div>
            <FontAwesomeIcon className='text-white cursor-pointer lg:text-transparent lg:group-hover:text-white' icon={faEllipsisVertical} onClick={() => showCommentOpt?setShowCommentOpt(false):setShowCommentOpt(true)}/>
            {showCommentOpt &&
            <div className='absolute max-sm:right-2 lg:right-[25%] bg-gray-950 rounded-xl lg:group-hover:block lg:hidden' onClick={() => {if(showCommentOpt) setShowCommentOpt(false)}}>
              <p className='border rounded-t-xl px-2 py-1 text-sm bg-black hover:bg-gray-800 cursor-pointer select-none' onClick={() => {
                if(!commentEdition) {
                  setCommentEdition(true);
                }
                setEditedCommentId(com.commentId);
              }}>Editar</p>
              <p className='border rounded-b-xl px-2 py-1 text-sm bg-black hover:bg-red-800 hover:text-white cursor-pointer select-none text-red-400' onClick={() => setShowDeleteMessage({show: true, type:'comentario', contentId: {commentId: com.commentId, postId: curPost._id}})}>Borrar</p>
            </div>}
          </div>
        )}
      </div>
      <p className='ml-14 w-fit'>{com.content}</p>
    </div>
  )
}

export default Comment
