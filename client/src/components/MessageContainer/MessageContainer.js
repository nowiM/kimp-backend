import React, { useState, useEffect } from 'react';
import "./MessageContainer.css";
import { Container } from "@mui/system";

const MessageContainer = ({ messageList }) => {
  const [rgb, setRgb] = useState(null);

  useEffect(() => {
    const randomRgb = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
    setRgb(randomRgb);
  }, []);

  return (
    <div className='messageCotainer'>
      {messageList.map((message, index) => {
        return (
          <Container key={`${message.user.id}-${index}`} className="message-container" style={{ padding: '0 15px' }}>
              <div className="my-message-container">
                <div className="user-name" style={{color: rgb}}>{message.user.name}</div>
                <div className="my-message">{message.chat}</div>
              </div>
          </Container>
        );
      })}
    </div>
  );
};

export default MessageContainer;
