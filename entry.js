import cityData from './city.js';

let submitted = false;

// Googleフォームのエントリーコード
const FORM_ENTRIES = {
    EMPLOYEE_NAME: 'entry.1477204142',
    EMPLOYEE_BRANCH: 'entry.1783931350',
    NAME: 'entry.2051556631',
    AGE: 'entry.1557022610',
    EMAIL: 'entry.1258305063',
    PHONE: 'entry.1971705522',
    PREFECTURE: 'entry.275913540',
    CITY: 'entry.908310173',
    NOTES: 'entry.1932797490',
    CONSENT: 'entry.1591769099',
    EMP_ID: 'entry.1867112319',
    REF_TYPE: 'entry.1379412327',
};

document.addEventListener("DOMContentLoaded", function() {
    // エントリーコードのセット 
    setFormEntries();

    // フォームの初期化
    initializeForm();
});

// 市区町村選択肢の更新イベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded");
    const location1Select = document.getElementById('location_body');
    const location2Select = document.getElementById('location2_body');
    
    // 都道府県が選択されたときの処理
    location1Select.addEventListener('change', function() {
        const selectedPrefecture = this.value;
        updateCitySelect(selectedPrefecture);
        console.log("selectedPrefecture", selectedPrefecture);
    });

    // 市区町村選択肢を更新する関数
    function updateCitySelect(prefecture) {
        // 市区町村の選択肢をクリア
        location2Select.innerHTML = '<option value="" selected>市区町村を選択</option>';
        
        if (!prefecture) return; // 都道府県が選択されていない場合は終了

        // 選択された都道府県の市区町村一覧を取得
        const cities = cityData[prefecture];
        console.log("cities", cities);

        if (cities && cities.length > 0) {
            // 市区町村の選択肢を追加
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                location2Select.appendChild(option);
            });
        }
    }
});

function initializeForm() {
    // フォームの初期化処理
    const params = getParams();
    setParams(params);

    // イベント割り当て
    // 確認ボタン
    document.getElementById("confirm").addEventListener("click", function() {
        confirmForm(params.appType);
    });

    // 送信ボタン
    document.getElementById("correct").addEventListener("click", function() {
        originalForm();
    });

    // 本人承諾ではいが選択されている場合は送信ボタンを有効化、それ以外は無効化
    checkConsent(params);

    // フォームの送信
    const form = document.getElementById('myForm');
    if (form) {
        submitForm(form);
    }

    // 代理応募(appType=1)の場合は、bodyにclass entry_open 追加
    if (params.appType === '1') {
        document.body.classList.add('entry_open');
        document.getElementById('consent-table').hidden = false;
    }
}

// 本人承諾のチェック
function checkConsent(params) {
    const confirmButton = document.getElementById('confirm');
    const consentInputs = document.querySelectorAll('#consent_input input[type="radio"]');

    // 本人応募の場合は本人承諾のチェックを行わない
    if (params.appType != '1') {
        confirmButton.disabled = false;
        return;
    }

    // 各ラジオボタンにイベントリスナーを設定
    consentInputs.forEach(radio => {
        radio.addEventListener('click', function() {
            confirmButton.disabled = !document.querySelector('#consent_input input[value="はい"]:checked');
        });
    });

    // 初期状態の設定
    confirmButton.disabled = !document.querySelector('#consent_input input[value="はい"]:checked');
}


// フォームのエントリーコードをセット
function setFormEntries() {
    // 社員情報
    document.getElementById('employee_name_input').name = FORM_ENTRIES.EMPLOYEE_NAME;
    document.getElementById('employee_branch_input').name = FORM_ENTRIES.EMPLOYEE_BRANCH;
    document.getElementById('emp_id_input').name = FORM_ENTRIES.EMP_ID;
    document.getElementById('ref_type_input').name = FORM_ENTRIES.REF_TYPE;
    // 応募者情報
    document.getElementById('name_body').name = FORM_ENTRIES.NAME;
    document.getElementById('age_body').name = FORM_ENTRIES.AGE;

    
    document.getElementById('email_body').name = FORM_ENTRIES.EMAIL;
    document.getElementById('phone_body').name = FORM_ENTRIES.PHONE;

    document.getElementById('location_body').name = FORM_ENTRIES.PREFECTURE;
    document.getElementById('location2_body').name = FORM_ENTRIES.CITY;

    document.getElementById('notes_body').name = FORM_ENTRIES.NOTES;
    
    // 承諾（ラジオボタン）
    document.querySelectorAll('#consent_input input[type="radio"]')
        .forEach(radio => radio.name = FORM_ENTRIES.CONSENT);
}

