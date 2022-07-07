const socket = io()

//Elements
const $messageForm = document.getElementById('msg-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $locationButton = document.getElementById('location');
const $messages = document.getElementById('messages');

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

//Options
const {username, roomname} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //New message elemenet
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages of container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if ((containerHeight - newMessageHeight) <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}
//Socket.io Event Listeners
socket.on('message', (msg) => {
    console.log(msg, username, roomname);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a'),
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
})

socket.on('locationMessage', (location) => {
    console.log(location);
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
})

socket.on('roomData', ({ roomname, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        roomname,
        users
    })
    document.getElementById('sidebar').innerHTML = html;
})

//Form Events
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //Disable button here

    $messageFormButton.setAttribute('disabled', 'disabled');

    const userMsg = e.target.elements.message.value;
    socket.emit('userMessage', userMsg, (error) => {
        //Enable button here
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log('Message Delivered!');
    });
})

$locationButton.addEventListener('click', (e) => {
    e.preventDefault()

    if (!navigator.geolocation) {
        return alert(`Your browser doesn't support Geolocation!`);
    }
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled');
            console.log('Location shared!');
        })
    })
})

socket.emit('join', { username, roomname }, (error) => {
    if (error) {
        alert(error)
        location.href = '/';
    }
});