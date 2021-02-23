/**
 * @see https://stackoverflow.com/a/58743412/6929317
 */
document.addEventListener("DOMContentLoaded", function(event) { 
    var scrollpos = localStorage.getItem('scrollpos');
    if (scrollpos) window.scrollTo(0, scrollpos);
});
window.onbeforeunload = function(e) {
    localStorage.setItem('scrollpos', window.scrollY);
};
function sendDisconnectRequest(){
    var requestOptions = {
    method: 'POST',
    redirect: 'follow'
    };
    fetch('http://localhost:80/host?delete', requestOptions)
    .then(response => {
        if(response.status == 200){
            document.location.assign('http://localhost:80');
        }
    })
    .catch(error => console.log('error', error));
}