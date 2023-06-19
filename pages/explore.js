import React, { useEffect, useState } from 'react';
import connectMongo from '@/utils/connectMongo';
import User from '@/models/userModel';
import Post from '@/models/postModel';
import Image from 'next/image';
import Link from 'next/link';
import { LoginPopup } from '@/components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faArrowRotateLeft, faUser, faCircleArrowDown, faDice } from '@fortawesome/free-solid-svg-icons';

import blankPfp from '../public/blankPfp.jpg';
import { useStateContext } from '@/context/StateContext';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';

export const getServerSideProps = async () => {
  try {
    console.log('Connecting to Mongo');
    await connectMongo();
    console.log('Connected to mongo');

    console.log('Fetching documents');
    const users = await User.find();
    const posts = await Post.find();
    console.log('Fetched documents');

    return {
      props: {
        users: JSON.parse(JSON.stringify(users)),
        posts: JSON.parse(JSON.stringify(posts))
      }
    };
  } catch (error) {
    console.log(error);
  };
}

const ExplorePage = ({ users, posts }) => {
  const { session } = useStateContext();
  
  const [postsArray, setPostsArray] = useState(posts);
  const [index, setIndex] = useState(0);
  
  const [scrollTip, setScrollTip] = useState(false);
  
  const generateRandomArray = () => {
    const newArray = [...posts];
    for(let i = newArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = newArray[i];
      newArray[i] = newArray[j];
      newArray[j] = temp;
    }
    setPostsArray(newArray);
  }
  
  useEffect(() => {
    generateRandomArray();
  }, []);

  const nextPost = () => {
    const card = document.getElementById('post');
    card.style.left = '-100%';
    card.style.transform = 'scale(0)';
    setTimeout(() => {
      card.style.opacity = 0;
      card.style.left = '150%';
      card.style.transform = 'scale(0)';
      if(index >= postsArray.length - 1) {
        generateRandomArray();
        setIndex(0);
      } else {
        setIndex(prevIndex => prevIndex + 1);
      }
      setTimeout(() => {
      card.style.opacity = 1;
      card.style.left = '0';
      card.style.transform = 'scale(1)';
      }, 400);
    }, 500);
  }
  
  const curPost = postsArray[index];
  const curAuthor = users.find(user => curPost.author === user._id);

  useEffect(() => {
    const text = document.getElementById('postContent');
    if(checkOverflow(text)) {
      setScrollTip(true);
    } else {
      setScrollTip(false);
    }
  }, [curPost]);

  const checkOverflow = ({ clientHeight, scrollHeight}) => {
    console.log(scrollHeight, clientHeight);
    return scrollHeight > clientHeight;
  }

  return (
    <div className='h-screen pt-16 bg-black flex flex-col justify-center items-center overflow-hidden'>
      <div id='post' className='border-[2px] border-emerald-500 bg-gradient-to-br from-gray-800 via-gray-950 to-black w-[45vh] h-[65vh] rounded-2xl relative left-[0] transition-cardTransition duration-[1000ms] flex justify-center items-center shadow-md shadow-teal-600'>
        <Link href={`/profile/${curAuthor._id}`} className='rounded-full absolute w-[65px] h-[65px] flex justify-center items-center overflow-hidden top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] shadow-lg shadow-teal-600 z-20'>
            <Image
              src={curAuthor.profilePicture || blankPfp}
              alt='Foto del autor/a'
              width={65}
              height={65}
              className='rounded-full min-h-full min-w-full object-cover'
            />
        </Link>
        <div id='postContent' className='max-w-full max-h-[50vh] font-semibold px-8 my-[40px] flex justify-center items-center h-full overflow-y-auto scrollbar-hidden text-ellipsis text-justify flex-wrap' onScroll={() => {
          if(scrollTip) {
            const arrow = document.getElementById('scrollArrow');
            arrow.style.opacity = 0;
            setTimeout(() => {
              setScrollTip(false);
            }, 1000);
          }
        }}>
          <p className='text-md'><span className='text-2xl text-emerald-400 pr-1 w-full'>"</span>{curPost.content}<span className='text-2xl text-emerald-400 pl-1'>"</span></p>
        </div>
        {scrollTip && <div id='scrollArrow' className='absolute bottom-3 left-1/2 translate-x-[-50%]'>
          <FontAwesomeIcon icon={faCircleArrowDown} size='2xl' className='opacity-1 select-none animate-bounce transition-all duration-300'/>
        </div>}
      </div>
      <div className='flex justify-evenly items-center w-[350px] mt-10'>
        <span aria-label='Publicación aleatoria' title='Publicación aleatoria' className='border-[2px] rounded-full hover:cursor-pointer hover:text-red-400 hover:border-red-500 hover:drop-shadow-[0_0_4px_rgb(255,0,0)] transition-all duration-200 w-12 h-12 flex justify-center items-center' onClick={() => nextPost()}>
          <FontAwesomeIcon icon={faDice} size='xl'/>
        </span>
        <Link href={`/profile/${curAuthor._id}`} aria-label='Ver perfil del autor' title='Ver perfil del autor' className='border-[2px] rounded-full w-12 h-12 hover:cursor-pointer hover:text-emerald-400 hover:border-emerald-500 hover:drop-shadow-[0_0_4px_rgb(16,185,129)] transition-all duration-200 flex justify-center items-center'>
          <FontAwesomeIcon icon={faUser} size='xl'/>
        </Link>
        <Link href={`/post/${curPost._id}`} aria-label='Comentar' title='Comentar' className='border-[2px] rounded-full hover:cursor-pointer hover:text-emerald-400 hover:border-emerald-500 hover:drop-shadow-[0_0_4px_rgb(16,185,129)] transition-all duration-200 h-12 w-12 flex justify-center items-center'>
          <FontAwesomeIcon icon={faCommentDots} size='xl'/>
        </Link>
      </div>
      {!session && <LoginPopup />}
    </div>
  )
}

export default ExplorePage;
