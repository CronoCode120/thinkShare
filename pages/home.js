import React, { useState, useEffect } from 'react';
import { PostComponent, LoginPopup } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStateContext } from '@/context/StateContext';
import connectMongo from '@/utils/connectMongo';
import User from '@/models/userModel';
import Post from '@/models/postModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

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
};

const Home = ({ users, posts }) => {
  const [showNewPost, setShowNewPost] = useState(false);
  const [nowDate, setNowDate] = useState(new Date());
  const { session, sessionUser} = useStateContext();

  const [followedPosts, setFollowedPosts] = useState(false);
  const postsFollowed = posts.filter(post => sessionUser.followed?.includes(post.author));

  const router = useRouter();
  const refreshData = () => router.replace(router.asPath);

  const createPost = async () => {
    const postContent = document.getElementById('post-content');
    if(postContent.value !== '') {
      const curDate = new Date();
      try {
        const res = await fetch('/api/test/add/createPost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: postContent.value,
            date: {
              dateInMs: curDate.getTime(),
              month: curDate.getMonth(),
              year: curDate.getFullYear()
            },
            author: sessionUser._id,
          })
        });
        const data = await res.json();
        console.log(data);
        toggleNewPost();
        refreshData();
      } catch (error) {
        toast.error('No hemos podido enviar tu publicación');
        console.log(error);
      }
    } else {
      postContent.style.boxShadow = '0 0 12px 8px red';
      document.getElementById('emptyPost').style.opacity = 1;
    }
  }

  const toggleNewPost = () => {
    if (!showNewPost) {
      setShowNewPost(true);
      setTimeout(() => {
        const newPost = document.getElementById('newPost');
        const btn = document.getElementById('newPostBtn');
        const icon = document.getElementById('newPostIcon');
        const btnTitle = document.getElementById('btnTitle');
        newPost.style.top = '50%';
        btn.style.bottom = '80%';
        btnTitle.style.opacity = 0;
        icon.style.transform = 'rotate(45deg)';
      }, 200);
    } else if (showNewPost) {
      const newPost = document.getElementById('newPost');
      const btn = document.getElementById('newPostBtn');
      btnTitle.style.opacity = 1;
      const icon = document.getElementById('newPostIcon');
      newPost.style.top = '-80vh';
      btn.style.bottom = '1.25rem';
      icon.style.transform = 'rotate(0deg)';
      setTimeout(() => {
        setShowNewPost(false);
      }, 1100);
    }
  }

  useEffect(() => {
    setInterval(() => {
      setNowDate(new Date());
    }, 1000);
  }, []);

  useEffect(() => {
    const btn = document.getElementById('topBtn');

    if (window.scrollY > 0) {
      btn.style.transform = 'scale(1)';
    } else {
      btn.style.transform = 'scale(0)';
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 0) {
        btn.style.transform = 'scale(1)';
      } else {
        btn.style.transform = 'scale(0)';
      }
    })
  }, []);

  return (
  <div id='main' className='flex flex-col justify-center bg-gradient-to-br from-emerald-900 via-gray-950 via-30% to-black items-center pt-16 w-full'>
    <div className='flex justify-evenly border border-emerald-300 items-center h-[55px] w-[300px] sm:w-[400px] rounded-2xl bg-black shadow-md shadow-black'>
      <p className={followedPosts ? 'border-[2px] border-gray-600 hover:border-emerald-400 rounded-2xl py-2 w-[45%] text-center transition-all duration-200 cursor-pointer' : 'border-[2px] border-emerald-400 bg-emerald-400 text-black font-semibold rounded-2xl py-2 w-[45%] text-center transition-all duration-200 cursor-pointer'} onClick={() => setFollowedPosts(false)}>Todo</p>
      <p id='followedPosts' className={followedPosts ? 'border-[2px] border-emerald-400 bg-emerald-400 text-black font-semibold rounded-2xl py-2 w-[45%] text-center transition-all duration-200 cursor-pointer' : 'border-[2px] border-gray-600 hover:border-emerald-400 rounded-2xl py-2 w-[45%] text-center transition-all duration-200 cursor-pointer'} onClick={() => {
        if(sessionUser.followed?.length) {
          setFollowedPosts(true);
        } else {
          toast.error('Actualmente no sigues a nadie');
        }
      }}>Seguidos</p>
    </div>
    {followedPosts ? postsFollowed.sort((a, b) => (nowDate - a.date.dateInMs) - (nowDate - b.date.dateInMs)).map(post => (
      <PostComponent key={post._id} post={post} nowDate={nowDate} users={users} />
    )) : posts.sort((a, b) => (nowDate - a.date.dateInMs) - (nowDate - b.date.dateInMs)).map(post => (
      <PostComponent key={post._id} post={post} nowDate={nowDate} users={users} />
    ))}
    <div id='newPostBtn' aria-label='Crear publicación' title='Crear publicación' className='flex items-center fixed bottom-5 right-5 transition-all duration-1000'>
      <p id='btnTitle' className='text-lg font-semibold mr-1 transition-all duration-200 p-2 rounded-full bg-emerald-600 backdrop-blur-[10px] max-sm:hidden'>Nueva publicación</p>
      <button type='button' onClick={() => toggleNewPost()} className='rounded-full bg-gradient-to-br from-emerald-600 to-green-400 w-12 h-12 text-center hover:shadow-lg hover:shadow-emerald-900 px-3 overflow-x-hidden'>
        <FontAwesomeIcon id='newPostIcon' icon={faPlus} size='xl' className='transition-all duration-1000 ' />
      </button>
    </div>
    {showNewPost && (
      <div id='newPost' className='h-[75vh] sm:h-[80vh] w-[95vw] sm:w-[80vw] lg:w-[600px] bg-gradient-to-b from-emerald-700 to-green-500 rounded-3xl p-5 sm:p-10 fixed top-[-80vh] sm:left-[42.5%] lg:left-[50%] sm:-translate-x-1/2 -translate-y-[35%] sm:-translate-y-1/2 z-20 shadow-green-500 shadow-2xl transition-all duration-1000'>
        <h1 className='text-xl sm:text-3xl text-center w-full font-bold'>Nueva publicación</h1>
        <div className='h-[60%] w-full sm:mt-10 mb-20 text-center'>
          <label htmlFor='post-content' className='max-sm:text-sm'><span className='font-semibold italic'>{sessionUser.username}</span>, ¿qué quieres compartir?</label>
          <textarea id='post-content' placeholder='Escribe aquí...' className='w-full outline-0 h-[80%] mt-3 rounded-2xl p-2 resize-none bg-slate-900 shadow-inner transition-all duration-200' required onChange={(e) => {
            e.target.style.boxShadow = 'none';
            document.getElementById('emptyPost').style.opacity = 0;
          }}></textarea>
          <p id='emptyPost' className='text-red-900 text-sm font-semibold text-center mt-2 select-none opacity-0 transition-all duration-200'>Tu publicación no puede estar vacía.</p>
        </div>
        <button type='button' className='w-full h-10 bg-emerald-700 rounded-3xl hover:bg-emerald-900 duration-100 active:bg-emerald-400 active:border-2' onClick={() => createPost()}>Publicar</button>
      </div>
    )}
    <Link href={'#main'} id='topBtn' aria-label='Volver al principio' title='Volver al principio' className='fixed bottom-5 left-5 bg-white rounded-full h-[40px] w-[40px] flex justify-center items-center transition-all duration-200 scale-0'>
      <FontAwesomeIcon icon={faArrowUp} size='lg' color='black'/>
    </Link>
    <div className='pt-6 pb-8'><p className='m-0'>Has llegado al final.</p></div>
    {!session && <LoginPopup />}
  </div>
  )
}

export default Home;