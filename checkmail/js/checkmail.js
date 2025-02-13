async function searchEmail() {
    const email = document.getElementById('emailInput').value;
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');
    
    // 入力チェック
    if (!email) {
        errorDiv.textContent = 'メールアドレスを入力してください';
        errorDiv.style.display = 'block';
        resultDiv.style.display = 'none';
        return;
    }

    try {
        // APIのエンドポイントURL
        const apiUrl = 'https://asia-northeast1-referralsaiyo-poc.cloudfunctions.net/check_address';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.message === "User not found") {
                errorDiv.textContent = 'ユーザーが見つかりませんでした';
                errorDiv.style.display = 'block';
                resultDiv.style.display = 'none';
            } else {
                // 結果の表示
                errorDiv.style.display = 'none';
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                    <h2>検索結果</h2>
                    <p>名前: ${data.name}</p>
                    <p>部署: ${data.department}</p>
                    <p>役職: ${data.position}</p>
                    <p>電話: ${data.phone}</p>
                    <p>入社日: ${data.join_date}</p>
                `;
            }
        } else {
            throw new Error(data.error || 'エラーが発生しました');
        }
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
        resultDiv.style.display = 'none';
    }
}