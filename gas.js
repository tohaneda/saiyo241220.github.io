// BCCメールアドレス
//const BBC_EMAIL = "atsushi_sunahara+bcc@token.co.jp";

// メールテンプレートの定義
const EMAIL_TITLE = "応募を受け付けました";
const EMAIL_TEMPLATE = (name) => `
${name} 様

東建コーポレーションの採用面接にご応募いただき、ありがとうございました。
選考日程の詳細について、弊社担当者より後日ご連絡させていただきます。
会社説明資料を添付いたします。ご一読いただけると幸いです。
よろしくお願いいたします。

会社説明資料
https://docs.google.com/presentation/d/18JVd0IdSqTnIQ6r5-JLociRveL_xaE4L1vQ4fDs5F6A/edit#slide=id.g2788faba6e4_8_7
`;

// フォーム送信時の処理
function onFormSubmit(e) {

    Logger.log('Received data: ' + JSON.stringify(e.namedValues));
    const response = e.namedValues;
    
    // 日本語から英語へのマッピング
    const fieldMapping = {
        '氏名': 'name',
        '年齢': 'age',
        'メールアドレス': 'email',
        '電話番号': 'phone',
        '希望勤務地': 'location',
        '紹介者氏名': 'employee_name',
        '紹介者所属': 'employee_branch'
    };
    
    try {
        // 変換したデータを新しいオブジェクトに格納
        const formData = {};
        for (let [jpKey, value] of Object.entries(response)) {
            const engKey = fieldMapping[jpKey];
            if (engKey) {
                formData[engKey] = value[0];
            }
        }
        
        Logger.log('Converted data: ' + JSON.stringify(formData));
                
        // メール本文の作成
        const body = EMAIL_TEMPLATE(formData.name);
        
        // メール送信
        MailApp.sendEmail({
            to: formData.email,
            bcc: BBC_EMAIL,
            subject: EMAIL_TITLE,
            body: body
        });
        
    } catch (error) {
        Logger.log('Error details: ' + error);
        Logger.log('Available fields: ' + Object.keys(response));
    }
}