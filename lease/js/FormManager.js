import { FormConfirmationView } from './FormConfirmationView.js';

export class FormManager {
  constructor(config, urlParams, redirectUrl) {
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
    
    this.setupConsentCheck();
    this.initialize(redirectUrl);
  }

  initialize(redirectUrl) {
    this.confirmButton?.addEventListener('click', () => this.confirmForm());
    this.correctButton?.addEventListener('click', () => this.returnToEdit());
    if (this.form && this.submitButton) {
      this.setupSubmission(redirectUrl);
    }
  }

  confirmForm() {
    if (this.validateForm()) {
      const formData = this.getFormData();
      this.confirmationView.show(formData);
      this.updateButtons(true);
    }
  }

  returnToEdit() {
    this.confirmationView.hide();
    this.updateButtons(false);
  }

  updateButtons(isConfirmationMode) {
    this.confirmButton.hidden = isConfirmationMode;
    this.correctButton.hidden = !isConfirmationMode;
    this.submitButton.hidden = !isConfirmationMode;
  }

  getFormData() {
    const formData = {};
    for (const [fieldId, config] of Object.entries(this.config.fields)) {
      if (config.getValue) {
        formData[fieldId] = config.getValue();
      }
    }
    return formData;
  }

  validateForm() {
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
    this.submitButton.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Submit button clicked');
      
      try {
        // TODO:一時的にAPI送信をスキップ
        // const formData = this.getFormData();
        // await this.submitForm(formData);
        
        // 直接success.htmlへリダイレクト
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('送信エラー:', error);
        alert('送信に失敗しました。もう一度お試しください。');
      }
    });
  }

  async submitForm(formData) {
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
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