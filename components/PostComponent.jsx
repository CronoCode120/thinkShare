import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import calculatePostTime from '@/utils/calculatePostTime';
import likePost from '@/utils/likePost';
import blankPfp from '../public/blankPfp.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faHeart } from '@fortawesome/free-regular-svg-icons';
import { faChevronRight, faHeart as faSolidHeart } from '@fortawesome/free-solid-svg-icons';

import { useStateContext } from '@/context/StateContext';

const Post = ({users, post, nowDate}) => {
  const [likedByUser, setLikedByUser] = useState(false);
  const [likesNumber, setLikesNumber] = useState(post.likes.length);

  const author = users.find(user => user._id === post.author);

  const { sessionUser } = useStateContext();

  useEffect(() => {
    const index = post.likes.indexOf(sessionUser._id);
    console.log(sessionUser)
    console.log(post.likes)
    console.log(index)
    if(index !== -1) {
      setLikedByUser(true);
      console.log('found')
    } else {
      console.log('not found');
    }
  }, [sessionUser]);

  return (
    <div key={post._id} className='shadow-lg shadow-gray-900 w-[95%] lg:w-[50%] sm:min-w-[400px] lg:min-w-[600px] flex justify-center items-center m-3 rounded-3xl p-[1px] bg-gradient-to-br from-green-300 via-emerald-600 to-black'>
      <div className='bg-gray-950 rounded-3xl p-3 sm:p-5 flex flex-col w-full h-full'>
        <div className='flex justify-start items-center mb-5 w-[100%]'>
          <Link href={`/profile/${author._id}`} className='rounded-full w-[50px] h-[50px] flex justify-center items-center overflow-hidden'>
            <Image
              src={author.profilePicture || blankPfp}
              width={50}
              height={50}
              unoptimized
              quality={100}
              alt='Foto de perfil del autor'
              className='rounded-full min-w-full min-h-full object-cover'
            />
          </Link>
          <Link href={`/profile/${author._id}`}>
            <h4 className='font-bold ml-5'>{author.username}</h4>
          </Link>
          <p className='ml-6 text-xs h-3 text-gray-300'>{calculatePostTime(post.date, nowDate)}</p>
        </div>
        <p className='p-2 text-left ellipsis max-h-[250px]'>{post.content}</p>
        <div className='w-full flex justify-between items-center'>
          <Link href={`/post/${post._id}`}><p className='flex items-center pt-4 text-emerald-200 group max-sm:text-sm'>Ver publicación <FontAwesomeIcon icon={faChevronRight} size='sm' className='pt-1 pl-2 group-hover:translate-x-[15px] transition-all duration-200'/></p></Link>
          <div className='flex justify-end pt-3'>
            <div title='Me gusta' className='w-fit h-8 px-2 bg-gray-800 hover:bg-red-400 hover:shadow-lg hover:shadow-red-500 rounded-xl hover:text-black duration-200 flex justify-evenly items-center select-none cursor-pointer mr-2 sm:mr-4'
              onClick={async () => {
                if(likedByUser) {
                  await likePost(post._id, sessionUser._id, 'dislike');
                  setLikedByUser(false);
                  setLikesNumber(prevVal => prevVal - 1);
                } else {
                  await likePost(post._id, sessionUser._id, 'like');
                  setLikedByUser(true);
                  setLikesNumber(prevVal => prevVal + 1);
                }
              }}>
              <span><FontAwesomeIcon icon={likedByUser ? faSolidHeart : faHeart} size='xl'/></span> <span className='font-semibold pl-2'>{likesNumber}</span>
            </div>
            <Link href={`/post/${post._id}`}><button type='button' title='Comentar publicación' className='w-14 h-8 bg-gray-800 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500 rounded-xl hover:text-black duration-200'>
              <FontAwesomeIcon icon={faCommentDots} size='xl' /> <span className='font-semibold'>{post.comments.length}</span>
            </button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Post;
