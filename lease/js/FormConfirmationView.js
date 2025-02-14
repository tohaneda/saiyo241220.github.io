export class FormConfirmationView {
  constructor(config) {
    this.config = config;
    this.form = document.getElementById(config.formId);
    this.inputContainer = this.form.querySelector('.input-container');
    this.confirmationContainer = this.form.querySelector('.confirmation-container');
    this.titleElement = document.getElementById(config.titleElementId);
  }

  show(formData) {
    // 入力フォームを非表示
    this.inputContainer.hidden = true;
    
    // 確認画面を表示
    this.confirmationContainer.hidden = false;
    
    // 値を設定
    this.setConfirmationValues(formData);
    
    // ボタンの表示を切り替え
    this.updateButtons(true);
    
    // タイトルを更新
    this.updateTitle(this.config.confirmationTitle);
  }

  hide() {
    // 確認画面を非表示
    this.confirmationContainer.hidden = true;
    
    // 入力フォームを表示
    this.inputContainer.hidden = false;
    
    // ボタンの表示を戻す
    this.updateButtons(false);
    
    // タイトルを戻す
    this.updateTitle(this.config.editTitle);
  }

  setConfirmationValues(formData) {
    for (const [fieldId, value] of Object.entries(formData)) {
      const field = this.confirmationContainer.querySelector(`[data-field="${fieldId}"] .confirmation-value`);
      if (field) {
        field.textContent = value || '未入力';
      }
    }
  }

  updateButtons(isConfirmationMode) {
    const confirmButton = document.getElementById(this.config.confirmButtonId);
    const correctButton = document.getElementById(this.config.correctButtonId);
    const submitButton = document.getElementById(this.config.submitButtonId);
    
    if (confirmButton) confirmButton.hidden = isConfirmationMode;
    if (correctButton) correctButton.hidden = !isConfirmationMode;
    if (submitButton) submitButton.hidden = !isConfirmationMode;
  }

  updateTitle(title) {
    if (this.titleElement) {
      this.titleElement.textContent = title;
    }
  }
} 