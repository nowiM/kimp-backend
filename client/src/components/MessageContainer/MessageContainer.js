import "./MessageContainer.css";
import { Container } from "@mui/system";

const MessageContainer = ({ messageList }) => {
  return (
    <div className='messageCotainer'>
      {messageList.map((message, index) => {
        return (
          <Container key={`${message.user.id}-${index}`} className="message-container">
              <div className="my-message-container">
                <div className="user-name">{message.user.name}</div>
                <div className="my-message">{message.chat}</div>
              </div>
          </Container>
        );
      })}
    </div>
  );
};

export default MessageContainer;
