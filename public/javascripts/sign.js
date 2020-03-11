console.log(user);
var User    = require("../models/user");
var loginuser = req.user;
var account = User.findById(loginuser._id);

if(!account){
	
}
        
function login() {
    swal({
            title: "請輸入使用者名稱:",
            icon: "info",
            content: "input"
        })
        .then((value) => {
            console.log(value);
            if (value === undefined || value === null) {
                login();
                return false;
            }

            sessionStorage.setItem('account', value);
            account = sessionStorage.getItem('account');
            location.reload();
        });
}

function logout() {
    swal({
        title: "確定要登出?",
        icon: "warning",
        buttons: true
    }).then((e) => {
        if (e) {
            sessionStorage.clear();
            location.reload();
        }
    });
}