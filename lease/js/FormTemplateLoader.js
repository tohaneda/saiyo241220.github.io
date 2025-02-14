export class FormTemplateLoader {
  static async loadTemplates() {
    try {
      const [inputTemplate, confirmationTemplate, successTemplate] = await Promise.all([
        this.loadTemplate('templates/input-form.html'),
        this.loadTemplate('templates/confirmation-form.html'),
      ]);

      return {
        inputTemplate,
        confirmationTemplate,
        successTemplate
      };
    } catch (error) {
      console.error('テンプレートの読み込みに失敗しました:', error);
      throw error;
    }
  }

  static async loadTemplate(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${path}`);
    }
    return await response.text();
  }
} 