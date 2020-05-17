account = { chatid: chat_id, user: user1_id };

socket = io.connect("140.118.9.156:3000");
console.log(account);

socket.emit("login", account);

// Messages history
socket.on("history_" + chat_id, (obj) => {
  if (obj.length > 0) {
    appendData(obj);
  }
});

socket.on("message_" + chat_id, (obj) => {
  appendData([obj]);
});
