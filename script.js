document.addEventListener('DOMContentLoaded', function() {
    // ================== 密码验证部分 ==================
    const passwordContainer = document.getElementById('password-container');
    const mainContainer = document.getElementById('main-container');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    
    // ================== 视频解析部分 ==================
    const videoUrlInput = document.getElementById('video-url');
    const parseBtn = document.getElementById('parse-btn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const videoTitle = document.getElementById('video-title');
    const videoCover = document.getElementById('video-cover');
    const videoSource = document.getElementById('video-source');
    const videoPlayer = document.getElementById('video-player');
    const downloadCover = document.getElementById('download-cover');
    const downloadVideo = document.getElementById('download-video');
    
    // 密码验证功能
    passwordSubmit.addEventListener('click', function() {
        const password = passwordInput.value.trim();
        if (password === '123456') {
            passwordContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            // 保存登录状态到本地存储，有效期1小时
            const expireTime = new Date().getTime() + 60 * 60 * 1000; 
            localStorage.setItem('authExpire', expireTime);
        } else {
            passwordError.textContent = '密码错误，请重试';
            passwordInput.value = '';
        }
    });
    
    // 检查是否已经登录
    function checkAuth() {
        const expireTime = localStorage.getItem('authExpire');
        if (expireTime && new Date().getTime() < parseInt(expireTime)) {
            passwordContainer.style.display = 'none';
            mainContainer.style.display = 'block';
        }
    }
    checkAuth(); // 页面加载时检查登录状态
    
    // ================== 链接解析功能 ==================
    parseBtn.addEventListener('click', function() {
        const inputText = videoUrlInput.value.trim();
        if (!inputText) {
            alert('请输入分享链接');
            return;
        }
        
        // 提取分享链接
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = inputText.match(urlRegex);
        
        if (!matches || matches.length === 0) {
            alert('未找到有效链接，请检查输入');
            return;
        }
        
        const shareUrl = matches[0];
        parseVideo(shareUrl);
    });
    
    // 解析视频函数
    function parseVideo(shareUrl) {
        loading.style.display = 'block';
        result.style.display = 'none';
        
        // API 请求
        const apiKey = '1b12470f678b49f48677e10a2468b436'; 
        const apiUrl = `https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk?ak=${apiKey}&link=${encodeURIComponent(shareUrl)}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                loading.style.display = 'none';
                
                if (data.code === '10000' && data.content && data.content.success) {
                    result.style.display = 'block';
                    
                    // 视频标题
                    videoTitle.textContent = data.content.title || '未知标题';
                    
                    // 视频封面
                    if (data.content.cover) {
                        videoCover.src = data.content.cover;
                        videoCover.style.display = 'block';
                        downloadCover.style.display = 'block';
                    } else {
                        videoCover.style.display = 'none';
                        downloadCover.style.display = 'none';
                    }
                    
                    // 视频源
                    if (data.content.url) {
                        videoSource.src = data.content.url;
                        videoPlayer.load();
                        videoPlayer.style.display = 'block';
                        downloadVideo.style.display = 'block';
                    } else {
                        videoPlayer.style.display = 'none';
                        downloadVideo.style.display = 'none';
                    }
                    
                    // 绑定下载按钮
                    setupDownloadButtons(data.content);
                } else {
                    alert(`解析失败: ${data.msg || '未知错误'}`);
                }
            })
            .catch(error => {
                loading.style.display = 'none';
                alert(`请求出错: ${error.message}`);
                console.error('API请求错误:', error);
            });
    }
    
    // ================== 下载按钮功能 ==================
    function setupDownloadButtons(content) {
        // 下载封面
        downloadCover.onclick = function() {
            if (content.cover) {
                downloadResource(content.cover, `封面_${generateFileName(content.title)}.jpg`);
            }
        };
        
        // 下载视频
        downloadVideo.onclick = function() {
            if (content.url) {
                downloadResource(content.url, `视频_${generateFileName(content.title)}.mp4`);
            }
        };
    }
    
    // 直接 <a> 下载资源（避免 fetch 0 字节问题）
    function downloadResource(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith(".mp4") ? filename : (filename + ".mp4");
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // ================== 工具函数 ==================
    function generateFileName(title) {
        if (!title) return 'download_' + new Date().getTime();
        return title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
    }
    
    // 回车触发密码验证
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordSubmit.click();
        }
    });
    
    // 回车触发视频解析
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            parseBtn.click();
        }
    });
});
