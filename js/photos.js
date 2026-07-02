// ============ 照片墙模块 ============

        // ============ 照片墙 ============
        const photoKey = 'blog-photos';

        // 照片专用分类
        const defaultPhotoCategories = [
            { key: 'scenery', name: '风景', emoji: '🏞️' },
            { key: 'portrait', name: '人像', emoji: '👤' },
            { key: 'food', name: '美食', emoji: '🍜' },
            { key: 'daily', name: '日常', emoji: '📱' }
        ];

        function loadPhotoCategories() {
            const saved = localStorage.getItem('photo-categories');
            if (saved) return JSON.parse(saved);
            localStorage.setItem('photo-categories', JSON.stringify(defaultPhotoCategories));
            return [...defaultPhotoCategories];
        }
        function savePhotoCategories(arr) {
            localStorage.setItem('photo-categories', JSON.stringify(arr));
        }

        let photoCategories = loadPhotoCategories();

        let photoActiveTag = null;
        let photoActiveCategory = 'all';

        function loadPhotos() {
            const saved = localStorage.getItem(photoKey);
            return saved ? JSON.parse(saved) : [];
        }
        function savePhotos(arr) { localStorage.setItem(photoKey, JSON.stringify(arr)); }

        function getAllPhotoTags() {
            return [...new Set(loadPhotos().flatMap(p => p.tags || []))];
        }

        function renderPhotos() {
            const photos = loadPhotos();
            const keyword = document.getElementById('searchBox').value.toLowerCase();

            let filtered = photos.map((p, i) => ({ ...p, _idx: i }));

            // 分类筛选
            if (photoActiveCategory !== 'all') {
                filtered = filtered.filter(p => (p.category || 'life') === photoActiveCategory);
            }
            // 标签筛选
            if (photoActiveTag) {
                filtered = filtered.filter(p => (p.tags || []).includes(photoActiveTag));
            }
            // 搜索
            if (keyword) {
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(keyword) ||
                    (p.tags || []).some(t => t.toLowerCase().includes(keyword))
                );
            }

            const grid = document.getElementById('photoGrid');
            grid.innerHTML = [
                ...(filtered.length === 0
                    ? [`<div style="text-align:center;padding:40px;color:var(--muted);grid-column:1/-1;">
                          <p style="font-size:2em;">🔍</p><p>没有找到匹配的照片</p></div>`]
                    : filtered.map(p => `
                    <div class="photo-card" onclick="openLightbox(${p._idx})">
                        <button class="photo-edit" onclick="event.stopPropagation();editPhoto(${p._idx})" title="编辑">✎</button>
                        <button class="photo-del" onclick="event.stopPropagation();deletePhoto(${p._idx})">✕</button>
                        ${(p.tags && p.tags.length) ? `<div class="photo-tags">${p.tags.map(t => `<span onclick="event.stopPropagation();filterPhotoByTag('${t}')">#${t}</span>`).join('')}</div>` : ''}
                        <img src="${p.url}" alt="${p.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22><rect fill=%22%23333%22 width=%22200%22 height=%22150%22/><text fill=%22%23888%22 x=%22100%22 y=%2280%22 text-anchor=%22middle%22>图片加载失败</text></svg>'">
                        <div class="photo-caption">${p.name}</div>
                    </div>
                `).join('')),
                `<div class="add-photo-btn" onclick="openPhotoDialog()" title="添加照片">+</div>`
            ].join('');

            // 更新照片标签云和统计
            renderPhotoTagCloud();
            updatePhotoStats();
            renderPhotoCategoryFilters();
        }

        // 照片筛选函数
        function filterPhotoByTag(tag) {
            if (photoActiveTag === tag) {
                photoActiveTag = null;
            } else {
                photoActiveTag = tag;
                photoActiveCategory = 'all';
            }
            document.getElementById('searchBox').value = '';
            renderPhotos();
        }

        function filterPhotosByCategory(cat) {
            photoActiveCategory = cat;
            photoActiveTag = null;
            document.getElementById('searchBox').value = '';
            renderPhotos();
        }

        // 照片分类筛选按钮（更新左侧抽屉）
        function renderPhotoCategoryFilters() {
            const container = document.getElementById('categoryFilters');
            container.innerHTML = [
                `<button class="cat-item ${photoActiveCategory === 'all' ? 'active' : ''}" onclick="filterPhotosByCategory('all')">📋 全部</button>`,
                ...photoCategories.map(c =>
                    `<button class="cat-item ${photoActiveCategory === c.key ? 'active' : ''}" onclick="filterPhotosByCategory('${c.key}')">${c.emoji} ${c.name}</button>`
                )
            ].join('');
        }

        // 渲染照片分类管理列表（右侧栏）
        function renderPhotoCategoryList() {
            const list = document.getElementById('categoryList');
            list.innerHTML = photoCategories.map(c => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin-bottom:4px;border-radius:8px;background:var(--hover);font-size:0.9em;">
                    <span>${c.emoji} ${c.name}</span>
                    <button onclick="deletePhotoCategory('${c.key}')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.9em;" title="删除分类">✕</button>
                </div>
            `).join('');
        }

        function deletePhotoCategory(key) {
            if (photoCategories.length <= 1) { alert('至少保留一个分类！'); return; }
            if (!confirm(`确定要删除分类"${key}"吗？`)) return;
            photoCategories = photoCategories.filter(c => c.key !== key);
            savePhotoCategories(photoCategories);
            if (photoActiveCategory === key) photoActiveCategory = 'all';
            renderPhotoCategoryList();
            renderPhotos();
        }

        // 照片标签云
        function renderPhotoTagCloud() {
            const allTags = getAllPhotoTags();
            const cloud = document.getElementById('tagCloud');
            cloud.innerHTML = allTags.map(t => {
                const cls = photoActiveTag === t ? 'tag active' : 'tag';
                return `<span class="${cls}" onclick="filterPhotoByTag('${t}')">${t}</span>`;
            }).join('');
        }

        // 照片统计
        function updatePhotoStats() {
            const photos = loadPhotos();
            document.getElementById('statPosts').textContent = photos.length;
            document.getElementById('statTags').textContent = getAllPhotoTags().length;
        }

        let pendingPhotoData = null;
        let editingPhotoIdx = -1; // -1 = 新增模式

        function openPhotoDialog() {
            editingPhotoIdx = -1;
            document.getElementById('photoOverlay').querySelector('h2').textContent = '📷 添加照片';
            document.getElementById('photoSaveBtn').textContent = '✨ 添加照片';
            const catSelect = document.getElementById('photoCategory');
            catSelect.innerHTML = photoCategories.map(c => `<option value="${c.key}">${c.emoji} ${c.name}</option>`).join('');
            document.getElementById('photoOverlay').classList.add('active');
            document.getElementById('photoName').focus();
        }
        function editPhoto(idx) {
            const photos = loadPhotos();
            const p = photos[idx];
            if (!p) return;
            editingPhotoIdx = idx;
            document.getElementById('photoOverlay').querySelector('h2').textContent = '✏️ 编辑照片';
            document.getElementById('photoSaveBtn').textContent = '💾 保存修改';
            const catSelect = document.getElementById('photoCategory');
            catSelect.innerHTML = photoCategories.map(c => `<option value="${c.key}" ${c.key === (p.category || 'scenery') ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('');
            document.getElementById('photoName').value = p.name;
            document.getElementById('photoTags').value = (p.tags || []).join(', ');
            document.getElementById('photoUrl').value = p.url.startsWith('data:') ? '' : p.url;
            document.getElementById('photoFile').value = '';
            document.getElementById('photoFileName').textContent = '未选择文件';
            document.getElementById('photoPreview').style.display = 'none';
            pendingPhotoData = null;
            if (p.url.startsWith('data:')) {
                document.getElementById('photoPreviewImg').src = p.url;
                document.getElementById('photoPreview').style.display = '';
            }
            document.getElementById('photoOverlay').classList.add('active');
        }
        function closePhotoDialog() {
            document.getElementById('photoOverlay').classList.remove('active');
            document.getElementById('photoName').value = '';
            document.getElementById('photoUrl').value = '';
            document.getElementById('photoTags').value = '';
            document.getElementById('photoFile').value = '';
            document.getElementById('photoFileName').textContent = '未选择文件';
            document.getElementById('photoPreview').style.display = 'none';
            pendingPhotoData = null;
            editingPhotoIdx = -1;
        }
        document.getElementById('photoCancelBtn').addEventListener('click', closePhotoDialog);
        document.getElementById('photoOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('photoOverlay')) closePhotoDialog();
        });

        // 本地文件选择
        function handlePhotoFile() {
            const file = document.getElementById('photoFile').files[0];
            if (!file) return;
            document.getElementById('photoFileName').textContent = file.name;
            if (!document.getElementById('photoName').value) {
                document.getElementById('photoName').value = file.name.replace(/\.[^.]+$/, '');
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                pendingPhotoData = e.target.result;
                document.getElementById('photoPreviewImg').src = pendingPhotoData;
                document.getElementById('photoPreview').style.display = '';
            };
            reader.readAsDataURL(file);
        }

        document.getElementById('photoSaveBtn').addEventListener('click', () => {
            const name = document.getElementById('photoName').value.trim();
            const url = document.getElementById('photoUrl').value.trim();
            const tagsRaw = document.getElementById('photoTags').value.trim();
            const category = document.getElementById('photoCategory').value;

            if (!name) { alert('请输入照片名称！'); return; }

            const tags = tagsRaw
                ? tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean)
                : [];

            const photos = loadPhotos();

            if (editingPhotoIdx >= 0) {
                // 编辑模式
                const p = photos[editingPhotoIdx];
                p.name = name;
                p.tags = tags;
                p.category = category;
                if (pendingPhotoData) {
                    p.url = pendingPhotoData;
                } else if (url) {
                    p.url = url;
                }
                // 如果没提供新图片，保留原来的 url
                if (!pendingPhotoData && !url) {
                    // 编辑模式允许不改图片
                }
            } else {
                // 新增模式
                let finalUrl;
                if (pendingPhotoData) {
                    finalUrl = pendingPhotoData;
                } else if (url) {
                    finalUrl = url;
                } else {
                    alert('请选择本地文件或输入图片链接！'); return;
                }
                photos.unshift({ name, url: finalUrl, tags, category });
            }

            savePhotos(photos);
            closePhotoDialog();
            renderPhotos();
        });

        function deletePhoto(idx) {
            if (!confirm('确定删除这张照片吗？')) return;
            const photos = loadPhotos();
            photos.splice(idx, 1);
            savePhotos(photos);
            renderPhotos();
        }

        // 灯箱
        function openLightbox(idx) {
            const photos = loadPhotos();
            const p = photos[idx];
            document.getElementById('lightboxImg').src = p.url;
            document.getElementById('lightboxCaption').textContent = p.name;
            document.getElementById('lightbox').classList.add('active');
        }
        document.getElementById('lightboxClose').addEventListener('click', () => {
            document.getElementById('lightbox').classList.remove('active');
        });
        document.getElementById('lightbox').addEventListener('click', (e) => {
            if (e.target === document.getElementById('lightbox')) {
                document.getElementById('lightbox').classList.remove('active');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('lightbox').classList.contains('active')) {
                document.getElementById('lightbox').classList.remove('active');
            }
        });
