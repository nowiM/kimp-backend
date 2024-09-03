import React, {useState, useEffect} from 'react';
import "./App.css";
import socket from './server.js';
import InputField from './components/InputField/InputField';
import MessageContainer from './components/MessageContainer/MessageContainer';

function App() {
  const userNameArray = [
    '리또속', '육봉대사', '초수1058', '고수양다', '도사기생폭군', 
    '34살짭백', '블러', '평민1120', '리플1058', '양민45', 
    '비트양부인', '이더부인', '이클임', '아이유', '카리나',
    '윈터', '궁예', '오통통면', '너구리', '파월'
  ]
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessageList((prevState) => prevState.concat(message));
    });
    askUserName();
  }, []);

  const askUserName = () => {
    const userName = userNameArray[Math.floor(Math.random() * userNameArray.length - 1)];

    // emit(대화의 제목, 보낼내용, 콜백함수)
    socket.emit('login', userName, (res) =>{
      if(res?.ok) {
        setUser(res.data);
      }
    });
  }

  const sendMessage = (event) => {
    event.preventDefault(); 
    
    socket.emit('sendMessage', message, (res) => {
      if(!res.ok) {
        console.log('sendMessage res', res);
      }
    });

    // 메세지 전송 input필드 value 값을 공백으로 처리
    setMessage(''); 
  }
  return (
    <div>
      <div className="App">
        <MessageContainer messageList={messageList} user={user}/>
        <InputField message={message} setMessage={setMessage} sendMessage={sendMessage}/>
      </div>
    </div>
  );
}

export default App;
