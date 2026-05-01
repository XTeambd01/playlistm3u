const M3U_URL = 'https://private-zone-by-xfireflix.pages.dev/playlist-isp-bdix.m3u';
const video = document.getElementById('mainPlayer');
const playerWrapper = document.getElementById('playerWrapper');

// 1. Fetch Playlist from GitHub
async function fetchPlaylist() {
    try {
        const response = await fetch(M3U_URL);
        const text = await response.text();
        parseM3U(text);
    } catch (err) {
        document.getElementById('channelList').innerHTML = '<div class="loading-spinner">Error loading playlist!</div>';
    }
}

// 2. Parse M3U Data
function parseM3U(data) {
    const lines = data.split('\n');
    const container = document.getElementById('channelList');
    container.innerHTML = ''; 

    let currentChannel = {};

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
            const info = line.split(',');
            currentChannel.name = info[info.length - 1].trim();
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            currentChannel.logo = logoMatch ? logoMatch[1] : 'https://via.placeholder.com/50x35/222/4fc3f7?text=TV';
        } else if (line.startsWith('http')) {
            currentChannel.url = line;
            renderChannel(currentChannel);
            currentChannel = {}; 
        }
    });
}

// 3. Render Channels to UI
function renderChannel(ch) {
    const div = document.createElement('div');
    div.className = 'item channel';
    div.onclick = () => playStream(ch.url);
    div.innerHTML = `
        <div class="logo-container">
            <img class="logo" src="${ch.logo}" onerror="this.src='https://via.placeholder.com/50x35/222/4fc3f7?text=TV'">
        </div>
        <div class="name">${ch.name}</div>
        <div class="badge">LIVE</div>
    `;
    document.getElementById('channelList').appendChild(div);
}

// 4. Play Stream Logic
function playStream(url) {
    playerWrapper.style.display = 'block';
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play();
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// 5. UI Helpers
function updateTime(){
    const d = new Date();
    document.getElementById("time").innerText = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
setInterval(updateTime, 1000); 
updateTime();

function toggleDrawer(){ document.getElementById("drawer").classList.toggle("active"); }

function toggleSearch(){
    const s = document.getElementById("searchBox");
    s.style.display = s.style.display === "block" ? "none" : "block";
}

function filterChannels(val){
    val = val.toLowerCase();
    document.querySelectorAll(".channel").forEach(c => {
        c.style.display = c.innerText.toLowerCase().includes(val) ? "flex" : "none";
    });
}

// Load on start
fetchPlaylist();
