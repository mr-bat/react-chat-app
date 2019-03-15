const messageList = [];

export const createMessage = async (message, userId) => {
  const newMessage = {
    _id: null,
    message: message.message,
    author: message.author,
    createdAt: null,
  };
  messageList.push(newMessage);
  return newMessage;
};

export const getMessages = (userId, date) => {
  return messageList;
};

export const removeMessage = (userId, _id) => {
};
