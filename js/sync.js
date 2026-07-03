// ============ GitHub Gist 云同步 ============

const GIST_ID = 'c97f59f4aac76319bec8b43dc4b0283a';
const GIST_RAW = `https://gist.githubusercontent.com/shironglian85/${GIST_ID}/raw/blog-data.json`;
const GIST_API = `https://api.github.com/gists/${GIST_ID}`;

function hasToken() { return !!localStorage.getItem('gh-token'); }

function saveToken() {
    const val = document.getElementById('tokenInput').value.trim();
    if (!val) { alert('请粘贴 GitHub Token！'); return; }
    localStorage.setItem('gh-token', val);
    document.getElementById('tokenArea').style.display = 'none';
    document.getElementById('syncStatus').textContent = '✅ 云同步已启用';
    cloudUpload();
}

function manualSync() {
    if (!hasToken()) {
        document.getElementById('tokenArea').style.display = '';
        document.getElementById('syncStatus').textContent = '⚠️ 需要 GitHub Token 才能同步';
        return;
    }
    document.getElementById('syncStatus').textContent = '⏳ 同步中…';
    cloudUpload().then(ok => {
        document.getElementById('syncStatus').textContent = ok ? '✅ 同步成功 ' + new Date().toLocaleTimeString() : '❌ 同步失败';
    });
}

// 页面加载时检查 token
function updateSyncUI() {
    if (hasToken()) {
        document.getElementById('tokenArea').style.display = 'none';
        document.getElementById('syncStatus').textContent = '✅ 云同步就绪';
    } else {
        document.getElementById('tokenArea').style.display = '';
        document.getElementById('syncStatus').textContent = '💡 请粘贴 Token 以启用云同步';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSyncUI);
} else {
    updateSyncUI();
}

// 读写 Gist
async function cloudRead() {
    try {
        const res = await fetch(GIST_RAW + '?t=' + Date.now());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } catch(e) {
        console.warn('云端读取失败:', e.message);
        return null;
    }
}

async function cloudWrite(data) {
    const token = localStorage.getItem('gh-token');
    if (!token) return false;
    try {
        const res = await fetch(GIST_API, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files: { 'blog-data.json': { content: JSON.stringify(data) } }
            })
        });
        return res.ok;
    } catch(e) {
        console.warn('云端写入失败:', e.message);
        return false;
    }
}

// 初始化：从云端加载数据（云端有数据才覆盖本地）
async function cloudInit() {
    const cloud = await cloudRead();
    if (!cloud) return false;

    let updated = false;
    // 只在云端数据非空时才覆盖本地
    if (cloud.posts && cloud.posts.length > 0) {
        localStorage.setItem('blog-user-posts', JSON.stringify(cloud.posts));
        updated = true;
    }
    if (cloud.categories && cloud.categories.length > 0) {
        localStorage.setItem('blog-categories', JSON.stringify(cloud.categories));
        updated = true;
    }
    if (cloud.photos && cloud.photos.length > 0) {
        localStorage.setItem('blog-photos', JSON.stringify(cloud.photos));
        updated = true;
    }
    if (cloud.photoCategories && cloud.photoCategories.length > 0) {
        localStorage.setItem('photo-categories', JSON.stringify(cloud.photoCategories));
        updated = true;
    }
    if (cloud.palette) localStorage.setItem('blog-palette', cloud.palette);
    if (cloud.mode) localStorage.setItem('blog-mode', cloud.mode);
    if (cloud.phrases && cloud.phrases.length > 0) {
        localStorage.setItem('blog-phrases', JSON.stringify(cloud.phrases));
    }
    return updated;
}

// 上传本地数据到云端
async function cloudUpload() {
    const data = {
        posts: JSON.parse(localStorage.getItem('blog-user-posts') || '[]'),
        categories: JSON.parse(localStorage.getItem('blog-categories') || '[]'),
        photos: JSON.parse(localStorage.getItem('blog-photos') || '[]'),
        photoCategories: JSON.parse(localStorage.getItem('photo-categories') || '[]'),
        palette: localStorage.getItem('blog-palette') || 'sunset',
        mode: localStorage.getItem('blog-mode') || 'dark',
        phrases: JSON.parse(localStorage.getItem('blog-phrases') || '[]'),
    };
    const ok = await cloudWrite(data);
    return ok;
}

// 数据变更后自动同步（防抖，仅当有 token 时）
let syncTimer = null;
function autoSync() {
    if (!hasToken()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => cloudUpload(), 1500);
}

// 关闭页面前强制同步
window.addEventListener('beforeunload', () => {
    if (!hasToken()) return;
    // 同步请求（用 sendBeacon 或同步 XHR）
    const data = {
        posts: JSON.parse(localStorage.getItem('blog-user-posts') || '[]'),
        categories: JSON.parse(localStorage.getItem('blog-categories') || '[]'),
        photos: JSON.parse(localStorage.getItem('blog-photos') || '[]'),
        photoCategories: JSON.parse(localStorage.getItem('photo-categories') || '[]'),
        palette: localStorage.getItem('blog-palette') || 'sunset',
        mode: localStorage.getItem('blog-mode') || 'dark',
        phrases: JSON.parse(localStorage.getItem('blog-phrases') || '[]'),
    };
    const token = localStorage.getItem('gh-token');
    if (!token) return;
    navigator.sendBeacon(GIST_API, JSON.stringify({
        files: { 'blog-data.json': { content: JSON.stringify(data) } }
    }));
    // sendBeacon 不支持自定义 header，所以用 fetch with keepalive
    fetch(GIST_API, {
        method: 'PATCH',
        keepalive: true,
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            files: { 'blog-data.json': { content: JSON.stringify(data) } }
        })
    });
});
