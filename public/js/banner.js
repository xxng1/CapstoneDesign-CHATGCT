const rotatingTexts = document.querySelectorAll('.rotating-text');
let currentIndex = 0;

function showNextText() {
  rotatingTexts[currentIndex].classList.remove('show-text');
  rotatingTexts[currentIndex].classList.add('hide-text');
  
  currentIndex = (currentIndex + 1) % rotatingTexts.length;
  
  rotatingTexts[currentIndex].classList.remove('hide-text');
  rotatingTexts[currentIndex].classList.add('show-text');
}

showNextText(); 

setInterval(showNextText, 6000); 
