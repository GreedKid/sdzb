// 初始化particles.js
particlesJS('particles-js',
{
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#007AFF"
        },
        "shape": {
            "type": "circle"
        },
        "opacity": {
            "value": 0.5,
            "random": false
        },
        "size": {
            "value": 3,
            "random": true
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#007AFF",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 140,
                "line_linked": {
                    "opacity": 1
                }
            },
            "push": {
                "particles_nb": 4
            }
        }
    },
    "retina_detect": true
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 滚动动画
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    section.classList.add('fade-out');
    observer.observe(section);
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(26, 26, 26, 0.98)';
    } else {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
    }
});

// 添加鼠标跟随效果
document.addEventListener('mousemove', (e) => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-trail';
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
    document.body.appendChild(cursor);

    setTimeout(() => {
        cursor.remove();
    }, 1000);
});

// 音乐播放列表
const musicList = [
    'music/周杰伦-你听得到.mp3',
    'music/Free-Wake (Live).mp3',
    'music/Melody (Original Mix).mp3',
    'music/Far Out-Alibi (Far Out Remix).mp3',
    'music/Gavin DeGraw-Fire.mp3',
    'music/Justin Bieber_Quavo-Intentions.mp3',
    'music/Vicetone_Cozi Zuehlsdorff-Nevada(Original Mix).mp3',
    // 添加更多音乐文件路径
];

let currentMusicIndex = 0;
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

// 随机获取音乐
function getRandomMusic() {
    const randomIndex = Math.floor(Math.random() * musicList.length);
    currentMusicIndex = randomIndex;
    return musicList[randomIndex];
}

// 播放下一首
function playNextMusic() {
    const nextMusic = getRandomMusic();
    bgMusic.src = nextMusic;
    bgMusic.play();
    musicToggle.classList.add('playing');
}

// 音乐结束时播放下一首
bgMusic.addEventListener('ended', playNextMusic);

// 音乐控制功能
let lastClickTime = 0;
musicToggle.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300) {  // 双击判定时间为300毫秒
        // 双击事件 - 播放下一首
        e.preventDefault();  // 防止触发单击事件
        playNextMusic();
    } else {
        // 单击事件 - 播放/暂停
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.add('playing');
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        }
    }
    
    lastClickTime = currentTime;
});

// 添加提示信息
const musicTooltip = document.createElement('div');
musicTooltip.className = 'music-tooltip';
musicTooltip.textContent = '双击切换下一首';
musicToggle.parentElement.appendChild(musicTooltip);

// 添加相关CSS样式
const style = document.createElement('style');
style.textContent = `
    .music-tooltip {
        position: absolute;
        bottom: 50px;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        white-space: nowrap;
    }
    
    .music-toggle:hover + .music-tooltip {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// 页面加载时随机选择一首音乐
document.addEventListener('DOMContentLoaded', () => {
    bgMusic.src = getRandomMusic();
    bgMusic.play().catch(() => {
        console.log('等待用户交互后播放音乐');
    });
});

// 用户首次交互时播放音乐
document.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.classList.add('playing');
    }
}, { once: true });

// 添加菜单切换功能
function toggleMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// 点击菜单项时关闭菜单
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// 滚动时关闭菜单
window.addEventListener('scroll', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
}); 