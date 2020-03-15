var User                  = require("../models/user");
let account = User.findById(req.params.id);

if (!account) {
    req.flash("error", "Please loggin!!");
	res.redirect("/");
    } else {
        console.log(account);
		socket = io.connect("https://goorm-ide-test-rrajc.run.goorm.io");

    socket.emit('clients', account); 
	// 歷史訊息
    socket.on('history', (obj) => {
        if (obj.length > 0) {
            appendData(obj);
        }
    });
		socket.on('clients', (obj) => {
        console.log(obj);
        document.querySelector('.online').innerHTML = obj.clients;
        if (obj.user !== undefined) broadcast(obj.user);
    });

    socket.on('message', (obj) => {
        appendData([obj]);
    });
    }

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
        name: account.username,
        msg: msg,
    };
    socket.emit('message', data);
    document.querySelector('input').value = '';
}

/**
 * 卷軸捲動至下
 */
function scrollWindow() {
    let h = document.querySelector('.speeches');
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

        // myself
        //   <div class="speech">
        //     <div class="group">
        //       <div class="avatar">
        //         <img src="./images/user.png">
        //       </div>
        //       <div class="content">
        //         <div class="inline author">Yami Odymel</div>
        //         <div class="text">：嗨！早安。</div>
        //       </div>
        //     <div class=" time"></div>
        //     </div>
        //   </div>

        html +=
            `
            <div class="${element.name == account ? 'right circular group' : 'circular group'}">
                <div class="speech">
                    ${element.name == account? "<div class='group'>":''}
                        <div class="avatar">
                            <img src="${element.name == account ? './uploads/image.jpg' : './uploads/image.jpg'}">
                        </div>
                        <div class="content">
                            <div class="inline author">${element.name == account ? '' : element.name}</div>
                            <div class="text">${element.name == account ? element.msg : '：' + element.msg}</div> 
                        </div>  
                        <div class=" time">${moment(element.time).fromNow()}</div>
                    ${element.name == account? "</div>":''}
                </div>
            </div>
            `;
    });

    el.innerHTML = html.trim();
    scrollWindow();

}