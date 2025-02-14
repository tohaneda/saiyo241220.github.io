/**
 * @typedef {Object} UserResult
 * @property {string} email - メールアドレス
 * @property {string} name - ユーザー名
 * @property {string} department - 部署
 * @property {string} position - 役職
 * @property {string} phone - 電話番号
 * @property {string} join_date - 入社日
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 処理の成功/失敗
 * @property {UserResult} [data] - ユーザーデータ（成功時のみ）
 * @property {string} [message] - メッセージ（主にエラー時）
 */

async function searchEmail() {
    // 要素の取得を確認
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
        
    // 表示をリセット
    resultDiv.innerHTML = '';
    errorDiv.textContent = '';

    try {
        const response = await fetch('http://127.0.0.1:8080', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: document.getElementById('emailInput').value 
            })
        });

        const data = await response.json();

        if (data.success && data.data) {
            const html = `
                <h2>検索結果</h2>
                <table class="result-table">
                    <tr>
                        <th>名前</th>
                        <td>${data.data.name}</td>
                    </tr>
                    <tr>
                        <th>部署</th>
                        <td>${data.data.department}</td>
                    </tr>
                    <tr>
                        <th>役職</th>
                        <td>${data.data.position}</td>
                    </tr>
                    <tr>
                        <th>電話</th>
                        <td>${data.data.phone}</td>
                    </tr>
                    <tr>
                        <th>入社日</th>
                        <td>${data.data.join_date}</td>
                    </tr>
                </table>
            `;
            resultDiv.innerHTML = html;
        } else {
            errorDiv.textContent = data.message || 'ユーザーが見つかりませんでした';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'サーバーとの通信に失敗しました';
    }
}

// 入力フォームでEnterキーを押した時の処理
document.getElementById('emailInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchEmail();
    }
});