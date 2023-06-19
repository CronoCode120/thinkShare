import React, { useEffect, useState } from 'react';
import connectMongo from '@/utils/connectMongo';
import Post from '@/models/postModel';
import User from '@/models/userModel';
import { useStateContext } from '@/context/StateContext';
import Image from 'next/image';
import Link from 'next/link';
import { DeleteMessage, LoginPopup, PostComponent } from '@/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faHeart, faBook, faGamepad, faUserPen, faUserCheck, faArrowRotateLeft, faFloppyDisk, faPenToSquare, faArrowUpFromBracket, faPencil, faUserPlus, faUserXmark, faXmark, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import adjustTextarea from '@/utils/adjustTextarea';

import blankPfp from '../../public/blankPfp.jpg';
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
}

const cloudinaryURL = 'https://api.cloudinary.com/v1_1/djadxjcn4/image/upload';

const UserPage = ({ users, posts }) => {
  const { router, sessionUser, setSessionUser, session, refreshData, setShowDeleteMessage, showDeleteMessage } = useStateContext();
  const curUserId = router.query._id
  const curUser = users.find(user => user._id === curUserId);
  const userPosts = posts.reverse().filter(post => curUserId === post.author);
  const userFollowers = users.filter(user => curUser.followers.includes(user._id));

  const [follow, setFollow] = useState(false);
  const [followers, setFollowers] = useState(curUser.followers? curUser.followers.length : 0);
  const [showFollowers, setShowFollowers] = useState(false);

  const [nowDate, setNowDate] = useState(new Date());
  useEffect(() => {
    setInterval(() => {
      setNowDate(new Date());
    }, 1000);
  }, []);

  useEffect(() => {
    setDescValue(curUser.description);
    setUserDetails({
      locationValue: curUser.location,
      hobbyValue: curUser.hobby,
      bookValue: curUser.book,
      videogameValue: curUser.videogame
    });
    setFollowers(curUser.followers? curUser.followers.length : 0);
  }, [curUser]);

  const [editMode, setEditMode] = useState(false);
  const [editBanner, setEditBanner] = useState(false);
  const [editPfp, setEditPfp] = useState(false);

  const [descValue, setDescValue] = useState(curUser.description);
  const [userDetails, setUserDetails] = useState({
    locationValue: curUser.location,
    hobbyValue: curUser.hobby,
    bookValue: curUser.book,
    videogameValue: curUser.videogame
  });

  useEffect(() => {
    const userBackground = document.getElementById('userInfo');
    if(curUser.bannerPicture) {
      const bannerUrl = 'url("' + curUser.bannerPicture + '")';
      userBackground.style.backgroundImage = bannerUrl;
      userBackground.style.backgroundSize = "cover";
      userBackground.style.backgroundPosition = "center";
    } else {
      userBackground.style.backgroundImage = '';
    }
  }, [curUser]);

  const updateProfile = async (modifiedData) => {
    let reqBody = {
      userId: sessionUser._id
    };

    if(modifiedData === 'description') {
      reqBody.description = descValue;
    } else if(modifiedData === 'details') {
      reqBody.details = userDetails;
    }

    try {
      const res = await fetch('/api/test/update/updateUserData', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      });
      toast.success('Cambios guardados');
      const data = await res.json();
      refreshData();
      setSessionUser({...data.updatedUser});
    } catch (error) {
      console.log(error);
      toast.error('No se ha podido actualizar tu perfil')
    }
  }

  const updateProfilePicture = async (imageURL) => {
    try {
      const res = await fetch('/api/test/update/updateUserData', {
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
      toast.success('Foto de perfil actualizada')
      const data = await res.json();
      setSessionUser(data.updatedUser);
      setEditPfp(false);
      refreshData();
    } catch (error) {
      console.log(error);
      toast.error('No se ha podido guardar tu foto');
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
      updateProfilePicture(response.secure_url);
    }
  }

  const updateBannerPicture = async (imageURL) => {
    try {
      const res = await fetch('/api/test/update/updateUserData', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageURL,
          type: "banner",
          userId: sessionUser._id
        })
      });
      toast.success('Fondo de perfil actualizado');
      const data = await res.json();
      setEditBanner(false);
      refreshData();
      setSessionUser({...data.updatedUser});
    } catch (error) {
      toast.error('No se ha podido actualizar la imagen');
      console.log(error);
    }
  }

  const changeBanner = async () => {
    const image = document.getElementById('bannerInput').files[0];
    if(image.type === 'image/png' || image.type === 'image/jpeg' || image.type === 'image/gif' || image.type === 'image/webp') {
      const res = await fetch(`/api/test/get-signature/${sessionUser._id}?type=banner`, {method: 'GET'});
      const signature = await res.json();

      const data = new FormData();
      data.append("file", image);
      data.append("api_key", process.env.NEXT_PUBLIC_API_KEY);
      data.append("signature", signature.signature);
      data.append("timestamp", signature.timestamp);
      data.append("public_id", "banner_picture");
      data.append("folder", sessionUser._id);
      const uploadImg = await fetch(cloudinaryURL, {
        method: 'POST',
        body: data
      });
      const response = await uploadImg.json();
      updateBannerPicture(response.secure_url);
    }
  }

  
  useEffect(() => {
    if(curUserId !== sessionUser._id) {
      const index = sessionUser.followed?.indexOf(curUserId);
      console.log(index);
      console.log(sessionUser._id)
      if(index !== -1) {
        setFollow(true);
      } else {
        setFollow(false);
      }
    }
  }, [sessionUser, curUser]);


  async function followUser(action) {
    const res = await fetch('/api/test/update/updateUserData', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        followedUser: curUserId,
        userId: sessionUser._id,
        action: action
      })
    });
    const data = await res.json();
    console.log(data);
    setSessionUser({...data.updatedUser});
  }

  useEffect(() => {
    const btn = document.getElementById('topBtn');

    if (window.scrollY > 0) {
      btn.style.transform = 'scale(1)';
      btn.style.width = '40px';
    } else {
      btn.style.transform = 'scale(0)';
      btn.style.width = '0';
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 0) {
        btn.style.transform = 'scale(1)';
        btn.style.width = '40px';
      } else {
        btn.style.transform = 'scale(0)';
        btn.style.width = '0';
      }
    })
  }, []);

  return (
    <div id='main' className='w-full flex flex-col items-center bg-black bg-black'>
      <div id='userInfo' className='relative w-full lg:w-[80vw] h-fit pt-[80px] mt-14 rounded-xl flex flex-col justify-center items-center bg-gradient-to-b from-emerald-500 to-black bg-center bg-[cover] shadow-inner shadow-black mb-12'>
        {editMode && <span title='Cambiar fondo de perfil'><FontAwesomeIcon icon={faPenToSquare} size='xl' className='absolute top-5 right-5 hover:cursor-pointer bg-black p-2 rounded-xl' onClick={() => setEditBanner(true)}/>
        </span>}
        <button type='button' title='Ver seguidores' className='absolute top-2 sm:top-5 left-2 sm:left-5 bg-black rounded-full px-3 py-1 hover:bg-gray-200 hover:text-black transition-all duration-200'
          onClick={() => setShowFollowers(true)}
        >
          {followers} Seguidores
        </button>
        <div className='flex items-center m-2 p-4 rounded-2xl w-fit h-0 backdrop-blur-[10px] shadow-lg shadow-gray-900 bg-[rgba(255,255,255,.4)] text-black'>
          <div className='rounded-full overflow-hidden flex justify-center items-center absolute -z-20 -top-[230%] left-[50%] translate-x-[-50%] shadow-md shadow-gray-900 w-[80px] h-[80px]' onMouseOver={() => {
              if(sessionUser._id === curUserId) {
                document.getElementById('editPfpBtn').style.opacity = 1;
              }
            }}
            onMouseLeave={() => {
              if(sessionUser._id === curUserId) {
                document.getElementById('editPfpBtn').style.opacity = 0;
              }
            }}
            onClick={() => setEditPfp(true)}>
            <Image
              src={curUser.profilePicture || blankPfp}
              width={80}
              height={80}
              unoptimized
              quality={100}
              className='rounded-full object-cover min-w-full min-h-full'
              alt='Foto de perfil del usuario'
            />
            {sessionUser._id === curUserId && <div id='editPfpBtn' className='flex justify-center items-center absolute w-[81px] h-[81px] bg-[rgba(0,0,0,.7)] rounded-full backdrop-blur-[5px] transition-all duration-200 opacity-0 cursor-pointer z-30'>
              <FontAwesomeIcon icon={faPencil} size='xl' className='text-white'/>
            </div>}
          </div>
          <h3 className='text-xl text-center w-full font-bold'>{curUser.username}</h3>
          <div className='flex items-center fixed p-4 rounded-2xl w-fit h-0 shadow-lg shadow-gray-900 bg-[rgba(0,0,0,.9)] text-white left-[100%] ml-2'>
            {curUser.age}
          </div>
        </div>
        <div className='w-full flex flex-col lg:flex-row justify-center items-center lg:px-10 lg:py-4'>
          <div className='rounded-2xl mb-4 p-4 sm:p-8 w-[280px] sm:w-fit sm:max-w-[80%] overflow-hidden h-fit backdrop-blur-[10px] shadow-lg shadow-gray-900 bg-[rgba(255,255,255,.4)] text-black'>
            <h4 className='font-semibold text-lg mb-4'>Sobre mí</h4>
            {editMode ? (
              <div>
                <textarea maxLength={600} placeholder='Escribe algo sobre ti...' className='bg-black p-2 rounded-2xl w-full h-fit resize-none text-white outline-none max-h-[300px]' value={descValue} onFocus={(e) => adjustTextarea(e.target)} onChange={(e) => {
                  setDescValue(e.target.value);
                  adjustTextarea(e.target);
                }}></textarea>
                <div className='flex items-center justify-center mt-4 mb-8'>
                  <button type='button' className='mr-1 p-1 text-white font-semibold rounded-3xl bg-black w-fit flex items-center justify-between px-2 sm:px-6 hover:bg-gray-800 transition-all duration-200 max-sm:text-sm'
                    onClick={() => setDescValue(curUser.description)}
                  ><FontAwesomeIcon icon={faArrowRotateLeft} className='mr-4'/>Restablecer</button>
                  <button type='button' className='ml-1 p-1 text-black font-semibold rounded-3xl bg-emerald-500 w-fit flex items-center justify-between px-2 sm:px-6 hover:bg-emerald-400 transition-all duration-200 max-sm:text-sm'
                    onClick={() => updateProfile('description')}
                  ><FontAwesomeIcon icon={faFloppyDisk} className='mr-4'/>Guardar</button>
                </div>
                <div className='mt-4'>
                  <label htmlFor='locationInput' className='font-semibold'>¿De dónde eres?</label>
                  <div className='w-full'>
                    <input id='locationInput' className='w-full sm:w-[300px] bg-black rounded-2xl px-2 text-white py-1' type='text' placeholder='Tu ubicación...' maxLength={50} value={userDetails.locationValue} onChange={(e) => setUserDetails(prevDetails => ({...prevDetails, locationValue: e.target.value}))}></input>
                  </div>
                </div>
                <div className='mt-4'>
                  <label htmlFor='hobbyInput' className='font-semibold'>¿Qué hobby/afición tienes?</label>
                  <div className='w-full'>
                    <input id='hobbyInput' className='w-full sm:w-[300px] bg-black rounded-2xl px-2 text-white py-1' type='text' placeholder='Tu afición...' maxLength={50} value={userDetails.hobbyValue} onChange={(e) => setUserDetails(prevDetails => ({...prevDetails, hobbyValue: e.target.value}))}></input>
                  </div>
                </div>
                <div className='mt-4'>
                  <label htmlFor='bookInput' className='font-semibold'>¿Cuál es tu libro favorito?</label>
                  <div className='w-full'>
                    <input id='bookInput' className='w-full sm:w-[300px] bg-black rounded-2xl px-2 text-white py-1' type='text' placeholder='Tu libro favorito...' maxLength={50} value={userDetails.bookValue} onChange={(e) => setUserDetails(prevDetails => ({...prevDetails, bookValue: e.target.value}))}></input>
                  </div>
                </div>
                <div className='mt-4'>
                  <label htmlFor='videogameInput' className='font-semibold'>¿Cuál es tu videojuego favorito?</label>
                  <div className='w-full'>
                    <input id='videogameInput' className='w-full sm:w-[300px] bg-black rounded-2xl px-2 text-white py-1' type='text' placeholder='Tu videojuego favorito...' maxLength={50} value={userDetails.videogameValue} onChange={(e) => setUserDetails(prevDetails => ({...prevDetails, videogameValue: e.target.value}))}></input>
                  </div>
                </div>
                <div className='flex items-center justify-center mt-4'>
                  <button type='button' className='mr-1 p-1 text-white font-semibold rounded-3xl bg-black w-fit flex items-center justify-between px-2 sm:px-6 max-sm:text-sm hover:bg-gray-800 transition-all duration-200'
                    onClick={() => setUserDetails({
                      locationValue: curUser.location,
                      hobbyValue: curUser.hobby,
                      bookValue: curUser.book,
                      videogameValue: curUser.videogame
                    })}
                  ><FontAwesomeIcon icon={faArrowRotateLeft} className='mr-4'/>Restablecer</button>
                  <button type='button' className='ml-1 p-1 text-black font-semibold rounded-3xl bg-emerald-500 w-fit flex items-center justify-between px-2 sm:px-6 max-sm:text-sm hover:bg-emerald-400 transition-all duration-200'
                    onClick={() => updateProfile('details')}
                  ><FontAwesomeIcon icon={faFloppyDisk} className='mr-4'/>Guardar</button>
                </div>
              </div>
            ):(
              <p className='max-h-[300px]'>{curUser.description || <span className='italic'>(Sin descripción)</span>}</p>
            )}
          </div>
          {!editMode && (
            <div className='flex justify-evenly flex-wrap w-full h-full lg:flex-col lg:w-fit lg:pl-10'>
              {curUser.location && <div className='text-black flex items-center p-4 mb-4 h-fit backdrop-blur-[10px] shadow-lg shadow-gray-900 bg-[rgba(255,255,255,.4)] rounded-2xl'>
                <FontAwesomeIcon icon={faLocationDot} size='xl'/>
                <p className='m-0 ml-4 p-0'>{curUser.location}</p>
              </div>}
              {curUser.hobby && <div className='text-black flex items-center p-4 mb-4 h-fit backdrop-blur-[10px] shadow-lg shadow-gray-900 bg-[rgba(255,255,255,.4)] rounded-2xl'>
                <FontAwesomeIcon icon={faHeart} size='xl'/>
                <p className='m-0 ml-4 p-0'>{curUser.hobby}</p>
              </div>}
              {curUser.book && <div className='text-black flex items-center p-4 mb-4 h-fit backdrop-blur-[10px] shadow-lg shadow-gray-900 bg-[rgba(255,255,255,.4)] rounded-2xl'>
                <FontAwesomeIcon icon={faBook} size='xl'/>
                <p className='m-0 ml-4 p-0'>{curUser.book}</p>
              </div>}
              {curUser.videogame && <div className='text-black flex items-center p-4 mb-4 h-fit backdrop-blur-[10px] shadow-lg shadow-gray-900 bg-[rgba(255,255,255,.4)] rounded-2xl'>
                <FontAwesomeIcon icon={faGamepad} size='xl'/>
                <p className='m-0 ml-4 p-0'>{curUser.videogame}</p>
              </div>}
            </div>
          )}
        </div>
      </div>
      <h3 id='userPosts' className='text-3xl text-center font-bold p-2'>Publicaciones</h3>
      <div id='postsContainer' className='w-full flex flex-col items-center relative mb-[120px]'>
        {userPosts?.length > 0 ? userPosts.sort((a, b) => (nowDate - a.date.dateInMs) - (nowDate - b.date.dateInMs)).map(post => (
          <PostComponent key={post._id} post={post} nowDate={nowDate} users={users} />
        )) : (
          <p>Esta persona no ha publicado nada.</p>
        )}
      </div>
      <div className='fixed flex items-center justify-center bottom-2 left-[50%] translate-x-[-50%] transition-all duration-200 w-fit'>
        <Link href={'#main'}><div className='flex justify-evenly items-center py-2 px-4 border border-gray-500 shadow-o shadow-gray-950 rounded-3xl w-[210px] h-[50px] bg-[rgba(0,0,0,.7)] backdrop-blur-[10px] cursor-pointer hover:border-white hover:shadow-xl hover:shadow-gray-600 transition-all duration-200 mr-3'
          onClick={async () => {
            if(sessionUser._id === curUser._id) {
              editMode?setEditMode(false):setEditMode(true);
            } else {
              if(follow) {
                setFollow(false);
                if (curUser.followers.length > 0) {
                  setFollowers(curUser.followers.length - 1);
                } else {
                  setFollowers(0);
                }
                await followUser('unfollow');
              } else {
                setFollow(true);
                if (curUser.followers.length > 0) {
                  setFollowers(curUser.followers.length + 1);
                } else {
                  setFollowers(1);
                }
                await followUser('follow');
              }
            }
          }}>
          {sessionUser._id === curUser._id ? (
            <p className='flex items-center' title='Editar perfil'><FontAwesomeIcon icon={editMode ? faUserCheck : faUserPen} size='2xl' className='text-gray-300 mr-2' /> <span className='text-md text-gray-300'>{editMode ?'Terminar cambios' : 'Editar perfil'}</span></p>
          ) : (
            <p title={follow ? 'Dejar de seguir' : 'Seguir'}><FontAwesomeIcon icon={follow ? faUserXmark : faUserPlus} size='2xl'  className='text-gray-300 mr-2'/> <span className='text-md text-gray-300'>{follow ?'Dejar de seguir' : 'Seguir'}</span></p>
          )}
        </div></Link>

        <Link href={'#main'} id='topBtn' aria-label='Volver al principio' title='Volver al principio' className='bg-white rounded-full h-[40px] w-[40px] flex justify-center items-center transition-all duration-200'>
          <FontAwesomeIcon icon={faArrowUp} size='lg' color='black'/>
        </Link>
      </div>

      {editPfp && (
        <div className='fixed w-screen h-screen top-0 left-0 z-40 bg-[rgba(0,0,0,.8)] backdrop-blur-[2px] transition-all duration-300 flex justify-center items-center'>
        <div className=' w-[300px] sm:w-[420px] p-4 rounded-xl bg-gray-900'>
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
      {editBanner && (
        <div className='fixed w-screen h-screen top-0 left-0 z-40 bg-[rgba(0,0,0,.8)] backdrop-blur-[2px] transition-all duration-300 flex justify-center items-center overflow-auto'>
          <div className='w-[420px] p-4 rounded-xl bg-gray-900 overflow-auto mb-2 mt-20 overscroll-contain'>
            <h3 className='text-xl font-bold text-center mb-4'>Cambiar fondo del perfil</h3>
            <p className='text-center font-semibold text-sm mb-1'>SUBIR IMAGEN</p>
            <div className='mb-6 w-full flex flex-col justify-center items-center'>
              <Image id='previewImg' alt='Tu imagen' src={''} className='hidden'/>
              <p id='imgName' className='mb-3'></p>

              <label htmlFor='bannerInput' className='cursor-pointer px-4 text-center py-2 rounded-2xl bg-gray-300 shadow-o shadow-gray-950 hover:shadow-gray-400 hover:bg-white transition-all duration-200'><FontAwesomeIcon icon={faArrowUpFromBracket} size='xl' className='text-black'/></label>

              <input id='bannerInput' type='file' accept='image/jpeg, image/png, image/webp' className='hidden' onChange={(e) => {
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
                setShowDeleteMessage({show: true, type: 'fondo de perfil', contentId: sessionUser._id});
                setEditBanner(false);
              }}>Eliminar fondo</button>
              <button className='w-[100px] px-1 py-2 rounded bg-black text-white text-sm font-semibold ml-4 transition-all duration-200 hover:shadow-xl hover:shadow-gray-950 hover:translate-y-[-5px]' onClick={() => setEditBanner(false)}>Cancelar</button>
              <button className='w-[100px] px-1 py-2 rounded bg-emerald-500 text-black text-sm font-semibold ml-4 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-600 hover:translate-y-[-5px]' onClick={() => changeBanner()}>Guardar fondo</button>
            </div>
          </div>
        </div>
      )}
      {showFollowers &&
        <div className='fixed w-screen h-screen bg-[rgba(0,0,0,.3)] backdrop-blur-[10px] flex justify-center items-center'>
          <div className='bg-black w-[300px] h-[450px] rounded-3xl relative'>
            <h4 className='text-xl font-semibold w-full text-center py-4 border-b border-gray-600'>Seguidores</h4>
            <button type='button' className='absolute top-5 right-4' onClick={() => setShowFollowers(false)}><FontAwesomeIcon icon={faXmark} size='xl'/></button>
            <div>
              {curUser.followers?.length > 0 ? userFollowers.map(follower => (
                <Link href={`/profile/${follower._id}`} onClick={() => setShowFollowers(false)}>
                  <div className='flex justify-start items-center w-[80%] ml-[30px] py-2 border-b border-gray-500'>
                    <div className='w-[50px] h-[50px] rounded-full flex justify-center items-center overflow-hidden mr-4'>
                      <Image
                        src={follower.profilePicture || blankPfp}
                        width={50}
                        height={50}
                        unoptimized
                        quality={100}
                        className='min-w-full min-h-full object-cover'
                      />
                    </div>
                    <p className='font-semibold'>{follower.username}</p>
                  </div>
                </Link>
              )) : (
                <p className='w-full flex justify-center mt-5 text-gray-300'>Este usuario aún no tiene seguidores.</p>
              )}
            </div>
          </div>
        </div>
      }
      {showDeleteMessage.show && <DeleteMessage/>}
      {!session && <LoginPopup/>}
    </div>
  )
}

export default UserPage;