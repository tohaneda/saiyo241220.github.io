import { FormManager } from './FormManager.js';
import { FormTemplateLoader } from './FormTemplateLoader.js';
import { UrlParamsManager } from './UrlParamsManager.js';


// フォームの設定
const formConfig = {
  formId: 'myForm',
  confirmButtonId: 'confirm',
  correctButtonId: 'correct',
  submitButtonId: 'submit',
  titleElementId: 'formTitle',
  formContentId: 'formContent',
  editTitle: '応募フォーム',
  confirmationTitle: '応募内容の確認',
  apiEndpoint: '/api/entries',
  
  // セレクター設定
  selectors: {
    errorMessage: '.error-message',
    inputError: '.input-error',
    consentCheckbox: 'input[name="consent"]',
    checkboxGroup: '.checkbox-group',
    inputFields: 'input, textarea'
  },

  fields: {
    company: {
      required: false,
      label: '会社名',
      selector: 'input[name="company"]',
      getValue: () => document.querySelector('input[name="company"]').value
    },
    name: {
      required: true,
      label: 'お名前',
      validate: (value) => value.trim() !== '',
      errorMessage: '※お名前を入力してください',
      displayFormat: (value) => `${value} 様`,
      getValue: () => document.querySelector('input[name="name"]').value
    },
    email: {
      required: false,
      label: 'メールアドレス',
      getValue: () => document.querySelector('input[name="email"]').value
    },
    phone: {
      required: true,
      label: '電話番号',
      validate: (value) => value.trim() !== '',
      errorMessage: '※電話番号を入力してください',
      getValue: () => document.querySelector('input[name="phone"]').value
    },
    address: {
      required: true,
      label: '土地住所',
      validate: (value) => value.trim() !== '',
      errorMessage: '※土地住所を入力してください',
      getValue: () => document.querySelector('input[name="address"]').value
    },
    notes: {
      required: false,
      label: '現在の状況等',
      getValue: () => document.querySelector('textarea[name="notes"]').value
    },
    situation: {
      required: true,
      label: 'ご紹介先の状況',
      type: 'radio',
      errorMessage: '※状況を選択してください',
      getValue: () => document.querySelector('input[name="situation"]:checked')?.value
    },
    interest: {
      required: true,
      label: '希望項目',
      type: 'radio',
      errorMessage: '※希望項目を選択してください',
      getValue: () => document.querySelector('input[name="interest"]:checked')?.value
    },
    consent: {
      required: true,
      label: '紹介の了承',
      type: 'checkbox',
      errorMessage: '※紹介の了承が必要です',
      getValue: () => document.querySelector('input[name="consent"]').checked
    }
  },
  
  // カスタムバリデーション
  customValidation: () => {
    // 承諾確認などの特別なバリデーション
    return { isValid: true, element: null };
  }
};

document.addEventListener("DOMContentLoaded", function() {
    // フォームの初期化
    initializeForm();
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // URLパラメータを取得
    const urlParams = UrlParamsManager.getParams();
    
    // 全てのテンプレートを読み込む
    const templates = await FormTemplateLoader.loadTemplates();
    
    // フォームコンテンツ領域にテンプレートを挿入
    const formContent = document.getElementById('formContent');
    formContent.innerHTML = templates.inputTemplate + templates.confirmationTemplate;
    
    // 成功時テンプレートはグローバルに保持
    window.successTemplate = templates.successTemplate;

    // appTypeが1の場合は承認チェックを非表示に
    if (urlParams.appType === '1') {
      // チェックボックスグループ全体を非表示
      const consentGroup = document.querySelector('.checkbox-group');
      if (consentGroup) {
        consentGroup.remove();
      }
      
      // formConfigから承認チェックの必須設定を削除
      if (formConfig.fields.consent) {
        delete formConfig.fields.consent;
      }
      
      // 確認ボタンを常に有効化
      const confirmButton = document.getElementById(formConfig.confirmButtonId);
      if (confirmButton) {
        confirmButton.disabled = false;
      }
    }

    // FormManagerの初期化
    const redirectUrl = urlParams.appType === '1' ? 'success2.html' : 'success1.html';
    const formManager = new FormManager(formConfig, urlParams, redirectUrl);
  } catch (error) {
    console.error('フォームの初期化に失敗しました:', error);
  }
});

