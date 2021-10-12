export function getCookie(cookieName) {
    let cookieValue = null;
    if(document.cookie){
        const array = document.cookie.split((escape(cookieName)+'='));
        if(array.length >= 2){
            const arraySub=array[1].split(';');
            cookieValue=unescape(arraySub[0]);
        }
    }
    return cookieValue;
}

export function getRequest(url, func) {
    const args = Array.prototype.slice.call(arguments);
    fetch(url)
        .then(res => res.json())
        .then(json => {
            func(json, args.slice(2));
        });
}