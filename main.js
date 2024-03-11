let player;
let queue = [];
let queueIndex = 0;
var isAnyVideoLoaded = false; // добавьте эту


function fetchVideoTitle(videoId) {
    return fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyDFQPjFsuTBNqjLJpOuhpXzpUAohOo71D4`)
    .then(response => response.json())
    .then(data => data.items[0].snippet.title)
    .catch(error => console.error(error));
}

document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const url = document.getElementById('url').value;
    document.getElementById('url').value = '';
    addToQueue(url);
});

document.getElementById('skip-video').addEventListener('click', function () {
    playNext();
});


function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', { // make this function global
    width: '640',
    height: '390',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// the rest of your main.js file unchanged...

function onPlayerReady(event) {
    if (queue.length > 0) {
        player.loadVideoById(queue[0]);
        player.playVideo();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

async function addToQueue(url) {
    const videoID = extractVideoID(url);
    if (videoID !== null) {
        const title = await fetchVideoTitle(videoID);
        queue.push({id: videoID, title: title});
        updateQueue();
        if (player.getPlayerState() === YT.PlayerState.UNSTARTED || player.getPlayerState() === YT.PlayerState.ENDED || player.getPlayerState() === YT.PlayerState.CUED || queue.length === 1) {
            playNext();
        }
    } else {
        alert("Invalid YouTube video URL. Please try again with a valid URL.");
    }
}

function playNext() {
    if (queue.length > queueIndex) {
        const nextVideo = queue[queueIndex];
        isAnyVideoLoaded = true; // Обновляем, когда загрузили новое видео.
        player.loadVideoById({videoId: nextVideo.id, startSeconds: 0, suggestedQuality: "large"});
        player.playVideo();
        queueIndex++;
        updateQueue(); // Обновляем очередь, чтобы выделить текущее видео.
    } else if (isAnyVideoLoaded) {
        player.stopVideo();
        isAnyVideoLoaded = false;  // Сбрасываем состояние, если видео в очереди закончились.
        queueIndex = 0; // Сбрасываем индекс очереди, если закончились видео.
    }
}

function initPlayer(videoID) {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoID,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function updateQueue() {
    const queueElement = document.getElementById('queue');
    queueElement.innerHTML = '';
    queue.forEach((video, index) => {
        const item = document.createElement('p');
        item.textContent = `${index + 1}. ${video.title}`;
        item.classList.add('queue-item');
        if (index === queueIndex - 1) { // Потому что увеличиваем queueIndex сразу после воспроизведения.
            item.classList.add('currently-playing');
        }
        queueElement.appendChild(item);
    });
}


function extractVideoID(url) {
    const videoID = new URL(url).searchParams.get('v');
    return videoID;
}