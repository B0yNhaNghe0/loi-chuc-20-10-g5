const $ = s => document.querySelector(s), key = 'nang-wishes-2026';
const samples = [{ recipient: 'Tất cả các chị em', message: 'Chúc các chị em luôn xinh đẹp, tự tin và hạnh phúc. Cảm ơn vì những nụ cười đã khiến văn phòng của chúng ta trở thành một nơi thật dễ thương!', color: 'pink' }, { recipient: 'Chị em công ti G5', message: 'Mong chị em công ti G5 có thật nhiều niềm vui, deadline luôn nhẹ nhàng và mỗi ngày đi làm đều có một điều đáng mong chờ. Happy 20/10! 🌷', color: 'green' }, { recipient: 'Tất cả các chị em', message: 'Chúc các bạn luôn được trân trọng, được lắng nghe và có đủ can đảm để theo đuổi những điều mình yêu. Hôm nay và tất cả những ngày sau nữa.', color: 'peach' }];
let wishes = [], filter = 'all', remote = null, ready = false, viewerUid = 'local', sortMode = 'newest';
const pendingHearts = new Set();
function readLocal() { try { const a = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(a) ? a.filter(x => typeof x.message === 'string' && typeof x.recipient === 'string') : [] } catch { return [] } }
const options = { color: ['pink', 'green', 'peach', 'lilac', 'cream', 'midnight'], font: ['serif', 'sans', 'italic'], pattern: ['plain', 'dots', 'stripes', 'glow'], frame: ['none', 'line', 'double', 'dashed'], icon: ['flower', 'heart', 'spark', 'tulip', 'bow', 'none'], layout: ['left', 'center', 'right'] };
const symbols = { flower: '✿', heart: '♡', spark: '✧', tulip: '🌷', bow: '🎀', none: '' };
function designValue() { return Object.fromEntries(Object.keys(options).map(k => [k, $('#design-' + k).value])) }
function makeCard(w) { const d = w.design || {}, card = document.createElement('article'); card.className = 'card'; for (const [k, values] of Object.entries(options)) { const v = k === 'color' ? (d[k] || w.color) : d[k]; card.classList.add('design-' + k + '-' + (values.includes(v) ? v : values[0])) } const to = document.createElement('div'); to.className = 'to'; to.textContent = 'Gửi ' + w.recipient; const ornament = document.createElement('div'); ornament.className = 'ornament'; ornament.textContent = symbols[options.icon.includes(d.icon) ? d.icon : 'flower']; const p = document.createElement('p'); p.textContent = w.message; const sig = document.createElement('div'); sig.className = 'signature'; sig.textContent = 'Một người giấu tên · 20/10'; card.append(to, ornament, p, sig); if (w.id) card.append(makeHeart(w)); return card }
function preview() { const card = makeCard({ recipient: $('#recipient').value.trim() || 'Tất cả các chị em', message: $('#message').value.trim() || 'Chúc chị em công ti G5 luôn rạng rỡ, hạnh phúc và được yêu thương theo cách mình xứng đáng.', design: designValue() }); $('#card-preview').replaceChildren(card) }
function render() { const sample = !remote && wishes.length === 0; $('#sample-note').hidden = !sample; $('#total').textContent = wishes.length; const term = $('#search').value.toLocaleLowerCase('vi'); const list = (sample ? samples : wishes).filter(w => (filter === 'all' || (filter === 'general' ? w.recipient === 'Tất cả các chị em' : w.recipient !== 'Tất cả các chị em')) && (w.recipient + ' ' + w.message).toLocaleLowerCase('vi').includes(term)); list.sort(compareWishes); $('#cards').replaceChildren(...list.map(makeCard)); $('#empty').hidden = !!list.length }

function heartCount(w) { return Object.values(w.hearts || {}).filter(v => v === true).length }
function wishTime(w) { return typeof w.createdAt === 'number' ? w.createdAt : (w.createdAt?.toMillis?.() || 0) }
function compareWishes(a, b) { return (sortMode === 'hearts' ? heartCount(b) - heartCount(a) : 0) || wishTime(b) - wishTime(a) || String(a.id || '').localeCompare(String(b.id || '')) }
function makeHeart(w) {
    const button = document.createElement('button');
    const liked = w.hearts?.[viewerUid] === true;
    button.type = 'button'; button.className = 'heart-button' + (liked ? ' is-liked' : '');
    button.textContent = (liked ? '♥ ' : '♡ ') + heartCount(w);
    button.setAttribute('aria-pressed', String(liked));
    button.setAttribute('aria-label', (liked ? 'Bỏ tim' : 'Thả tim') + ' cho lời chúc gửi ' + w.recipient + ', ' + heartCount(w) + ' tim');
    button.disabled = pendingHearts.has(w.id) || !ready;
    button.addEventListener('click', () => toggleHeart(w.id)); return button;
}
async function toggleHeart(id) {
    if (!ready || pendingHearts.has(id)) return;
    pendingHearts.add(id); render(); $('#garden-status').textContent = '';
    try {
        if (remote) await remote.toggleHeart(id);
        else {
            const list = readLocal(), wish = list.find(w => w.id === id);
            if (!wish) throw new Error('wish-not-found');
            const hearts = { ...(wish.hearts || {}) };
            if (hearts.local === true) delete hearts.local; else hearts.local = true;
            wish.hearts = hearts; localStorage.setItem(key, JSON.stringify(list)); wishes = list;
        }
    } catch (error) {
        console.error('Không cập nhật được tim:', error.code || error.message);
        $('#garden-status').textContent = error.code === 'permission-denied' ? 'Chưa thả tim được. Người quản trị cần cập nhật Firestore Rules mới.' : 'Chưa cập nhật được tim. Kiểm tra mạng rồi thử lại nhé.';
    } finally { pendingHearts.delete(id); render() }
}
$('#sort-wishes').addEventListener('change', e => { sortMode = e.target.value; render() });

