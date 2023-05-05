const showPanelBtn = document.getElementById('showPanelBtn');
const hidePanelBtn = document.getElementById('hidePanelBtn');
const panel = document.getElementById('panel');

showPanelBtn.addEventListener('click', function() {
    panel.classList.toggle('show'); /* show 클래스를 토글합니다 */
});

function closePanel() {
    panel.classList.remove('show');
}

hidePanelBtn.addEventListener('click', closePanel);

document.addEventListener('keydown', function(event) {
    if (event.keyCode === 27 && panel.classList.contains('show')) {
        closePanel();
    }
});