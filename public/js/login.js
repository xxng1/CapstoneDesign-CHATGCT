function login() {
    
    //버튼 변경
    document.getElementById("loginbtn").style.display = "none";
    document.getElementById("logoutbtn").style.display = "inline-block";
    document.getElementById("mypagebtn").style.display = "inline-block";
    document.getElementById("timetablebtn").style.display = "inline-block";
}

function logout() {

    //버튼 변경
    document.getElementById("loginbtn").style.display = "inline-block";
    document.getElementById("logoutbtn").style.display = "none";
    document.getElementById("mypagebtn").style.display = "none";
    document.getElementById("timetablebtn").style.display = "none";
}