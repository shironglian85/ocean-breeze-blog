// ============ 博客模块 ============

        // ============ 分类数据 ============
        const defaultCategories = [
            { key: 'tech', name: '技术', emoji: '💻' },
            { key: 'life', name: '生活', emoji: '📷' },
            { key: 'notes', name: '随笔', emoji: '📝' }
        ];

        function loadCategories() {
            const saved = localStorage.getItem('blog-categories');
            if (saved) return JSON.parse(saved);
            localStorage.setItem('blog-categories', JSON.stringify(defaultCategories));
            return [...defaultCategories];
        }

        function saveCategories(cats) {
            localStorage.setItem('blog-categories', JSON.stringify(cats));
            if (typeof autoSync === 'function') autoSync();
        }

        let categories = loadCategories();

        // 渲染导航栏
        function renderNav() {
            const nav = document.getElementById('navBar');
            nav.innerHTML = [
                '<a onclick="showBlog()" style="font-weight:700;">🏠 首页</a>',
                '<a onclick="showBlog()">📝 博客</a>',
                '<a onclick="showPhotos()">📷 照片展</a>'
            ].join('');
        }

        // 博客/照片切换
        function showBlog() {
            document.getElementById('blogSection').classList.remove('hidden');
            document.getElementById('photoSection').classList.remove('active');
            document.getElementById('sidebar').style.display = '';
            document.getElementById('drawerTab').style.display = '';
            document.getElementById('drawerPanel').querySelector('h3').textContent = '📂 分录';
            document.getElementById('searchLabel').textContent = '🔍 搜索文章';
            document.getElementById('searchBox').placeholder = '输入关键词搜索…';
            document.getElementById('searchBox').value = '';
            document.getElementById('tagCloudLabel').textContent = '🏷️ 标签云';
            document.getElementById('statsLabel').textContent = '📊 博客统计';
            document.getElementById('catMgmtLabel').textContent = '📂 分类管理';
            document.getElementById('newCatName').placeholder = '新分类名称';
            document.getElementById('addCatBtn').textContent = '+ 添加';
            activeTag = null;
            activeCategory = 'all';
            refreshAllTags();
            renderCategoryList();
            renderCategoryFilters();
            renderPosts();
            renderTagCloud();
            // 高亮导航
            document.querySelectorAll('#navBar a').forEach(a => a.style.fontWeight = '');
        }
        function showPhotos() {
            document.getElementById('blogSection').classList.add('hidden');
            document.getElementById('photoSection').classList.add('active');
            document.getElementById('drawerPanel').querySelector('h3').textContent = '📂 照片分类';
            document.getElementById('searchLabel').textContent = '🔍 搜索照片';
            document.getElementById('searchBox').placeholder = '输入照片名称搜索…';
            document.getElementById('searchBox').value = '';
            document.getElementById('tagCloudLabel').textContent = '🏷️ 照片标签';
            document.getElementById('statsLabel').textContent = '📊 照片统计';
            document.getElementById('catMgmtLabel').textContent = '📷 照片分类管理';
            document.getElementById('newCatName').placeholder = '新照片分类名称';
            document.getElementById('addCatBtn').textContent = '+ 添加照片分类';
            photoActiveTag = null;
            photoActiveCategory = 'all';
            renderPhotoCategoryList();
            renderPhotos();
        }

        // 搜索输入处理
        function handleSearch() {
            if (document.getElementById('photoSection').classList.contains('active')) {
                photoActiveTag = null;
                photoActiveCategory = 'all';
                renderPhotos();
            } else {
                renderPosts();
            }
        }

        // ============ 分录抽屉 ============
        function toggleDrawer() {
            const panel = document.getElementById('drawerPanel');
            const tab = document.getElementById('drawerTab');
            const overlay = document.getElementById('drawerOverlay');
            const isOpen = panel.classList.contains('open');
            if (isOpen) {
                panel.classList.remove('open');
                tab.classList.remove('open');
                overlay.classList.remove('show');
            } else {
                panel.classList.add('open');
                tab.classList.add('open');
                overlay.classList.add('show');
            }
        }

        // 渲染分类筛选按钮
        function renderCategoryFilters() {
            const container = document.getElementById('categoryFilters');
            container.innerHTML = [
                `<button class="cat-item ${activeCategory === 'all' ? 'active' : ''}" onclick="filterPosts('all')">📋 全部</button>`,
                ...categories.map(c =>
                    `<button class="cat-item ${activeCategory === c.key ? 'active' : ''}" onclick="filterPosts('${c.key}')">${c.emoji} ${c.name}</button>`
                )
            ].join('');
        }

        // 渲染侧边栏分类列表 & 更新文章编辑器的分类下拉
        function renderCategoryList() {
            const list = document.getElementById('categoryList');
            list.innerHTML = categories.map(c => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin-bottom:4px;border-radius:8px;background:var(--hover);font-size:0.9em;">
                    <span>${c.emoji} ${c.name}</span>
                    <button onclick="deleteCategory('${c.key}')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.9em;" title="删除分类">✕</button>
                </div>
            `).join('');

            // 更新文章编辑器里的分类下拉
            const catSelect = document.getElementById('newCategory');
            catSelect.innerHTML = categories.map(c => `<option value="${c.key}">${c.emoji} ${c.name}</option>`).join('');
        }

        // ============ Emoji 选择器 ============
        const emojiList = [
            '😀','😂','😍','🥰','😎','🤩','😇','🤗','🤔','😴',
            '😱','🥳','😤','😭','🤯','😅','🙃','😏','🫡','🤤',
            '💻','📱','🖥️','⌨️','🖱️','💾','📀','🔧','⚙️','🛠️',
            '🎨','🎵','🎬','📷','🎮','🎯','🎸','🎹','🎧','📚',
            '✈️','🚗','🚲','🏠','🌍','🏖️','🏔️','🌃','🏕️','🛤️',
            '🐱','🐶','🦊','🐼','🐨','🐙','🦄','🐝','🐢','🦜',
            '🌱','🌸','🌊','☀️','🌈','⭐','🔥','💧','🍀','🌙',
            '❤️','💚','💙','💛','💜','🖤','🤍','💖','💝','✨',
            '🍕','🍔','☕','🍰','🍿','🍩','🍺','🧃','🍎','🍕',
            '📝','💡','🗣️','🤝','🏆','🎁','🔔','📌','💬','✅',
            '⚽','🏀','🏈','🎾','🏐','🏓','🎱','🥊','🏊','🚴',
            '🎄','🎃','🎂','🎉','🎊','🧧','🎈','🎁','🪅','🎀',
            '🔑','💰','🛒','📦','✂️','📌','🔗','✏️','📅','⏰',
            '🚀','🛸','🔬','🧬','🧲','💊','🩺','🧪','🔭','📡',
            '♻️','💯','❗','❓','💤','🔄','⬆️','⬇️','➡️','🛑',
            '🌶️','🍜','🍣','🍱','🥟','🍚','🧋','🍵','🍦','🧁',
            '💰','💵','💴','💶','💷','💳','💎','🪙','📈','📉',
            '🏦','🏧','📊','💹','🪪','🧾','💸','🏷️','📋','🛡️',
        ];

        const emojiGrid = document.getElementById('emojiGrid');
        const emojiBtn = document.getElementById('emojiBtn');
        const emojiPanel = document.getElementById('emojiPanel');
        let selectedEmoji = '😊';

        // 渲染 emoji 网格
        emojiGrid.innerHTML = emojiList.map(e =>
            `<span onclick="selectEmoji('${e}')">${e}</span>`
        ).join('');

        function selectEmoji(emoji) {
            selectedEmoji = emoji;
            emojiBtn.textContent = emoji;
            emojiPanel.classList.remove('active');
        }

        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPanel.classList.toggle('active');
        });

        // 点击其他地方关闭面板
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.emoji-picker-wrap')) {
                emojiPanel.classList.remove('active');
            }
        });

        // 添加分类（博客 / 照片）
        document.getElementById('addCatBtn').addEventListener('click', () => {
            const name = document.getElementById('newCatName').value.trim();
            const emoji = selectedEmoji;
            if (!name) { alert('请输入分类名称！'); return; }
            const key = name.toLowerCase().replace(/\s+/g, '-');

            const isPhotoView = document.getElementById('photoSection').classList.contains('active');

            if (isPhotoView) {
                if (photoCategories.some(c => c.key === key)) { alert('该分类已存在！'); return; }
                photoCategories.push({ key, name, emoji });
                savePhotoCategories(photoCategories);
                renderPhotoCategoryList();
                renderPhotos();
            } else {
                if (categories.some(c => c.key === key)) { alert('该分类已存在！'); return; }
                categories.push({ key, name, emoji });
                saveCategories(categories);
                renderNav();
                renderCategoryList();
                renderCategoryFilters();
            }

            document.getElementById('newCatName').value = '';
            selectedEmoji = '😊';
            emojiBtn.textContent = '😊';
        });

        // 删除分类
        function deleteCategory(key) {
            if (categories.length <= 1) { alert('至少保留一个分类！'); return; }
            if (!confirm(`确定要删除分类"${key}"吗？该分类下的文章不会被删除。`)) return;
            categories = categories.filter(c => c.key !== key);
            saveCategories(categories);

            // 如果当前正在筛选被删除的分类，切回首页
            if (activeCategory === key) activeCategory = 'all';

            renderNav();
            renderCategoryList();
            renderCategoryFilters();
            renderPosts();
            renderTagCloud();
        }

        // ============ 文章数据 ============
        const defaultPosts = [
            {
                id: 1,
                title: '我的第一篇文章：为什么开始写博客',
                date: '2026-07-01',
                excerpt: '一直想拥有一个属于自己的角落来记录思考和成长。这个博客就是我的数字花园，每一篇文章都是一棵正在生长的树。',
                category: 'notes',
                tags: ['博客', '随笔', '开始']
            },
            {
                id: 2,
                title: 'JavaScript 异步编程：从回调到 async/await',
                date: '2026-06-25',
                excerpt: '异步编程是 JavaScript 的核心能力之一。本文带你回顾从回调函数、Promise 到 async/await 的进化历程，以及常见陷阱。',
                category: 'tech',
                tags: ['JavaScript', '异步', '教程']
            },
            {
                id: 3,
                title: '周末骑行日记：城市边缘的风景',
                date: '2026-06-18',
                excerpt: '沿着河堤骑了 40 公里，发现了很多平时开车看不到的小路和风景。有时候慢下来，才能看到生活的细节。',
                category: 'life',
                tags: ['骑行', '生活', '摄影']
            },
            {
                id: 4,
                title: 'CSS Grid 布局实战技巧',
                date: '2026-06-10',
                excerpt: 'Grid 布局是现代前端页面搭建的利器。这篇文章整理了我在项目中常用的 Grid 模式和踩过的坑。',
                category: 'tech',
                tags: ['CSS', '前端', '教程']
            },
            {
                id: 5,
                title: '读《代码整洁之道》的一些感悟',
                date: '2026-06-02',
                excerpt: '好的代码就像好的文章，读起来应该流畅自然。这本书让我重新思考了什么是"好代码"的标准。',
                category: 'notes',
                tags: ['读书', '编程', '思考']
            },
            {
                id: 6,
                title: '用 PowerShell 写了一个磁盘清理脚本',
                date: '2026-07-03',
                excerpt: '电脑 C 盘又红了？花半小时写了个 PowerShell 脚本，自动扫描临时文件、回收站、更新缓存，一目了然。',
                category: 'tech',
                tags: ['PowerShell', '工具', 'Windows']
            }
        ];

        function loadPosts() {
            const saved = localStorage.getItem('blog-user-posts');
            if (saved) return JSON.parse(saved);
            localStorage.setItem('blog-user-posts', JSON.stringify(defaultPosts));
            return [...defaultPosts];
        }

        function saveUserPosts(userPosts) {
            localStorage.setItem('blog-user-posts', JSON.stringify(userPosts));
            if (typeof autoSync === 'function') autoSync();
        }

        function getUserPosts() {
            const saved = localStorage.getItem('blog-user-posts');
            return saved ? JSON.parse(saved) : [];
        }

        let posts = loadPosts();
        let allTags = [...new Set(posts.flatMap(p => p.tags))];
        let activeTag = null;
        let activeCategory = 'all';

        function refreshAllTags() {
            allTags = [...new Set(posts.flatMap(p => p.tags))];
        }

        // ============ 渲染文章列表 ============
        function renderPosts() {
            const keyword = document.getElementById('searchBox').value.toLowerCase();
            const filtered = posts.filter(p => {
                const matchCat = activeCategory === 'all' || p.category === activeCategory;
                const matchTag = !activeTag || p.tags.includes(activeTag);
                const matchSearch = !keyword ||
                    p.title.toLowerCase().includes(keyword) ||
                    p.excerpt.toLowerCase().includes(keyword) ||
                    p.tags.some(t => t.toLowerCase().includes(keyword));
                return matchCat && matchTag && matchSearch;
            });

            const container = document.getElementById('postList');
            if (filtered.length === 0) {
                container.innerHTML = `<div style="text-align:center;padding:60px;color:var(--muted);">
                    <p style="font-size:3em;">🔍</p><p>没有找到匹配的文章</p></div>`;
            } else {
                container.innerHTML = filtered.map(p => `
                    <article class="post" id="post-${p.id}">
                        <div class="post-actions">
                            <button class="action-btn edit-action" onclick="event.stopPropagation();editPost(${p.id})" title="编辑">✎</button>
                            <button class="action-btn del-action" onclick="event.stopPropagation();deletePost(${p.id})" title="删除">🗑</button>
                        </div>
                        <div class="date">📅 ${p.date}</div>
                        <h2>${p.title}</h2>
                        <p style="color:var(--muted);">${p.excerpt}</p>
                        <div class="tags">
                            ${p.tags.map(t => `<span onclick="event.stopPropagation();filterByTag('${t}')">#${t}</span>`).join('')}
                        </div>
                    </article>
                `).join('');
            }

            // 更新统计
            document.getElementById('statPosts').textContent = posts.length;
            document.getElementById('statTags').textContent = allTags.length;

            // 生成文章目录
            renderTOC(filtered);
        }

        // ============ 文章目录 TOC ============
        function renderTOC(visiblePosts) {
            var tocPanel = document.getElementById('tocPanel');
            var tocNav = document.getElementById('tocNav');
            var headings = [];

            visiblePosts.forEach(function(p) {
                var lines = (p.excerpt || '').split('\n');
                lines.forEach(function(line) {
                    var m = line.match(/^(#{1,3})\s+(.+)/);
                    if (m) {
                        headings.push({
                            level: m[1].length,
                            text: m[2],
                            postId: p.id,
                            postTitle: p.title
                        });
                    }
                });
            });

            if (headings.length === 0) {
                tocPanel.style.display = 'none';
                return;
            }
            tocPanel.style.display = '';

            tocNav.innerHTML = headings.map(function(h) {
                var indent = (h.level - 1) * 12;
                return '<a href="#" onclick="scrollToHeading(\'' + h.postId + '\')" ' +
                    'style="display:block;padding:3px 0 3px ' + indent + 'px;color:var(--accent);text-decoration:none;' +
                    'border-radius:6px;transition:all 0.2s;font-size:' + (1 - h.level*0.06) + 'em;" ' +
                    'onmouseover="this.style.background=\'var(--hover)\'" ' +
                    'onmouseout="this.style.background=\'transparent\'">' +
                    (h.level === 1 ? '📄 ' : h.level === 2 ? '└ ' : '  └ ') + h.text +
                    '</a>';
            }).join('');
        }

        // 滚动到指定文章
        function scrollToHeading(postId) {
            var el = document.getElementById('post-' + postId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                el.style.boxShadow = '0 0 30px rgba(var(--glow),0.6)';
                setTimeout(function() { el.style.boxShadow = ''; }, 2000);
            }
        }

        // ============ 渲染标签云 ============
        function renderTagCloud() {
            const cloud = document.getElementById('tagCloud');
            cloud.innerHTML = allTags.map(t => {
                const cls = activeTag === t ? 'tag active' : 'tag';
                return `<span class="${cls}" onclick="filterByTag('${t}')">${t}</span>`;
            }).join('');
        }

        // ============ 筛选 ============
        function filterPosts(cat) {
            activeCategory = cat;
            activeTag = null;
            document.getElementById('searchBox').value = '';
            renderCategoryFilters();
            renderPosts();
            renderTagCloud();
        }

        function filterByTag(tag) {
            if (activeTag === tag) {
                activeTag = null;
            } else {
                activeTag = tag;
                activeCategory = 'all';
            }
            document.getElementById('searchBox').value = '';
            renderPosts();
            renderTagCloud();
        }


        // ============ 新增/编辑文章弹窗 ============
        const modalOverlay = document.getElementById('modalOverlay');
        const newPostBtn = document.getElementById('newPostBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const saveBtn = document.getElementById('saveBtn');
        const editIdInput = document.getElementById('editId');

        function closeModal() {
            modalOverlay.classList.remove('active');
            document.getElementById('editId').value = '';
            document.getElementById('newTitle').value = '';
            document.getElementById('newTags').value = '';
            setEditorContent('');
            document.getElementById('newCategory').value = 'tech';
        }

        function editPost(id) {
            const userPosts = getUserPosts();
            const post = userPosts.find(p => p.id === id);
            if (!post) return;

            editIdInput.value = post.id;
            document.getElementById('modalTitle').textContent = '✏️ 编辑文章';
            saveBtn.textContent = '💾 保存修改';
            document.getElementById('newTitle').value = post.title;
            document.getElementById('newCategory').value = post.category;
            document.getElementById('newTags').value = post.tags.join(', ');
            setTimeout(function() { setEditorContent(post.excerpt); }, 150);
            modalOverlay.classList.add('active');
            document.getElementById('newTitle').focus();
        }

        newPostBtn.addEventListener('click', openModal);
        cancelBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modalOverlay.classList.contains('active')) {
                    closeModal();
                } else if (document.getElementById('drawerPanel').classList.contains('open')) {
                    toggleDrawer();
                }
            }
        });

        // 保存（新增或更新）
        saveBtn.addEventListener('click', () => {
            const title = document.getElementById('newTitle').value.trim();
            const category = document.getElementById('newCategory').value;
            const tagsRaw = document.getElementById('newTags').value.trim();
            const content = getEasyMDE().value().trim();
            const editingId = editIdInput.value;

            if (!title) { alert('请输入文章标题！'); return; }
            if (!content) { alert('请输入文章内容！'); return; }

            const tags = tagsRaw
                ? tagsRaw.split(/[,，]/).map(t => t.trim()).filter(Boolean)
                : ['未分类'];

            const userPosts = getUserPosts();

            if (editingId) {
                // 编辑模式：更新已有文章
                const idx = userPosts.findIndex(p => p.id === parseInt(editingId));
                if (idx !== -1) {
                    userPosts[idx].title = title;
                    userPosts[idx].category = category;
                    userPosts[idx].tags = tags;
                    userPosts[idx].excerpt = content;
                }
            } else {
                // 新建模式
                const newId = userPosts.length > 0
                    ? Math.max(...userPosts.map(p => p.id)) + 1
                    : 1000;

                const now = new Date();
                const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

                userPosts.unshift({ id: newId, title, date: dateStr, excerpt: content, category, tags });
            }

            saveUserPosts(userPosts);
            posts = loadPosts();
            refreshAllTags();
            closeModal();
            renderPosts();
            renderTagCloud();
        });

        // ============ 图片粘贴/拖拽支持 ============
        // EasyMDE 实例
        var easyMDE = null;

        function getEasyMDE() {
            if (!easyMDE) {
                easyMDE = new EasyMDE({
                    element: document.getElementById('newContent'),
                    spellChecker: false,
                    placeholder: '写点什么…支持 Markdown 语法',
                    toolbar: ['bold','italic','heading','|','quote','unordered-list','ordered-list','|','link','image','|','preview','side-by-side','fullscreen','|','guide'],
                    status: false,
                    minHeight: '200px',
                    maxHeight: '400px',
                });
            }
            return easyMDE;
        }

        function openModal() {
            editIdInput.value = '';
            document.getElementById('modalTitle').textContent = '✍️ 写新文章';
            saveBtn.textContent = '✨ 发布文章';
            modalOverlay.classList.add('active');
            var mde = getEasyMDE();
            setTimeout(function() { mde.codemirror.focus(); }, 100);
        }

        function setEditorContent(val) {
            var mde = getEasyMDE();
            mde.value(val);
        }


        function handleImageFile(file) {
            if (!file || !file.type.match(/^image\//)) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                var b64 = e.target.result.split(',')[1];
                var md = '![](data:image/png;base64,' + b64 + ')';
                var mde = getEasyMDE();
                var cm = mde.codemirror;
                cm.replaceSelection(md);
            };
            reader.readAsDataURL(file);
        }

        // 粘贴 + 拖拽图片（挂在 textarea 父容器上，EasyMDE 接管后 textarea 被隐藏）
        document.addEventListener('paste', function(e) {
            if (!modalOverlay.classList.contains('active')) return;
            var items = e.clipboardData && e.clipboardData.items;
            if (!items) return;
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.match(/^image\//)) {
                    e.preventDefault();
                    handleImageFile(items[i].getAsFile());
                    return;
                }
            }
        });
        document.addEventListener('dragover', function(e) { if (modalOverlay.classList.contains('active')) e.preventDefault(); });
        document.addEventListener('drop', function(e) {
            if (!modalOverlay.classList.contains('active')) return;
            e.preventDefault();
            var files = e.dataTransfer && e.dataTransfer.files;
            if (files && files[0]) handleImageFile(files[0]);
        });

        // 删除文章
        function deletePost(id) {
            if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return;
            let userPosts = getUserPosts();
            userPosts = userPosts.filter(p => p.id !== id);
            saveUserPosts(userPosts);
            posts = loadPosts();
            refreshAllTags();
            renderPosts();
            renderTagCloud();
        }

