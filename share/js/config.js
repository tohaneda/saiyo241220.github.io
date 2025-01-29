// アプリケーションの設定値
const CONFIG = {
    // 基本URL設定

    //    BASE_URL: 'https://referrals-flax.vercel.app/index.html',    
    BASE_URL: 'https://tohaneda.github.io/saiyo241220.github.io/index.html',
    QR_API_URL: 'https://api.qrserver.com/v1/create-qr-code/',

    // API設定
    API: {
        timeout: 5000,
        retryCount: 3
    }
};

// 設定値を読み取り専用にする
Object.freeze(CONFIG);