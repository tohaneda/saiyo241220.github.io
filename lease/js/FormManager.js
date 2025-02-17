import { FormConfirmationView } from './FormConfirmationView.js';

export class FormManager {
  constructor(config, urlParams, redirectUrl, callbacks = {}) {
    // コンストラクター
    this.config = config;
    this.urlParams = urlParams;
    this.redirectUrl = redirectUrl;
    this.selectors = config.selectors;
    this.form = document.getElementById(config.formId);
    this.formContent = document.getElementById(config.formContentId);
    this.confirmButton = document.getElementById(config.confirmButtonId);
    this.correctButton = document.getElementById(config.correctButtonId);
    this.submitButton = document.getElementById(config.submitButtonId);
    this.confirmationView = new FormConfirmationView(config);
    
    this.callbacks = {
      onSubmitSuccess: callbacks.onSubmitSuccess || ((response) => {
        window.location.href = this.redirectUrl;
      }),
      onSubmitError: callbacks.onSubmitError || ((error) => {
        alert('送信に失敗しました。');
      }),
      onBeforeSubmit: callbacks.onBeforeSubmit || ((data) => data)
    };
    
    this.setupConsentCheck();
    this.initialize(redirectUrl);
  }

  initialize(redirectUrl) {
    // フォームの初期化
    this.confirmButton?.addEventListener('click', () => this.confirmForm());
    this.correctButton?.addEventListener('click', () => this.returnToEdit());
    if (this.form && this.submitButton) {
      this.setupSubmission(redirectUrl);
    }
  }

  confirmForm() {
    // フォームの確認
    if (this.validateForm()) {
      const formData = this.getFormData();
      this.confirmationView.show(formData);
      this.updateButtons(true);
    }
  }

  returnToEdit() {
    // フォームの編集
    this.confirmationView.hide();
    this.updateButtons(false);
  }

  updateButtons(isConfirmationMode) {
    // ボタンの表示
    this.confirmButton.hidden = isConfirmationMode;
    this.correctButton.hidden = !isConfirmationMode;
    this.submitButton.hidden = !isConfirmationMode;
  }

  getFormData() {
    const formData = {};
    const form = document.getElementById(this.config.formId);
    const formElements = form.elements;
    
    for (let element of formElements) {
      if (element.name) {
        if (element.type === 'radio' && element.checked) {
          formData[element.name] = element.value;
        } else if (element.type === 'checkbox') {
          formData[element.name] = element.checked;
        } else if (element.type !== 'radio') {
          formData[element.name] = element.value;
        }
      }
    }
    
    return formData;
  }

  validateForm() {
    // フォームのバリデーション
    let isValid = true;
    let firstInvalidElement = null;

    // エラーメッセージをリセット
    document.querySelectorAll(this.selectors.errorMessage).forEach(el => {
      el.hidden = true;
    });
    
    // 入力フィールドのエラー状態をリセット
    document.querySelectorAll(this.selectors.inputFields).forEach(el => {
      el.classList.remove('input-error');
    });

    for (const [fieldId, config] of Object.entries(this.config.fields)) {
      if (config.required) {
        const value = config.getValue();
        const input = document.querySelector(`[name="${fieldId}"]`);
        const errorElement = document.getElementById(`${fieldId}_error`);

        if (!value || (config.validate && !config.validate(value))) {
          isValid = false;
          
          // エラーメッセージを表示
          if (errorElement) {
            errorElement.hidden = false;
          }
          
          // 入力フィールドにエラー表示
          if (input) {
            input.classList.add('input-error');
            if (!firstInvalidElement) {
              firstInvalidElement = input;
            }
          }
        }
      }
    }

    // 最初のエラー項目にスクロール
    if (firstInvalidElement) {
      firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  setupSubmission(redirectUrl) {
    // 送信ボタンのクリックイベント
    this.submitButton.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Submit button clicked');
      
      try {
        const formData = this.getFormData();
        console.log('送信データ:', formData); // デバッグ用
        const response = await this.handleSubmit(formData);
        console.log(response);
      } catch (error) {
        console.error('詳細なエラー情報:', error); // デバッグ用
        this.callbacks.onSubmitError(error);
      }
    });
  }

  async handleSubmit(formData) {
    try {
      console.log('送信データ:', formData); // デバッグ用

      const apiData = this.callbacks.onBeforeSubmit(formData);

      const response = await fetch(`${this.config.apiEndpoint}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();
      console.log('APIレスポンス:', result); // デバッグ用
      
      if (response.ok) { // status code 200-299
        this.callbacks.onSubmitSuccess(result);
      } else {
        // エラーメッセージをより詳細に
        const errorMessage = result.message || `APIエラー: ${response.status} ${response.statusText}`;
        this.callbacks.onSubmitError(new Error(errorMessage));
      }
    } catch (error) {
      console.error('詳細なエラー情報:', error); // デバッグ用
      this.callbacks.onSubmitError(error);
    }
  }

  scrollToElement(element) {
    const topOfElement = element.offsetTop;
    this.form.scrollTo({
      top: topOfElement,
      behavior: 'smooth'
    });
  }

  setupConsentCheck() {
    const consentCheckbox = document.querySelector(this.selectors.consentCheckbox);
    if (!consentCheckbox) return;

    // 初期状態で確認ボタンを無効化
    this.confirmButton.disabled = !consentCheckbox.checked;

    // チェックボックスの状態変更時に確認ボタンの有効/無効を切り替え
    consentCheckbox.addEventListener('change', () => {
      this.confirmButton.disabled = !consentCheckbox.checked;
    });
  }
}