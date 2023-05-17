var images = [
    "./images/무한이1.png",
    "./images/무한이2.png",
    "./images/무한이3.png",
    "./images/무한이4.png",
    "./images/무한이5.png",
    // 원하는 이미지들의 경로를 배열로 나열해줍니다.
];

// 랜덤한 이미지 선택
var randomIndex = Math.floor(Math.random() * images.length);
var randomImage = images[randomIndex];

// 선택한 이미지를 화면에 표시
var imgElement = document.getElementById("randomImage");
imgElement.src = randomImage;