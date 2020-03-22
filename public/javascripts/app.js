

account = {chatid: chat_id, user:user1_id};

socket = io.connect("https://mealink.herokuapp.com/");
console.log(account);

socket.emit('login', account); 

// 歷史訊息
socket.on('history_' + chat_id, (obj) => {
	if (obj.length > 0) {
		appendData(obj);
	}
});

socket.on('message_' + chat_id, (obj) => {
	appendData([obj]);
});


document.querySelector('#btnAddMsg').addEventListener('click', () => {
    sendData();
});
document.querySelector('input').addEventListener('keypress', (e) => {
    if (e.code == 'Enter' || e.code == 'NumpadEnter') {
        sendData();
    }
});

/**
 * 傳送訊息
 */
function sendData() {
    let msg = document.querySelector('input').value;
    if (!msg) {
         req.flash("error", "Please enter what you want to sent!!");
        return;
    }
    let data = {
        name: account._id,
        msg: msg,
    };
    socket.emit('message_' + chat_id, data);
    document.querySelector('input').value = '';
}

/**
 * 卷軸捲動至下
 */
function scrollWindow() {
    let h = document.querySelector('.bubbles');
    h.scrollTo(0, h.scrollHeight);
}

/**
 * 聊天紀錄
 * @param {聊天訊息} obj 
 */
function appendData(obj) {

    let el = document.querySelector('.bubbles');
    let html = el.innerHTML;

    obj.forEach(element => {

        // other peaple
        //   <div class="speech">
        //     <div class="avatar">
        //       <img src="./images/user.png">
        //     </div>
        //     <div class="content">
        //       <div class="inline author">Yami Odymel</div>
        //       <div class="text">：嗨！早安。</div>
        //     </div>
        //     <div class=" time"></div>
        //   </div>
		
		console.log(element);
		
		var name = "user";
	    var pic = "/uploads/image.jpg";//default
		var msg = "：" + element.msg;
		
		if (element.userid == user1_id || element.poster == user1_id)//self
		{
			name = user1_name;
			pic = user1_pic;
		}
		
		if (element.userid == user2_id || element.poster == user2_id)//user 2 sent
		{
			name = user2_name;
			pic = user2_pic;
		}
		

        html +=
            `
            
                <div class="bubbles">
                    <div class="group">
                        <div class="avatar">
                            <img src="${ "../.." + pic}" width="100" height="100">
                        </div>
                        <div class="content">
                            <div class="inline author">${name}</div>
                            <div class="text">${msg}</div> 
                        </div>  
                       
                    </div>
                </div>
            </div>
            `;
    });

    el.innerHTML = html.trim();
    scrollWindow();

}