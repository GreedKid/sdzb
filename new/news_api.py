from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import sys
from datetime import datetime
import pytz
import os
import logging

# 配置日志输出到控制台
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 强制刷新输出
sys.stdout.reconfigure(line_buffering=True)

print("=== 启动服务器 ===", flush=True)

# 创建应用
app = Flask(__name__)

# 获取 Railway 分配的端口
PORT = os.getenv('PORT', 5001)

# 修改 CORS 配置
CORS(app, origins=["web-production-ff115.up.railway.app"])

# API 配置
API_KEY = 'sk-c6a8f65174a34a12839592be8eaae6c1'
API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
CACHE_FILE = 'news_cache.json'

# API 请求头
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def load_cached_news():
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                cache = json.load(f)
                
            # 检查缓存是否是今天的
            cache_date = datetime.fromisoformat(cache['lastUpdate']).date()
            today = datetime.now(pytz.timezone('Asia/Shanghai')).date()
            
            if cache_date == today:
                print("使用今天的缓存数据", flush=True)
                return cache['news']
                
        print("缓存不存在或已过期", flush=True)
        return None
    except Exception as e:
        print(f"读取缓存出错: {str(e)}", flush=True)
        return None

def save_news_cache(news_list):
    try:
        cache = {
            'news': news_list,
            'lastUpdate': datetime.now(pytz.timezone('Asia/Shanghai')).isoformat()
        }
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        print("新闻数据已缓存到本地", flush=True)
    except Exception as e:
        print(f"保存缓存出错: {str(e)}", flush=True)

def generate_ai_news():
    # 先尝试读取缓存
    cached_news = load_cached_news()
    if cached_news:
        return cached_news
        
    try:
        print("开始生成AI新闻...", flush=True)
        
        # 构建请求数据
        data = {
            "model": "deepseek-r1",
            "messages": [
                {
                    "role": "system",
                    "content": """你是一个AI新闻生成器。请生成5条最新的AI技术新闻，每条新闻包含标题和简短描述。
                    要求：
                    1. 必须生成5条新闻，不能少
                    2. 每条新闻必须包含以下公司之一：OpenAI、Google、Meta、Microsoft、特斯拉
                    3. 新闻要真实可信，包含具体的技术细节和数据
                    4. 标题不要带星号
                    5. 描述中要包含数据和百分比
                    6. 按重要性排序
                    
                    格式示例：
                    1. OpenAI发布GPT-5
                    最新版本支持100k上下文，性能提升50%
                    
                    2. Google推出新模型
                    准确率达到95%，速度提升30%
                    
                    （以此类推，直到5条）"""
                },
                {
                    "role": "user",
                    "content": "请严格按照要求生成5条新闻，每条新闻必须对应指定的公司之一"
                }
            ]
        }
        
        # 发送请求
        print("发送API请求...", flush=True)
        response = requests.post(API_URL, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('choices') and result['choices'][0].get('message'):
                content = result['choices'][0]['message'].get('content', '')
                print("AI生成的内容:", content, flush=True)
                
                # 解析生成的内容为新闻格式
                news_list = []
                lines = content.strip().split('\n')
                current_news = {}
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    if line.startswith(('1.', '2.', '3.', '4.', '5.')):
                        if current_news:
                            news_list.append(current_news)
                            current_news = {}
                        title = line[2:].strip()
                        title = title.replace('**', '')
                        current_news['title'] = title
                    elif current_news.get('title'):
                        current_news['description'] = line
                        # 根据新闻内容生成相关链接
                        if 'OpenAI' in current_news['title']:
                            current_news['url'] = 'https://openai.com/blog'
                        elif 'Google' in current_news['title']:
                            current_news['url'] = 'https://blog.google/technology/ai'
                        elif 'Meta' in current_news['title']:
                            current_news['url'] = 'https://ai.meta.com/blog'
                        elif 'Microsoft' in current_news['title']:
                            current_news['url'] = 'https://blogs.microsoft.com/ai'
                        elif '特斯拉' in current_news['title']:
                            current_news['url'] = 'https://www.tesla.com/blog'
                        else:
                            current_news['url'] = 'https://arxiv.org/list/cs.AI/recent'
                
                if current_news:
                    news_list.append(current_news)
                
                # 确保有5条新闻
                if len(news_list) < 5:
                    print("生成的新闻不足5条，使用备用新闻补充", flush=True)
                    news_list.extend(get_fallback_news()[len(news_list):])
                
                # 保存到缓存
                save_news_cache(news_list)
                return news_list
        
        print("生成新闻失败，使用备用新闻", flush=True)
        return get_fallback_news()
        
    except Exception as e:
        print(f"生成新闻出错: {str(e)}", flush=True)
        return get_fallback_news()

def get_fallback_news():
    current_time = datetime.now(pytz.timezone('Asia/Shanghai'))
    return [
        {
            "title": "OpenAI发布GPT-4 Turbo更新",
            "description": "最新版本支持32k上下文窗口，推理速度提升50%，成本降低60%",
            "url": "https://openai.com/blog"
        },
        {
            "title": "Google DeepMind突破多模态理解",
            "description": "Gemini Pro在跨模态理解测试中达到95%准确率，超越人类表现",
            "url": "https://blog.google/technology/ai"
        },
        {
            "title": "Meta开源大规模语言模型",
            "description": "Llama 3系列模型发布，包含7B到70B参数版本，性能超越GPT-3",
            "url": "https://ai.meta.com/blog"
        },
        {
            "title": "Microsoft推出AI编程助手升级版",
            "description": "GitHub Copilot X支持20种编程语言，代码生成准确率提升40%",
            "url": "https://blogs.microsoft.com/ai"
        },
        {
            "title": "特斯拉发布新一代自动驾驶芯片",
            "description": "采用4nm工艺，算力提升3倍，能耗降低50%，支持完全自动驾驶",
            "url": "https://www.tesla.com/blog"
        }
    ]

@app.route('/news')
def news():
    print("\n=== 收到新闻请求 ===", flush=True)
    print(f"请求来源: {request.remote_addr}", flush=True)
    print(f"请求头: {dict(request.headers)}", flush=True)
    
    # 获取新闻（会自动处理缓存）
    news_list = generate_ai_news()
    
    # 构建响应
    news_data = {
        "news": news_list,
        "lastUpdate": datetime.now(pytz.timezone('Asia/Shanghai')).isoformat()
    }
    
    print("返回响应:", json.dumps(news_data, ensure_ascii=False), flush=True)
    return jsonify(news_data)

if __name__ == '__main__':
    print("\n=== 启动新闻服务器 ===", flush=True)
    print(f"当前时间: {datetime.now()}", flush=True)
    print("服务器配置:", flush=True)
    print(f"- 端口: {PORT}", flush=True)
    print("- API: DeepSeek-R1", flush=True)
    print(f"- 缓存文件: {CACHE_FILE}", flush=True)
    
    try:
        app.run(
            host='0.0.0.0',
            port=PORT,
            debug=False
        )
    except Exception as e:
        print(f"启动服务器失败: {e}", flush=True)
        sys.exit(1) 
