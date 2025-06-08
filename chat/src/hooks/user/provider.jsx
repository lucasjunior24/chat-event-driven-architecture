import { useEffect, useMemo, useState, useCallback } from 'react';
import { userContext } from './context';
import useChat from 'hooks/chat';
import fetch from 'config/fetchInstance';
import { socket } from 'config/socket';

export const UserProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const { data: chatData } = useChat();

  useEffect(() => {
    socket.connect()
    
    socket.on('new-message', (response) => {
      setData(oldData => {
        return {
          ...oldData,
          chats: oldData.chats.map(chat => {
            if (chat.id !== response.chatId) return chat
            if (!chat.messages) {
              chat.messages = [response.newMessage]
            } else {
              chat.messages.push(response.newMessage)
            }
            chat.unreadMessages += 1
            return chat
          })
        }
      })
    })
    return () => {
      socket.off("new-message")
      socket.disconnect()
    }
  }, [])

  const chatIds = useMemo(() => data?.chats.map(chat => chat.id), [data?.chats])

  useEffect(() => {
    if (chatIds) socket.emit("join-rooms", chatIds)
  }, [chatIds])

  useEffect(() => {
    const currentChatIndex = data?.chats.findIndex(chat => chat.id === chatData?.id);
    if (data?.chats[currentChatIndex]?.unreadMessages > 0) {
      setData(oldData => ({
        ...oldData,
        chats: oldData.chats.map(chat => {
          if (chat.id === chatData?.id) {
            return { ...chat, unreadMessages: 0 }
          }
          return chat;
        })
      }))
      fetch.post(`/api/chats/${chatData?.id}/readMessages`, { id: data.id });
    }
  }, [data?.id, data?.chats, chatData?.id])

    const changeLoggedStatus = useCallback((id, status) => {
      setData(oldData => {
        if (!oldData) return null;
        return {
          ...oldData,
          chats: oldData.chats.map(chat => {
            if (!chat.participants.includes(id)) return chat;
            chat.isLogged = status;
            return chat;
          })
        };
      });
    }, []);


  useEffect(() => {
    if (data?.id) {
      socket.on("new-login", (id) => {
        if (data.id !== id)  {
          changeLoggedStatus(id, true)
        }
      })
      socket.on("user-logoff", (id) => {
        changeLoggedStatus(id, false)
      })
    }
    return () => {
      socket.off("new-login")
      socket.off("user-logoff")
    }
  }, [data?.id, changeLoggedStatus])
  return (
    <userContext.Provider value={{ data, setData }}>
      {children}
    </userContext.Provider>
  );
};
