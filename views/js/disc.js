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
    fetch('http://freequeueio-env.eba-s4vk8zkt.us-west-1.elasticbeanstalk.com/host?delete', requestOptions)
    .then(response => {
        if(response.status == 200){
            document.location.assign('http://freequeueio-env.eba-s4vk8zkt.us-west-1.elasticbeanstalk.com');
        }
    })
    .catch(error => console.log('error', error));
}