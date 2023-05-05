document.addEventListener('keydown', function(event) {
    if ((event.keyCode === 8) && (document.activeElement.tagName !== "INPUT") && (document.activeElement.tagName !== "TEXTAREA")) { 
        window.history.back(); 
    }
});