const DATA = [
    { id: 1, title: 'Magma 1', color: '#ff4500', video: 'video/video_01.mp4' },
    { id: 2, title: 'Magma 2', color: '#d35400', video: 'video/video_02.mp4' },
    { id: 3, title: 'Magma 3', color: '#c0392b', video: 'video/video_03.mp4' },
    { id: 4, title: 'Magma 4', color: '#e74c3c', video: 'video/video_04.mp4' },
    { id: 5, title: 'Magma 5', color: '#b03a2e', video: 'video/video_05.mp4' }
];

// Placeholder for actual video assets. 
// Ideally these should be local files in the final offline version.
// For the demo, I will use generated colors/gradients for thumbnails.

const state = {
    currentIndex: 2, // Start in the middle (0-4)
    isPlaying: false,
    activeVideoElement: null,
    animationFrameId: null
};

const carouselEl = document.getElementById('carousel');

function init() {
    renderCarousel();
    updateLayout();
}

function renderCarousel() {
    carouselEl.innerHTML = '';

    DATA.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;

        // Thumbnail (Placeholder Gradient)
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        thumb.style.background = `linear-gradient(135deg, #111, ${item.color})`;

        // Overlay Controls
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        // Play Button
        const playBtn = document.createElement('div');
        playBtn.className = 'play-btn';
        playBtn.innerHTML = '▶'; // Simple Unicode Play

        // Progress Ring Container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <svg class="progress-ring" width="60" height="60">
                <circle class="progress-ring__circle" stroke="white" stroke-width="4" fill="transparent" r="26" cx="30" cy="30"/>
            </svg>
            <div class="replay-icon">↺</div>
        `;

        // Video Element (Hidden initially)
        // Note: For a real offline app, these src attributes must point to local mp4 files
        const video = document.createElement('video');
        video.className = 'hidden-video';
        video.src = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Public test video
        video.playsInline = true;
        // video.muted = true; // Auto-play usually requires mute, but we are click-to-play so sound is OK

        overlay.appendChild(playBtn);
        overlay.appendChild(progressContainer);

        card.appendChild(thumb);
        card.appendChild(overlay);
        card.appendChild(video);

        // Click Interaction
        card.addEventListener('click', () => handleCardClick(index, video));

        carouselEl.appendChild(card);
    });
}

function handleCardClick(index, videoEl) {
    if (state.currentIndex !== index) {
        // Selection Change Logic
        state.currentIndex = index;
        stopCurrentVideo(); // Stop any playing video if switching
        updateLayout();
    } else {
        // Clicked Active Item -> Toggle Play
        toggleVideo(videoEl, index);
    }
}

function updateLayout() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, i) => {
        card.classList.remove('active', 'inactive-left', 'inactive-right');

        if (i === state.currentIndex) {
            card.classList.add('active');
        } else if (i < state.currentIndex) {
            card.classList.add('inactive-left');
        } else {
            card.classList.add('inactive-right');
        }
    });
}

function toggleVideo(video, index) {
    const card = document.querySelectorAll('.card')[index];
    const circle = card.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    if (state.isPlaying && state.activeVideoElement === video) {
        // Pause
        video.pause();
        state.isPlaying = false;
        card.classList.remove('playing');
        cancelAnimationFrame(state.animationFrameId);
    } else {
        // Play
        // If another video was playing, stop it
        if (state.activeVideoElement && state.activeVideoElement !== video) {
            stopCurrentVideo();
        }

        state.activeVideoElement = video;
        state.isPlaying = true;
        card.classList.add('playing');
        card.classList.remove('ended');

        video.play().then(() => {
            // Progress Loop
            const step = () => {
                if (!state.isPlaying) return;
                const progress = video.currentTime / video.duration;
                const offset = circumference - progress * circumference;
                circle.style.strokeDashoffset = offset;

                if (video.ended) {
                    onVideoEnded(card);
                    return;
                }
                state.animationFrameId = requestAnimationFrame(step);
            };
            state.animationFrameId = requestAnimationFrame(step);
        }).catch(e => console.error("Play failed", e));
    }
}

function stopCurrentVideo() {
    if (state.activeVideoElement) {
        state.activeVideoElement.pause();
        state.activeVideoElement.currentTime = 0;
        state.activeVideoElement = null;
    }
    state.isPlaying = false;
    cancelAnimationFrame(state.animationFrameId);

    // Reset UI
    document.querySelectorAll('.card').forEach(c => {
        c.classList.remove('playing', 'ended');
        const circle = c.querySelector('.progress-ring__circle');
        if (circle) circle.style.strokeDashoffset = circle.style.strokeDasharray; // Reset
    });
}

function onVideoEnded(card) {
    state.isPlaying = false;
    state.activeVideoElement = null;
    card.classList.remove('playing');
    card.classList.add('ended');
    cancelAnimationFrame(state.animationFrameId);
}

// Initial Run
init();
