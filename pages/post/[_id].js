import React, { useState, useEffect } from 'react';
import { Comment, DeleteMessage, LoginPopup } from '@/components';
import User from '@/models/userModel';
import Post from '@/models/postModel';
import connectMongo from '@/utils/connectMongo';
import likePost from '@/utils/likePost';
import calculatePostTime from '@/utils/calculatePostTime';
import Link from 'next/link';
import adjustTextarea from '@/utils/adjustTextarea';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEllipsisVertical, faCircleXmark, faFloppyDisk, faHeart as faSolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots, faHeart } from '@fortawesome/free-regular-svg-icons';
import { useStateContext } from '@/context/StateContext';
import { toast } from 'react-hot-toast';

import blankPfp from '../../public/blankPfp.jpg';

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

const PostPage = ({ users, posts }) => {
  const { sessionUser, commentEdition, setCommentEdition, editedCommentId, setEditedCommentId, showDeleteMessage, setShowDeleteMessage, refreshData, router, session } = useStateContext();
  const postId = router.query._id;
  const curPost = posts.find(post => post._id === postId);
  const author = users.find(user => user._id === curPost.author);
  const [nowDate, setNowDate] = useState(new Date());

  const [likedByUser, setLikedByUser] = useState(false);
  const [likesNum, setLikesNum] = useState(curPost.likes.length);

  useEffect(() => {
    const index = curPost.likes.indexOf(sessionUser._id);
    console.log(sessionUser)
    console.log(curPost.likes)
    console.log(index)
    if(index !== -1) {
      setLikedByUser(true);
      console.log('found')
    } else {
      console.log('not found');
    }
  }, [sessionUser])

  const [showPostOptions, setShowPostOptions] = useState(false);
  const [showPostEdit, setShowPostEdit] = useState(false);
  const [postEditValue, setPostEditValue] = useState(curPost.content);

  const [commentInputValue, setCommentInputValue] = useState('');
  
  useEffect(() => {
    if(commentEdition) {
    const editedComment = curPost.comments.find(com => com.commentId === editedCommentId);
    setCommentInputValue(editedComment.content);
    }
  }, [commentEdition])

  useEffect(() => {
    setInterval(() => {
      setNowDate(new Date());
    }, 1000);
  }, []);

  const postComment = async () => {
    const curDate = new Date();
    toast.loading('Enviando...');
    fetch('/api/test/update/updatePostComments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          content: commentInputValue,
          author: sessionUser._id,
          commentId: uuidv4(),
          date: {
            dateInMs: curDate.getTime(),
            month: curDate.getMonth(),
            year: curDate.getFullYear()
          },
        },
        id: curPost._id
      })
    })
    .then((response) => {
      toast.dismiss();
      response.json().then(data => console.log(data));
      setCommentInputValue('');
    })
    .then(() => {
      refreshData();
    })
  }

  const saveComment = async () => {
    const res = await fetch('/api/test/update/updatePostComments', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          newContent: commentInputValue,
          commentId: editedCommentId,
        },
        id: curPost._id
      })
    });
    const data = await res.json();
    console.log(data);
    setCommentInputValue('');
    setCommentEdition(false);
    setEditedCommentId('');
    refreshData();
  }

  const saveEditedPost = async () => {
    const res = await fetch('/api/test/update/updatePostContent', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: postEditValue,
        id: curPost._id
      })
    });
    const data = await res.json();
    console.log(data);
    setShowPostEdit(false);
    setShowPostOptions(false);
    refreshData();
  }
  
  return (
    <div className='flex flex-col justify-center items-center pt-16 w-full bg-gradient-to-bl from-emerald-900 via-gray-950 via-30% lg:via-40% to-black'>
      <div className='w-[90vw] lg:w-[70vw] rounded-3xl group p-[2px] bg-gradient-to-bl from-green-300 via-emerald-600 to-black'>
        <div className='w-full rounded-3xl p-4 sm:p-7 bg-gray-950'>
          <div className='flex justify-between relative'>
            <div className='flex items-center mb-6'>
              <Link href={`/profile/${curPost.author}`} className='flex justify-center items-center w-[50px] h-[50px] overflow-hidden rounded-full'>
                <Image
                  src={author.profilePicture || blankPfp}
                  alt='Foto del autor'
                  unoptimized
                  quality={100}
                  width={50}
                  height={50}
                  className='rounded-full min-w-full min-h-full object-cover'
                />
              </Link>
              <Link href={`/profile/${curPost.author}`}><h4 className='ml-4 sm:ml-8 font-bold sm:text-xl'>{author.username}</h4></Link>
              <p className='text-xs sm:text-sm ml-6 text-gray-300'>{calculatePostTime(curPost.date, nowDate)}</p>
            </div>
            {sessionUser.username === author.username && <FontAwesomeIcon id='postOptionsBtn' icon={faEllipsisVertical} size='xl' className='cursor-pointer text-white transition-all duration-200' onClick={() => showPostOptions ? setShowPostOptions(false):setShowPostOptions(true)} />}
            {showPostOptions && <div id='postOptions' className='absolute right-6 w-20' onClick={() => setShowPostOptions(false)}>
                <p className='py-1 w-full border rounded-t-xl select-none cursor-pointer hover:bg-gray-800 bg-black text-center' onClick={() => showPostEdit?setShowPostEdit(false):setShowPostEdit(true)}>{showPostEdit?'Cancelar':'Editar'}</p>
                <p className='py-1 w-full border rounded-b-xl select-none cursor-pointer hover:bg-red-800 bg-black text-red-400 hover:text-white text-center' onClick={() => setShowDeleteMessage({ show: true, type: 'publicación', contentId: curPost._id })}>Borrar</p>
              </div>}
          </div>
            {showPostEdit?(
              <div>
                <textarea className='bg-black mb-2 ml-2 border p-2 rounded-2xl w-full h-fit resize-none' id='editedPost' type='text' value={postEditValue} onChange={(e) => {
                  setPostEditValue(e.target.value);
                  adjustTextarea(e.target);
                }}
                onBlur={(e) => {
                  !e.target.value && setPostEditValue(curPost.content);
                }}></textarea>
                <div className='flex mb-4 ml-2'>
                  <button type='button' className='mr-1 p-1 text-black font-semibold rounded-3xl bg-emerald-500 w-full' onClick={() => saveEditedPost()}>Guardar</button>
                  <button type='button' className='ml-1 p-1 text-black font-semibold rounded-3xl bg-red-500 w-full' onClick={() => {
                    setShowPostEdit(false);
                    setShowPostOptions(false);
                  }}>Cancelar</button>
                </div>
              </div>
            ):(
              <p className='mb-4 ml-2 max-sm:text-sm'>{curPost.content}</p>
            )}
          <div className='w-full flex justify-between items-center'>
            <span title={`${likesNum} Me gusta`} className='w-fit h-8 px-2 bg-gray-800 hover:bg-red-400 hover:shadow-lg hover:shadow-red-500 rounded-xl hover:text-black duration-200 flex justify-evenly items-center select-none cursor-pointer mr-4'><FontAwesomeIcon icon={likedByUser ? faSolidHeart : faHeart} size='lg'/> <span className='font-semibold text-lg pl-2'
              onClick={async () => {
                if(likedByUser) {
                  await likePost(curPost._id, sessionUser._id, 'dislike');
                  setLikedByUser(false);
                  setLikesNum(prevVal => prevVal - 1);
                } else {
                  await likePost(curPost._id, sessionUser._id, 'like');
                  setLikedByUser(true);
                  setLikesNum(prevVal => prevVal + 1);
                }
              }}
            >{likesNum}</span></span>
            <span title={`${curPost.comments.length} comentarios`} className='text-gray-300'><FontAwesomeIcon icon={faCommentDots} size='lg' /> {curPost.comments.length}</span>
          </div>
        </div>
      </div>
      <div className='mt-3 mb-20 w-[90vw] lg:w-[60vw]'>
        {curPost.comments.length ? curPost.comments.map((com, index) => (
          <Comment key={postId + String(1 + index)} com={com} nowDate={nowDate} curPost={curPost} users={users} />
        )) : (
          <p className='text-center'>No hay comentarios todavía.</p>
        )}
      </div>
      <div className='fixed bottom-0 w-full h-fit bg-gray-800 rounded-3xl'>
        {commentEdition && editedCommentId && <p className='text-center py-2'><FontAwesomeIcon icon={faCircleXmark} onClick={() => {
          setCommentEdition(false);
          setCommentInputValue('');
          setEditedCommentId('');
        }} className='cursor-pointer'/> Editando comentario</p>}
        <div className='h-fit border-t w-full p-2 sm:p-5 flex items-end justify-evenly rounded-t-3xl bg-black'>
          <textarea id='commentInput' placeholder='Escribe tu comentario...' rows={1} className='w-[80%] sm:w-[86%] rounded-2xl max-sm:text-sm resize-none bg-gray-900 h-fit p-2' onChange={(e) => {
            adjustTextarea(e.target);
            setCommentInputValue(e.target.value);
          }} onFocus={(e) => adjustTextarea(e.target)} onBlur={(e) => e.target.style.height = "40px"} value={commentInputValue}></textarea>
          <button id='sendComment' className='p-2 w-10 h-10 bg-emerald-600 rounded-full hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500 text-gray-200 hover:text-black transition-all duration-300 font-semibold flex justify-center lg:w-[9%] items-center' onClick={() => {
            if(commentInputValue) {
              if(commentEdition) {
                saveComment();
              } else {
                postComment();
              }
            }
          }}>
            <span className='max-lg:hidden flex items-center justify-center text-center'>{commentEdition?'Guardar':'Responder'}</span><span className='lg:hidden'><FontAwesomeIcon icon={commentEdition?faFloppyDisk:faPaperPlane} size='xl' /></span>
          </button>
        </div>
      </div>
      {showDeleteMessage.show && <DeleteMessage/>}
      {!session && <LoginPopup/>}
    </div>
  )
}

export default PostPage;