// 初始化particles.js
particlesJS('particles-js', {
    "particles": {
        "number": { "value": 80 },
        "color": { "value": "#007AFF" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5 },
        "size": { "value": 3 },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#007AFF",
            "opacity": 0.4,
            "width": 1
        },
        "move": { "enable": true, "speed": 2 }
    }
});

// 忽略不相关的错误
window.addEventListener('error', function(event) {
    if (event.filename.includes('inpage.js') || 
        event.filename.includes('contentscript.js') ||
        event.filename.includes('index.js') ||
        event.filename.includes('builder.js')) {
        event.preventDefault();
        return false;
    }
});

async function fetchNews() {
    try {
        console.log('开始获取新闻...', new Date().toISOString());
        const newsContainer = document.getElementById('newsContainer');
        newsContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>正在获取最新AI资讯...</p>
                <div class="debug-info"></div>
            </div>
        `;
        
        const debugInfo = newsContainer.querySelector('.debug-info');
        debugInfo.textContent = '正在获取新闻...';
        
        // 直接获取新闻
        const newsUrl = 'https://your-app-name.railway.app/news';
        console.log('获取新闻:', newsUrl);
        
        const response = await fetch(newsUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('新闻响应状态:', response.status);
        
        if (!response.ok) {
            throw new Error(`获取新闻失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('收到数据:', data);
        debugInfo.textContent = '数据获取成功';
        return data;
    } catch (error) {
        console.error('获取新闻失败:', error);
        const debugInfo = document.querySelector('.debug-info');
        if (debugInfo) {
            debugInfo.textContent = `错误: ${error.message}`;
        }
        return FALLBACK_NEWS;
    }
}

// 定义备用新闻数据
const FALLBACK_NEWS = {
    "news": [
        {
            "title": "OpenAI发布GPT-4 Turbo",
            "description": "新版本支持更长上下文、更快推理速度，成本降低90%",
            "url": "https://openai.com/blog/gpt-4-turbo"
        },
        {
            "title": "谷歌推出Gemini模型",
            "description": "多模态AI模型支持文本、图像、音频和视频理解",
            "url": "https://blog.google/technology/ai/gemini"
        }
    ],
    "lastUpdate": new Date().toISOString()
};

function updateNewsDisplay(newsData) {
    const newsContainer = document.getElementById('newsContainer');
    const lastUpdateElement = document.getElementById('lastUpdate');
    
    if (!newsData || !newsData.news) {
        newsContainer.innerHTML = '<div class="error">获取新闻失败，请稍后重试</div>';
        return;
    }

    // 更新时间
    const lastUpdate = new Date(newsData.lastUpdate);
    lastUpdateElement.textContent = lastUpdate.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 显示新闻
    newsContainer.innerHTML = newsData.news.map((item, index) => `
        <div class="news-item">
            <h2><a href="${item.url}" target="_blank">${index + 1}. ${item.title}</a></h2>
            <p>${item.description}</p>
            <div class="news-meta">
                <span class="news-date">${lastUpdate.toLocaleDateString('zh-CN')}</span>
            </div>
        </div>
    `).join('');
}

// 定时更新函数
function scheduleNextUpdate() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    const timeUntilNextUpdate = tomorrow - now;
    setTimeout(async () => {
        const newsData = await fetchNews();
        updateNewsDisplay(newsData);
        scheduleNextUpdate();
    }, timeUntilNextUpdate);
}

// 页面加载时立即获取新闻
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const newsData = await fetchNews();
        updateNewsDisplay(newsData);
        scheduleNextUpdate();
    } catch (error) {
        console.error('页面加载时发生错误:', error);
        updateNewsDisplay(null);
    }
}); 