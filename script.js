document.addEventListener('DOMContentLoaded', function() {
    // 密码验证部分
    const passwordContainer = document.getElementById('password-container');
    const mainContainer = document.getElementById('main-container');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    
    // 视频解析部分
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
            const expireTime = new Date().getTime() + 60 * 60 * 1000; // 1小时后过期
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
    
    // 页面加载时检查登录状态
    checkAuth();
    
    // 链接解析功能
    parseBtn.addEventListener('click', function() {
        const inputText = videoUrlInput.value.trim();
        if (!inputText) {
            alert('请输入分享链接');
            return;
        }
        
        // 使用正则表达式提取链接
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
        // 显示加载中
        loading.style.display = 'block';
        result.style.display = 'none';
        
        // 构建API请求URL
        // 注意：实际使用时需要替换为你的API密钥
        const apiKey = '1b12470f678b49f48677e10a2468b436'; // 
        const apiUrl = `https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk?ak=${apiKey}&link=${encodeURIComponent(shareUrl)}`;
        
        // 发送API请求
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                loading.style.display = 'none';
                
                if (data.code === '10000' && data.content && data.content.success) {
                    // 解析成功，显示结果
                    result.style.display = 'block';
                    
                    // 填充视频信息
                    videoTitle.textContent = data.content.title || '未知标题';
                    
                    // 设置封面
                    if (data.content.cover) {
                        videoCover.src = data.content.cover;
                        videoCover.style.display = 'block';
                        downloadCover.style.display = 'block';
                    } else {
                        videoCover.style.display = 'none';
                        downloadCover.style.display = 'none';
                    }
                    
                    // 设置视频
                    if (data.content.url) {
                        videoSource.src = data.content.url;
                        videoPlayer.load();
                        videoPlayer.style.display = 'block';
                        downloadVideo.style.display = 'block';
                    } else {
                        videoPlayer.style.display = 'none';
                        downloadVideo.style.display = 'none';
                    }
                    
                    // 设置下载按钮事件
                    setupDownloadButtons(data.content);
                } else {
                    // 解析失败
                    alert(`解析失败: ${data.msg || '未知错误'}`);
                }
            })
            .catch(error => {
                loading.style.display = 'none';
                alert(`请求出错: ${error.message}`);
                console.error('API请求错误:', error);
            });
    }
    
    // 设置下载按钮
    function setupDownloadButtons(content) {
        // 下载封面
        downloadCover.onclick = function(event) {
            if (content.cover) {
                downloadResource(content.cover, `封面_${generateFileName(content.title)}.jpg`, event);
            }
        };
        
        // 下载视频
        downloadVideo.onclick = function(event) {
            if (content.url) {
                downloadResource(content.url, `视频_${generateFileName(content.title)}.mp4`, event);
            }
        };
    }
    
    // 下载资源函数
    function downloadResource(url, filename, event) {
        // 显示加载提示
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '下载中...';
        button.disabled = true;
        
        // 使用fetch获取资源并创建blob URL
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                // 创建blob URL
                const blobUrl = URL.createObjectURL(blob);
                
                // 创建一个隐藏的a标签用于下载
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                
                // 清理
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                    button.textContent = originalText;
                    button.disabled = false;
                }, 100);
            })
            .catch(error => {
                console.error('下载失败:', error);
                alert('下载失败，请重试');
                button.textContent = originalText;
                button.disabled = false;
            });
    }
    
    // 生成文件名（去除特殊字符）
    function generateFileName(title) {
        if (!title) return 'download_' + new Date().getTime();
        // 移除不适合作为文件名的字符
        return title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
    }
    
    // 回车键触发密码验证
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordSubmit.click();
        }
    });
    
    // 回车键触发视频解析
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            parseBtn.click();
        }
    });
});