$('#message').addEventListener('input', () => { $('#counter').textContent = $('#message').value.length + '/600'; preview() }); $('#recipient').addEventListener('input', preview);
for (const k of Object.keys(options)) $('#design-' + k).addEventListener('change', preview);
$('#shuffle').addEventListener('click', () => { for (const k of ['color', 'pattern', 'icon']) { const values = options[k]; $('#design-' + k).value = values[Math.floor(Math.random() * values.length)] } preview() }); preview();
for (const b of document.querySelectorAll('[data-filter]')) b.addEventListener('click', () => { filter = b.dataset.filter; document.querySelectorAll('[data-filter]').forEach(x => x.classList.toggle('active', x === b)); render() }); $('#search').addEventListener('input', render);
$('#wish-form').addEventListener('submit', async e => { e.preventDefault(); const message = $('#message').value.trim(), recipient = $('#recipient').value.trim() || 'Tất cả các chị em'; if (message.length < 10) { $('#status').textContent = 'Bạn viết ít nhất 10 ký tự nhé.'; return } if (!ready) { $('#status').textContent = 'Kết nối chưa sẵn sàng. Vui lòng thử lại sau.'; return } $('#send').disabled = true; $('#status').textContent = 'Đang gửi lời chúc…'; const design = designValue(); const w = { message, recipient, color: design.color, design }; try { if (remote) await remote.send(w); else { w.id = crypto.randomUUID(); w.createdAt = Date.now(); const next = [w, ...readLocal()]; localStorage.setItem(key, JSON.stringify(next)); wishes = next; render() } $('#message').value = ''; $('#counter').textContent = '0/600'; preview(); $('#status').textContent = remote ? 'Lời chúc đã được gửi! Cảm ơn bạn đã gieo một chút yêu thương ♡' : 'Đã lưu lời chúc trên thiết bị này ♡'; } catch { $('#status').textContent = 'Chưa gửi được lời chúc. Nội dung vẫn được giữ lại, bạn thử lại nhé.' } finally { $('#send').disabled = false } });
$('#export').addEventListener('click', () => { if (!wishes.length) { $('#status').textContent = 'Chưa có lời chúc thật để tải.'; $('#write').scrollIntoView(); return } const txt = [...wishes].sort(compareWishes).map((w, i) => `${i + 1}. Gửi ${w.recipient}\n${w.message}\n— Một người giấu tên · ${heartCount(w)} tim`).join('\n\n'); const url = URL.createObjectURL(new Blob(['\ufeff' + txt], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'loi-chuc-20-10.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) });
window.addEventListener('storage', e => { if (e.key === key && !remote) { wishes = readLocal(); render() } });
if (window.FIREBASE_CONFIG) {
    $('#mode').textContent = 'Đang kết nối vườn lời chúc…'; try {
        const base = 'https://www.gstatic.com/firebasejs/12.3.0/'; const [app, auth, fs] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]); const instance = app.initializeApp(window.FIREBASE_CONFIG); const credential = await auth.signInAnonymously(auth.getAuth(instance)); viewerUid = credential.user.uid; const db = fs.getFirestore(instance), col = fs.collection(db, 'wishes'); remote = {
            send: w => fs.addDoc(col, { ...w, createdAt: fs.serverTimestamp() }),
            toggleHeart: id => fs.runTransaction(db, async tx => {
                const ref = fs.doc(db, 'wishes', id), snapshot = await tx.get(ref);
                if (!snapshot.exists()) throw new Error('wish-not-found');
                const hearts = { ...(snapshot.data().hearts || {}) };
                if (hearts[viewerUid] === true) delete hearts[viewerUid]; else hearts[viewerUid] = true;
                tx.update(ref, { hearts });
            })
        }; fs.onSnapshot(fs.query(col, fs.orderBy('createdAt', 'desc'), fs.limit(300)), snap => { wishes = snap.docs.map(d => ({ ...d.data(), id: d.id })); ready = true; $('#mode').textContent = 'Vườn lời chúc dùng chung · Cập nhật trực tiếp'; $('#sample-note').hidden = true; render() }, () => { ready = false; $('#mode').textContent = 'Không đọc được dữ liệu. Vui lòng kiểm tra cấu hình Firebase.' });
    } catch { $('#mode').textContent = 'Chưa kết nối được Firebase. Vui lòng kiểm tra cấu hình.'; ready = false }
} else { wishes = readLocal(); if (wishes.some(w => !w.id)) { wishes = wishes.map(w => ({ ...w, id: w.id || crypto.randomUUID() })); try { localStorage.setItem(key, JSON.stringify(wishes)) } catch { $('#status').textContent = 'Trình duyệt đang chặn lưu dữ liệu trên thiết bị.' } } ready = true; render() }
