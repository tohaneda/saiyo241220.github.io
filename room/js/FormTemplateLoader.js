export class FormTemplateLoader {
  static async loadTemplates() {
    try {
      const [inputTemplate, confirmationTemplate] = await Promise.all([
        this.fetchTemplate('templates/input-form.html'),
        this.fetchTemplate('templates/confirmation-form.html')
      ]);

      return {
        inputTemplate,
        confirmationTemplate
      };
    } catch (error) {
      console.error('テンプレートの読み込みに失敗しました:', error);
      throw error;
    }
  }

  static async fetchTemplate(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${path}`);
    }
    return await response.text();
  }
} 