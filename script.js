// Variabel untuk menyimpan informasi lagu
let songs = [];
let currentSongIndex = 0;
let isPlaying = false; // Menyimpan status pemutaran
let hideTimeout; // Timer untuk menyembunyikan player
let hasPlayed = false; // Untuk mengecek apakah musik sudah pernah dimainkan
let isAutoScrolling = false; // Status untuk auto-scroll

// Audio player elements
const audio = new Audio();
const playPauseButton = document.querySelector('.play-pause');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const progressBar = document.querySelector('.progress-bar');
const timeDisplay = document.querySelector('.time');
const thumbnail = document.querySelector('.thumbnail img');
const audioPlayer = document.querySelector('.audio-player'); // Ambil elemen audio player
const scrollButton = document.getElementById('scrollButton');
let scrollAnimationFrame; // Untuk menyimpan ID animasi scroll

// Fungsi untuk menyembunyikan player
function hideAudioPlayer() {
    audioPlayer.classList.add('hidden'); // Tambahkan kelas hidden
}

// Fungsi untuk menampilkan player
function showAudioPlayer() {
    audioPlayer.classList.remove('hidden'); // Hapus kelas hidden
    resetHideTimeout(); // Reset timer setiap kali player ditampilkan
}

// Fungsi untuk mereset timer untuk menyembunyikan player
function resetHideTimeout() {
    clearTimeout(hideTimeout); // Hentikan timer sebelumnya
    hideTimeout = setTimeout(hideAudioPlayer, 3000); // Setel ulang timer untuk 3 detik
}

// Fungsi untuk memuat data dari song.json
async function loadSongs() {
    try {
        const response = await fetch('song.json');
        const data = await response.json();
        songs = data.songs;
        loadSong(currentSongIndex); // Memuat lagu pertama kali
    } catch (error) {
        console.error('Error loading songs:', error);
    }
}

// Fungsi untuk menampilkan toast
function showToast(song) {
    const toast = document.getElementById('toast');
    const toastThumbnail = document.getElementById('toast-thumbnail');
    const toastAuthor = document.getElementById('toast-author');
    const toastSong = document.getElementById('toast-song');

    toastThumbnail.src = song.image; // Gambar thumbnail
    toastAuthor.textContent = `Singer: ${song.author}`; // Nama penyanyi
    toastSong.textContent = `Title: ${song.title}`; // Judul lagu
    toast.classList.add('visible'); // Tampilkan toast

    // Sembunyikan toast setelah 3 detik
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Fungsi untuk memuat lagu
function loadSong(index) {
    const song = songs[index];
    if (song) {
        audio.src = song.src;
        thumbnail.src = song.image;
        resetHideTimeout(); // Reset timer saat lagu diputar

        // Jika sedang bermain, lanjutkan pemutaran musik
        if (isPlaying) {
            audio.play(); // Lanjutkan pemutaran jika lagu berganti
            showToast(song); // Tampilkan toast hanya jika musik sedang diputar
        }
    }
}

// Fungsi untuk memperbarui waktu
function updateTime() {
    const currentTime = audio.currentTime;
    const duration = audio.duration;

    if (!isNaN(duration)) {
        const minutesCurrent = Math.floor(currentTime / 60);
        const secondsCurrent = Math.floor(currentTime % 60);
        const minutesDuration = Math.floor(duration / 60);
        const secondsDuration = Math.floor(duration % 60);

        timeDisplay.textContent = `${minutesCurrent}:${secondsCurrent < 10 ? '0' : ''}${secondsCurrent} / ${minutesDuration}:${secondsDuration < 10 ? '0' : ''}${secondsDuration}`;
        progressBar.value = (currentTime / duration) * 100;
    }
}

// Fungsi untuk memutar atau menjeda audio
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        playIcon.classList.remove('hidden'); // Tampilkan ikon play
        pauseIcon.classList.add('hidden');   // Sembunyikan ikon pause
    } else {
        audio.play();
        playIcon.classList.add('hidden');    // Sembunyikan ikon play
        pauseIcon.classList.remove('hidden'); // Tampilkan ikon pause
        hasPlayed = true; // Setel bahwa musik sudah dimainkan
        showToast(songs[currentSongIndex]); // Tampilkan toast saat play ditekan
    }
    isPlaying = !isPlaying;
    resetHideTimeout(); // Reset timer saat play/pause ditekan
}

// Fungsi untuk melompat ke lagu sebelumnya
function playPrev() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
}

// Fungsi untuk melompat ke lagu berikutnya
function playNext() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
}

// Fungsi untuk auto-scroll secara perlahan
function smoothAutoScroll() {
    const scrollStep = 10; // Jarak scroll setiap langkah (dalam pixel)
    const delay = 20; // Waktu tunda antar langkah (dalam millisecond)

    function step() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            cancelAnimationFrame(scrollAnimationFrame); // Hentikan ketika mencapai bagian bawah
            isAutoScrolling = false;
            scrollButton.textContent = 'Start Auto Scroll'; // Ubah teks tombol
        } else {
            window.scrollBy(0, scrollStep); // Scroll sedikit demi sedikit
            scrollAnimationFrame = requestAnimationFrame(step);
        }
    }

    if (!isAutoScrolling) {
        isAutoScrolling = true;
        scrollButton.textContent = 'Stop Auto Scroll'; // Ubah teks tombol
        step(); // Mulai animasi
    } else {
        cancelAnimationFrame(scrollAnimationFrame); // Hentikan scroll
        isAutoScrolling = false;
        scrollButton.textContent = 'Start Auto Scroll'; // Ubah teks tombol
    }
}

// Event listeners
playPauseButton.addEventListener('click', togglePlayPause);
prevButton.addEventListener('click', playPrev);
nextButton.addEventListener('click', playNext);

// Update waktu setiap detik
audio.addEventListener('timeupdate', updateTime);

// Mengatur nilai progress bar saat diubah
progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
    resetHideTimeout(); // Reset timer saat progress bar diubah
});

// Mengaktifkan auto-scroll saat tombol ditekan
scrollButton.addEventListener('click', smoothAutoScroll);

// Memuat lagu-lagu saat halaman dimuat
window.addEventListener('load', () => {
    const LOADER_TIMEOUT = 3000; // 3000 ms = 3 detik
    const loader = document.getElementById('loader');

    // Fungsi untuk menyembunyikan loader setelah beberapa detik
    setTimeout(() => {
        loader.classList.add('hidden'); // Sembunyikan loader setelah durasi tertentu
    }, LOADER_TIMEOUT);

    // Setelah lagu dimuat, jika masih dalam durasi loader, loader tetap akan disembunyikan
    loadSongs();
});

// Event listener untuk tap dua kali di layar untuk menampilkan player dan play/pause audio
document.body.addEventListener('dblclick', () => {
    showAudioPlayer(); // Tampilkan player saat layar diketuk dua kali
    togglePlayPause(); // Memutar atau menjeda audio saat layar diketuk dua kali
});

// Mengatur card spread position
cardSpreadPosition.run({
    element: ".card",
    rangeAngle: 20,
    rangeX: 15,
    rangeY: 10,
    randomOrder: true
});
