// URLパラメータを取得する共通関数
function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

// タイムスタンプを生成する共通関数
function generateTimestamp() {
    return new Date().toISOString();
}

// パラメータを含むURLを生成する共通関数
function getUrlWithParams(baseUrl) {
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.toString() === '') {
        return baseUrl+ "?refType=" + getPageName();
    }
    let url =`${baseUrl}${currentParams.toString() ? '?' + currentParams.toString() : ''}`
    url += "&refType=" + getPageName();
    return url;
}

// ページ名を取得する共通関数
function getPageName() {
    let pageName = window.location.pathname.split('/').pop();
    pageName = pageName.split('.')[0];
    return pageName;
}
