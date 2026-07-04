// ==========================================
// 1. 各フォルダに入っているファイルの「数」
// ==========================================
const soundCounts = {
    click: 3,
    type: 2,
    enter: 1,
    scroll: 2
};

let hasInteracted = false;

// 👻 自分が「無効化された古い拡張機能」かどうかを安全に判定（エラーをキャッチする）
function isContextInvalidated() {
    try {
        // コンテキストが破棄されている場合、ここにアクセスした瞬間にエラーが投げられます
        return typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id;
    } catch (error) {
        // エラーをキャッチしたら「亡霊状態」と判定して true を返す
        return true;
    }
}

function playRandomSound(category, loop = false) {
    if (isContextInvalidated()) return null;

    const maxCount = soundCounts[category];
    if (!maxCount || maxCount === 0) return null;

    const randomNum = Math.floor(Math.random() * maxCount) + 1;
    const filePath = `${category}/${randomNum}.mp3`;

    try {
        const audioUrl = chrome.runtime.getURL(filePath);
        const audio = new Audio(audioUrl);
        audio.volume = 0.5;
        audio.loop = loop;

        const promise = audio.play();
        promise.catch(error => {
            console.debug(`[${category}] 再生エラー:`, error.message);
        });

        return { audio, promise };
    } catch (e) {
        return null;
    }
}

// ==========================================
// 2. 各アクションの検知と再生
// ==========================================

document.addEventListener('mousedown', () => {
    if (isContextInvalidated()) return;
    hasInteracted = true;
    playRandomSound('click');
});

document.addEventListener('keydown', (event) => {
    if (isContextInvalidated()) return;
    hasInteracted = true;
    if (event.key === 'Enter') {
        playRandomSound('enter');
    } else {
        playRandomSound('type');
    }
});

// ③ スクロール音
let scrollTimeout;
let currentScrollAudio = null;
let currentScrollPromise = null;
let isScrolling = false;

document.addEventListener('scroll', () => {
    if (isContextInvalidated() || !hasInteracted) return;

    if (!isScrolling) {
        isScrolling = true;
        const result = playRandomSound('scroll', true);
        if (result) {
            currentScrollAudio = result.audio;
            currentScrollPromise = result.promise;
            currentScrollAudio.volume = 0.3;
        }
    }

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        isScrolling = false;

        if (currentScrollAudio && currentScrollPromise) {
            currentScrollPromise.then(() => {
                currentScrollAudio.pause();
                currentScrollAudio.currentTime = 0;
                currentScrollAudio = null;
                currentScrollPromise = null;
            }).catch(() => {
                currentScrollAudio = null;
                currentScrollPromise = null;
            });
        }
    }, 150);
});