// URLパラメータを取得
function getParams() {
    const params = new URLSearchParams(window.location.search);
    const appType = params.get('appType') || '';
    const employeeName = params.get('empName') || '';
    const employeeBranch = params.get('empBranch') || '';
    const name = params.get('name') || '';
    const age = params.get('age') || '';
    const email = params.get('email') || '';
    const phone = params.get('phone') || '';
    const prefecture = params.get('prefecture') || '';
    const city = params.get('city') || '';
    const notes = params.get('notes') || '';
    const consent = params.get('consent') || '';
    const empId = params.get('empId') || '';
    const refType = params.get('refType') || '';

    return {
        appType: appType,
        employeeName: employeeName,
        employeeBranch: employeeBranch,
        empId: empId,
        name: name,
        age: age,
        email: email,
        phone: phone,
        prefecture: prefecture,
        city: city,
        notes: notes,
        consent: consent,
        refType: refType
    };
}

// パラメータのセット
function setParams(params) {
    // タイトルを設定
    const formTitle = document.getElementById("formTitle");
    const consentRow = document.getElementById("consent-row");

    // 直接応募か代理応募の判定
    if (params.appType === '1') {
        formTitle.innerHTML = '代理応募';
    } else {
        formTitle.innerHTML = '応募フォーム';
    }

    // 紹介社員情報のセット
    setFormValue("employee_name_input", params.employeeName);
    setFormValue("employee_branch_input", params.employeeBranch);
    setFormValue("emp_id_input", params.empId);
    setFormValue("ref_type_input", params.refType);

    // 紹介社員情報の表示（スペースは全角）
    document.getElementById("employee_name").innerHTML = params.employeeBranch + '　' + params.employeeName;

    // フォームの初期値をセット
    setFormValue("name_body", params.name);
    setFormValue("age_body", params.age);
    setFormValue("email_body", params.email);
    setFormValue("phone_body", params.phone);
    setFormValue("location_body", params.prefecture);
    setFormValue("location2_body", params.city);
    setFormValue("notes_body", params.notes);

    setFormValue("gender_input", params.gender);
    setFormValue("consent_input", params.consent);
}

// formの初期値をセット
function setFormValue(elementId, value) {
    if (!value) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    // ラジオボタンの場合
    if (element.classList.contains('radioOther')) {
        const radioButtons = element.querySelectorAll(`input[type="radio"]`);
        radioButtons.forEach(radio => {
            if (radio.value === value) {
                radio.checked = true;
            }
        });
    } else {
        // 通常の入力フィールドの場合
        element.value = value || '';
    }
}


// フォームの送信
function submitForm(form) {
    // submitボタンのクリックイベント
    document.getElementById('submit').addEventListener('click', function(e) {
        e.preventDefault();
        
        // 非表示iframeを使用した送信
        const iframe = document.getElementById('hidden_iframe');
        iframe.onload = function() {
            console.log('送信成功');
            window.location.href = 'success.html';
        };
        
        // フォームのネイティブsubmitメソッドを呼び出し
        form.requestSubmit();
    });
}

