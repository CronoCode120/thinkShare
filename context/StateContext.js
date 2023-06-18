import React, { useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

const Context = createContext();

const StateContext = ({ children }) => {
  const [session, setSession] = useState(false);
  const [sessionUser, setSessionUser] = useState({});
  const [commentEdition, setCommentEdition] = useState(false);
  const [editedCommentId, setEditedCommentId] = useState('');
  const [showDeleteMessage, setShowDeleteMessage] = useState({show: false, type: '', contentId: ''});

  useEffect(() => {
    if(typeof JSON.parse(localStorage.getItem('sessionUser')) === 'object' && JSON.parse(localStorage.getItem('sessionUser')) !== null && JSON.parse(localStorage.getItem('sessionUser')) !== undefined) {
      console.log('valid?')
      try {
        setSessionUser(JSON.parse(localStorage.getItem('sessionUser')));
        setSession(true);
        console.log('Problem here');
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sessionUser', JSON.stringify(sessionUser));
    } catch (error) {
      console.log(error);
    }
  }, [sessionUser]);

  const router = useRouter();
  const refreshData = () => router.replace(router.asPath);
  
  return (
    <Context.Provider value={{
        session,
        setSession,
        sessionUser,
        setSessionUser,
        commentEdition,
        setCommentEdition,
        editedCommentId,
        setEditedCommentId,
        showDeleteMessage,
        setShowDeleteMessage,
        refreshData,
        router
    }}>
      {children}
    </Context.Provider>
  )
}

export default StateContext;

export const useStateContext = () => useContext(Context);