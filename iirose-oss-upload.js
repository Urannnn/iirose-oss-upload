(function() {
    'use strict';

    const CONFIG = {
        TARGET_KEY: 'file_upload.php',
        NEW_API: 'https://img.scdn.io/api/v1.php',
        CDN_DOMAIN: 'https://anycastimg.scdn.io',
        FORMAT: 'auto',
        ORIGINAL_PREFIX: 'http://r.iirose.com/',
        OSS: {
            ENDPOINT: '',
            ACCESS_KEY: '',
            SECRET_KEY: '',
            BUCKET: '',
            DOMAIN: ''
        },
        MAX_FILE_SIZE: 20971520
    };

    const MODES = ['iirose', 'scdn', 'oss'];
    const modeNames = { iirose: 'iirose', scdn: 'scdn', oss: 'oss' };
    let currentMode = localStorage.getItem('upload_mode') || 'iirose';

    const loadOSSConfig = () => {
        const saved = localStorage.getItem('oss_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                Object.assign(CONFIG.OSS, config);
                console.log('[OSS Config] 已加载配置:', CONFIG.OSS);
            } catch (e) {
                console.error('[OSS Config] 加载配置失败:', e);
            }
        }
    };

    const saveOSSConfig = (config) => {
        localStorage.setItem('oss_config', JSON.stringify(config));
        Object.assign(CONFIG.OSS, config);
        console.log('[OSS Config] 已保存配置:', CONFIG.OSS);
    };

    const showOSSConfigDialog = () => {
        const currentConfig = CONFIG.OSS;
        const defaultText = `${currentConfig.ENDPOINT || ''}
${currentConfig.DOMAIN || ''}
${currentConfig.ACCESS_KEY || ''}
${currentConfig.SECRET_KEY || ''}
${currentConfig.BUCKET || ''}`;
        
        if (typeof Utils !== 'undefined' && Utils.sync) {
            Utils.sync(3, ['请输入OSS配置（每行一个）\n格式：\nENDPOINT\nDOMAIN\nACCESS_KEY\nSECRET_KEY\nBUCKET\n\n当前配置：\n' + defaultText], (input) => {
                if (input && input.trim()) {
                    const lines = input.trim().split('\n').map(line => line.trim());
                    if (lines.length >= 5) {
                        const newConfig = {
                            ENDPOINT: lines[0] || '',
                            DOMAIN: lines[1] || '',
                            ACCESS_KEY: lines[2] || '',
                            SECRET_KEY: lines[3] || '',
                            BUCKET: lines[4] || ''
                        };
                        saveOSSConfig(newConfig);
                        _alert('OSS配置已保存！');
                    } else {
                        _alert('配置格式错误，请按格式输入！');
                    }
                }
            });
        } else {
            console.warn('[OSS Config] Utils.sync 不可用，请手动配置');
        }
    };

    loadOSSConfig();

    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --cap-w: clamp(70px, 11vw, 95px);
            --cap-h: clamp(30px, 4.5vh, 38px);
            --cap-f: clamp(10px, 1.4vw, 12px);
            --cap-visible: 18px; 
        }

        #custom-ui-capsule {
            position: fixed; 
            right: 0;
            bottom: 5%;
            z-index: 99999;
            width: var(--cap-w);             
            height: var(--cap-h);
            background: rgba(255, 255, 255, 0.15); 
            border-radius: 100px 0 0 100px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            cursor: pointer; 
            border: none;
            color: white;
            user-select: none;
            transform: translateX(calc(var(--cap-w) - var(--cap-visible))); 
            transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), background 0.4s;
            backdrop-filter: blur(2px);
        }

        #custom-ui-capsule::after {
            content: '';
            position: absolute;
            top: -6px;
            left: -6px;
            right: -6px;
            bottom: -6px;
            background: transparent;
        }
        
        #custom-ui-capsule:hover { 
            transform: translateX(0);
            background: rgba(0, 0, 0, 0.5);
        }

        #custom-ui-capsule .mode-text {
            font-size: var(--cap-f);
            font-weight: 500;
            letter-spacing: 0.5px;
            white-space: nowrap;
            opacity: 0.2;
            transition: opacity 0.4s;
            width: 100%;
            text-align: center;
            padding-left: 8px;
        }

        #custom-ui-capsule:hover .mode-text { 
            opacity: 0.9; 
            padding-left: 0;
        }

        #custom-ui-capsule-config {
            position: fixed; 
            right: 0;
            bottom: calc(5% + var(--cap-h) + 10px);
            z-index: 99999;
            width: var(--cap-w);             
            height: var(--cap-h);
            background: rgba(0, 150, 255, 0.15); 
            border-radius: 100px 0 0 100px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            cursor: pointer; 
            border: none;
            color: white;
            user-select: none;
            transform: translateX(calc(var(--cap-w) - var(--cap-visible))); 
            transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), background 0.4s;
            backdrop-filter: blur(2px);
        }

        #custom-ui-capsule-config::after {
            content: '';
            position: absolute;
            top: -6px;
            left: -6px;
            right: -6px;
            bottom: -6px;
            background: transparent;
        }
        
        #custom-ui-capsule-config:hover { 
            transform: translateX(0);
            background: rgba(0, 150, 255, 0.5);
        }

        #custom-ui-capsule-config .mode-text {
            font-size: var(--cap-f);
            font-weight: 500;
            letter-spacing: 0.5px;
            white-space: nowrap;
            opacity: 0.3;
            transition: opacity 0.4s;
            width: 100%;
            text-align: center;
            padding-left: 8px;
        }

        #custom-ui-capsule-config:hover .mode-text { 
            opacity: 0.9; 
            padding-left: 0;
        }
    `;
    document.head.appendChild(style);

    const capsule = document.createElement('div');
    capsule.id = 'custom-ui-capsule';
    capsule.innerHTML = `<div class="mode-text">${modeNames[currentMode]}</div>`;
    document.body.appendChild(capsule);

    capsule.onclick = (e) => {
        e.stopPropagation();
        const currentIndex = MODES.indexOf(currentMode);
        currentMode = MODES[(currentIndex + 1) % MODES.length];
        localStorage.setItem('upload_mode', currentMode);
        capsule.querySelector('.mode-text').innerText = modeNames[currentMode];
        updatePrefix();
    };

    const configCapsule = document.createElement('div');
    configCapsule.id = 'custom-ui-capsule-config';
    configCapsule.innerHTML = `<div class="mode-text">set</div>`;
    document.body.appendChild(configCapsule);

    configCapsule.onclick = (e) => {
        e.stopPropagation();
        showOSSConfigDialog();
    };

    const updatePrefix = () => {
        const target = window.Constant || (typeof Constant !== 'undefined' ? Constant : null);
        if (target && target.URL) {
            if (currentMode === 'iirose') {
                target.URL.uploadedPrefixImg = CONFIG.ORIGINAL_PREFIX;
            } else {
                target.URL.uploadedPrefixImg = '';
            }
        }
        console.log('[OSS Upload] 当前模式:', currentMode, '前缀:', target?.URL?.uploadedPrefixImg);
    };
    setInterval(updatePrefix, 2000);
    updatePrefix();

    const hmacSHA256 = async (key, data) => {
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            'raw', 
            typeof key === 'string' ? encoder.encode(key) : key,
            { name: 'HMAC', hash: { name: 'SHA-256' } }, 
            false, 
            ['sign']
        );
        const signature = await crypto.subtle.sign(
            { name: 'HMAC', hash: { name: 'SHA-256' } }, 
            cryptoKey, 
            encoder.encode(data)
        );
        return new Uint8Array(signature);
    };

    const hexEncode = (bytes) => {
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const getFileCategory = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        
        const categories = {
            images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
            docs: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'rtf'],
            archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
            videos: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv'],
            audios: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
            executables: ['exe', 'msi', 'dmg', 'app', 'apk'],
            code: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css', 'json', 'xml', 'yaml', 'yml']
        };
        
        for (const [cat, exts] of Object.entries(categories)) {
            if (exts.includes(ext)) return cat;
        }
        return 'others';
    };

    const uploadToOSS = async (file) => {
        const oss = CONFIG.OSS;
        const timestamp = Date.now();
        const safeName = file.name.replace(/\s+/g, '_');
        const category = getFileCategory(safeName);
        const filename = `${category}/${timestamp}_${safeName}`;
        const service = 's3';
        const algorithm = 'AWS4-HMAC-SHA256';

        const date = new Date();
        const amzDate = date.toISOString().replace(/[:\-]|\.\d+/g, '');
        const dateStamp = amzDate.slice(0, 8);

        console.log('[OSS Upload] 配置:', oss);
        console.log('[OSS Upload] 文件名:', filename);
        console.log('[OSS Upload] AMZ Date:', amzDate);

        const host = new URL(oss.ENDPOINT).host;
        const region = host.replace(/^cos\./, '').replace(/\.(myqcloud|rains3)\.com$/, '');
        const credential = `${oss.ACCESS_KEY}/${dateStamp}/${region}/${service}/aws4_request`;

        const policy = JSON.stringify({
            expiration: new Date(Date.now() + 3600000).toISOString(),
            conditions: [
                { bucket: oss.BUCKET },
                { key: filename },
                ['content-length-range', 0, CONFIG.MAX_FILE_SIZE],
                { 'x-amz-algorithm': algorithm },
                { 'x-amz-credential': credential },
                { 'x-amz-date': amzDate }
            ]
        });
        
        const policyBase64 = btoa(unescape(encodeURIComponent(policy)));
        console.log('[OSS Upload] Policy Base64:', policyBase64);
        
        const kDate = await hmacSHA256(`AWS4${oss.SECRET_KEY}`, dateStamp);
        const kRegion = await hmacSHA256(kDate, region);
        const kService = await hmacSHA256(kRegion, service);
        const kSigning = await hmacSHA256(kService, 'aws4_request');
        const signature = hexEncode(await hmacSHA256(kSigning, policyBase64));
        
        console.log('[OSS Upload] Signature:', signature);
        
        const fd = new FormData();
        fd.append('key', filename);
        fd.append('policy', policyBase64);
        fd.append('x-amz-algorithm', algorithm);
        fd.append('x-amz-credential', credential);
        fd.append('x-amz-date', amzDate);
        fd.append('x-amz-signature', signature);
        fd.append('file', file, file.name);
        
        const uploadUrl = `https://${oss.BUCKET}.${host}`;
        console.log('[OSS Upload] 上传地址:', uploadUrl);
        
        const res = await fetch(uploadUrl, { 
            method: 'POST', 
            body: fd,
            mode: 'cors',
            credentials: 'omit'
        });
        
        console.log('[OSS Upload] 响应状态:', res.status, res.statusText);
        
        if (res.ok) {
            const finalUrl = `${oss.DOMAIN}/${filename}`;
            console.log('[OSS Upload] 上传成功:', finalUrl);
            return finalUrl;
        } else {
            const errorText = await res.text();
            console.error('[OSS Upload] 上传失败:', errorText);
            throw new Error(`上传失败: ${res.status} - ${errorText}`);
        }
    };

    const _open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
        if (typeof url === 'string' && url.includes(CONFIG.TARGET_KEY)) this._isTarget = true;
        return _open.apply(this, arguments);
    };

    const _send = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function(data) {
        const xhr = this;
        if (currentMode === 'scdn' && this._isTarget && data instanceof FormData) {
            const file = data.get('file') || [...data.values()].find(v => v instanceof File);
            const fd = new FormData();
            fd.append('image', file);
            fd.append('outputFormat', CONFIG.FORMAT);
            fd.append('cdn_domain', CONFIG.CDN_DOMAIN);
            fetch(CONFIG.NEW_API, { method: "POST", body: fd, mode: 'cors' })
                .then(res => res.json())
                .then(json => {
                    if (json.success && json.url) {
                        const finalUrl = json.url.includes('#e') ? json.url : json.url + '#e'; 
                        Object.defineProperties(xhr, {
                            readyState: { value: 4, configurable: true },
                            status: { value: 200, configurable: true },
                            responseText: { value: finalUrl, configurable: true },
                            response: { value: finalUrl, configurable: true }
                        });
                        xhr.dispatchEvent(new Event('readystatechange'));
                        xhr.dispatchEvent(new Event('load'));
                        xhr.dispatchEvent(new Event('loadend'));
                    }
                }).catch(() => {});
            return;
        }
        if (currentMode === 'oss' && this._isTarget && data instanceof FormData) {
            const file = data.get('file') || [...data.values()].find(v => v instanceof File);
            uploadToOSS(file).then(url => {
                const finalUrl = url.includes('#e') ? url : url + '#e';
                console.log('[OSS Upload] 返回给页面:', finalUrl);
                Object.defineProperties(xhr, {
                    readyState: { value: 4, configurable: true },
                    status: { value: 200, configurable: true },
                    responseText: { value: finalUrl, configurable: true },
                    response: { value: finalUrl, configurable: true }
                });
                xhr.dispatchEvent(new Event('readystatechange'));
                xhr.dispatchEvent(new Event('load'));
                xhr.dispatchEvent(new Event('loadend'));
            }).catch(err => {
                console.error('[OSS Upload] 降级到原生上传:', err.message);
                _send.apply(xhr, arguments);
            });
            return;
        }
        if (currentMode === 'iirose' && this._isTarget) {
            const originalOnReadyStateChange = xhr.onreadystatechange;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let rawResponse = xhr.responseText;
                    if (rawResponse && !rawResponse.includes('#e')) {
                        const newResponse = rawResponse + '#e';
                        Object.defineProperties(xhr, {
                            responseText: { value: newResponse, configurable: true },
                            response: { value: newResponse, configurable: true }
                        });
                    }
                }
                if (originalOnReadyStateChange) originalOnReadyStateChange.apply(this, arguments);
            };
        }
        return _send.apply(this, arguments);
    };
})();
