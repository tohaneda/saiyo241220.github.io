// モーダル関連の初期化
function initializeModal(modalId) {
    const modalOverlay = document.getElementById(`${modalId}Overlay`);
    const modal = document.getElementById(modalId);
    const closeButton = modal?.querySelector('.close');

    if (!modalOverlay || !modal || !closeButton) {
        console.error(`Modal elements not found for ${modalId}`);
        return;
    }

    // モーダルを開く
    const modalButtons = document.querySelectorAll(`[data-modal-target="${modalId}"]`);
    modalButtons.forEach(button => {
        button.addEventListener('click', () => {
            modalOverlay.style.display = 'block';  // オーバーレイを表示
            modal.style.display = 'block';
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.scrollTop = 0;  // スクロール位置をリセット
            }
        });
    });

    // モーダルを閉じる
    closeButton.addEventListener('click', () => {
        modalOverlay.style.display = 'none';  // オーバーレイを非表示
        modal.style.display = 'none';
    });

    // モーダル外クリックで閉じる
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            modalOverlay.style.display = 'none';  // オーバーレイを非表示
            modal.style.display = 'none';
        }
    });

    return modal;
}

// リンクAタグの初期化
function initializeLinkButton() {
    const linkButton = document.getElementById('linkButton');
    if (!linkButton) {
        console.error('Link button not found');
        return;
    }

    const linkUrl = getUrlWithParams(CONFIG.BASE_URL);

    linkButton.addEventListener('click', () => {
        window.location.href = linkUrl;
    });
}

// シェアリンク機能の初期化
function initializeShareLinks(modal) {
    const shareLinks = document.querySelectorAll('.link-button');

    shareLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const type = link.dataset.type;
            let shareData = {
                title: '',
//                title: document.title,
            };

            const url = getUrlWithParams(CONFIG.BASE_URL);

            // 対象本文からメッセージを取得
            const selectedOption = document.querySelector(`input[value="${type}"]`);
            const messageElement = selectedOption?.closest('.share-option')?.querySelector('.share-message');
            if (messageElement) {
                const messageText = messageElement.textContent
                    .replace(/\s+/g, ' ')
                    .replace(/\n\s*/g, '\n')
                    .trim();
                shareData.text = `${messageText}\n\n${url}`;
            }

            try {
                if (!navigator.share) {
                    console.error('Web Share API is not supported');
                    return;
                }

                await navigator.share(shareData);
                console.log('シェア成功');
                modal.style.display = 'none';
            } catch (error) {
                console.error('シェア失敗:', error);
            }
        });
    });
}

// 代理応募ボタンの初期化
function initializeProxyButton() {
    const proxyButton = document.getElementById('proxyButton');
    if (!proxyButton) {
        console.error('Proxy button not found');
        return;
    }

    proxyButton.addEventListener('click', () => {
        let proxyUrl = getUrlWithParams(CONFIG.BASE_URL);
        // 代理応募の場合はappType=1を追加
        if (proxyUrl === CONFIG.BASE_URL) {
            proxyUrl += `?appType=1`;
        } else {
            proxyUrl += `&appType=1`;
        }
        console.log('Proxy URL:', proxyUrl);
        window.location.href = proxyUrl;
    });
}

// QRコード機能の初期化
function initializeQRButton() {
    // QRコードURLの生成（初期化時に1回だけ）
    const timestamp = generateTimestamp();
    let qrData = getUrlWithParams(CONFIG.BASE_URL);
    qrData += `&ts=${timestamp}`;
    const qrCodeUrl = `${CONFIG.QR_API_URL}?data=${encodeURIComponent(qrData)}`;

    // QRコード画像の設定
    const qrImage = document.getElementById('qrImage');
    if (qrImage) {
        qrImage.src = qrCodeUrl;
        console.log('Generated QR Code URL:', qrCodeUrl);
    }

    // ボタンのイベントリスナー設定
    const qrButton = document.querySelector('.qr-button');
    if (!qrButton) {
        console.error('QR button not found');
        return;
    }

    qrButton.addEventListener('click', () => {
        const qrModal = document.getElementById('qrModalOverlay');
        if (qrModal) {
            qrModal.style.display = 'block';
        }
    });
}

// DOMの読み込み完了時に各機能を初期化
document.addEventListener('DOMContentLoaded', () => {
    // 各モーダルの初期化
    const shareModal = initializeModal('shareModal');
    const qrModal = initializeModal('qrModal');


    if (shareModal) {
        initializeShareLinks(shareModal);
    }
    initializeProxyButton();
    initializeQRButton();
    initializeLinkButton();
});