// 確認画面のバリデーション
function confirmForm(appType) {
    let isValid = true;
    let firstInvalidElement = null;

    // 名前のバリデーション
    if (document.getElementById("name_body").value === '') {
        document.getElementById("name_bottom").hidden = false;
        document.getElementById("name_bottom").innerHTML = "※お名前を入力してください";
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = document.getElementById("name_body");
    } else {
        document.getElementById("name_bottom").hidden = true;
    }

    // メールアドレスのバリデーション
    const regex_email = /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
    let email_body = document.getElementById("email_body").value;
    if (email_body === '' || !regex_email.test(email_body)) {
        document.getElementById("email_bottom").hidden = false;
        document.getElementById("email_bottom").innerHTML = "※メールアドレスを入力してください";
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = document.getElementById("email_body");
    } else {
        document.getElementById("email_bottom").hidden = true;
    }

    // 電話番号のバリデーション
    const regex_phone0 = /^(050|070|080|090)-\d{4}-\d{4}$/;
    const regex_phone1 = /^0(\d-\d{4}|\d{2}-\d{3}|\d{3}-\d{2}|\d{4}-\d)-\d{4}$/;
    const regex_phone2 = /^0\d{9,10}$/;
    let phone_body = document.getElementById("phone_body").value;
    if (phone_body === '' || !(regex_phone0.test(phone_body) || regex_phone1.test(phone_body) || regex_phone2.test(phone_body))) {
        document.getElementById("phone_bottom").hidden = false;
        document.getElementById("phone_bottom").innerHTML = "※電話番号を入力してください";
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = document.getElementById("phone_body");
    } else {
        document.getElementById("phone_bottom").hidden = true;
    }

    // 希望勤務地のバリデーション
    if (document.getElementById("location_body").value === '' || document.getElementById("location2_body").value === '') {
        document.getElementById("location_bottom").hidden = false;
        document.getElementById("location_bottom").innerHTML = "※希望勤務地を入力してください";
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = document.getElementById("location_body");
    } else {
        document.getElementById("location_bottom").hidden = true;
    }

    // 承諾確認のバリデーション
    let consentElements = document.querySelectorAll("#consent_input input[type='radio']");

    if (consentElements[1].checked) {
        // いいえが選択されている
        document.getElementById("consent_bottom2").hidden = false;
        document.getElementById("consent_bottom2").innerHTML = "※本人の承諾がない場合は送信できません";
        document.getElementById("consent_bottom1").hidden = true;
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = document.getElementById("consent_input");
    } else if ((!consentElements[0].checked && !consentElements[1].checked) && appType === '1') {
        // 承諾の有無を選択していない
        document.getElementById("consent_bottom1").hidden = false;
        document.getElementById("consent_bottom1").innerHTML = "※承諾の有無を選択してください";
        document.getElementById("consent_bottom2").hidden = true;
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = document.getElementById("consent_input");
    } else {
        document.getElementById("consent_bottom1").hidden = true;
        document.getElementById("consent_bottom2").hidden = true;
    }

    if (isValid) {
        document.querySelector('form table').classList.add("check");
        
        // 入力画面の内容を非表示
        document.getElementById("confirm").hidden = true;
        document.getElementById("correct").hidden = false;
        document.getElementById("submit").hidden = false;

        // プライバシーポリシー行を非表示
        document.querySelector('p.privacy-policy').hidden = true;

        // 必須マークの非表示
        document.querySelectorAll(".required-mark").forEach(element => {
            element.hidden = true;
        });
        document.getElementById("formTitle").innerHTML = '応募内容の確認';

        // 確認画面表示の処理
        displayConfirmationValues();
    } else {
        scrollToForm(firstInvalidElement);
    }
}

// 確認画面の値表示
function displayConfirmationValues() {
    const fields = ['name', 'age', 'gender', 'email', 'phone', 'location', 'notes', 'consent'];
    fields.forEach(field => {
        const input = document.getElementById(`${field}_input`);
        const display = document.getElementById(field);
        if (input && display) {
            input.hidden = true;
            display.hidden = false;
            
            let value = '';
            if (field === 'gender' || field === 'consent') {
                value = getRadioValue(`${field}_input`);
            } else {
                value = document.getElementById(`${field}_body`).value;
                if (field === 'name') value += ' 様';
                if (field === 'age') value += ' 才';
            }
            display.innerHTML = value || '未入力';
        }
    });
}

// ラジオボタンの値取得
function getRadioValue(containerId) {
    const container = document.getElementById(containerId);
    const checkedRadio = container.querySelector('input[type="radio"]:checked');
    return checkedRadio ? checkedRadio.value : '';
}

// 元のフォームに戻る
function originalForm() {
    document.querySelector('form table').classList.remove("check");
    
    document.getElementById("confirm").hidden = false;
    document.getElementById("correct").hidden = true;
    document.getElementById("submit").hidden = true;
    document.getElementById("formTitle").innerHTML = '応募フォーム';

    const fields = ['name', 'age', 'gender', 'email', 'phone', 'location', 'notes', 'consent'];
    fields.forEach(field => {
        const input = document.getElementById(`${field}_input`);
        const display = document.getElementById(field);
        if (input && display) {
            input.hidden = false;
            display.hidden = true;
            const bottomElement = document.getElementById(`${field}_bottom`);
            if (bottomElement) {
                bottomElement.hidden = true;
            }
        }
    });
}

// フォームスクロール
function scrollToForm(element) {
	console.log(element);
	const topOfForm = $(element).position().top;
	console.log($(element).position().top);
	$('#myForm').animate({
		scrollTop: topOfForm
	}, 1000);
}