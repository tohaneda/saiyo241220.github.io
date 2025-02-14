export class UrlParamsManager {
  static getParams() {
    const params = new URLSearchParams(window.location.search);
    
    return {
      appType: params.get('appType') || '',
      employeeName: params.get('empName') || '',
      employeeBranch: params.get('empBranch') || '',
      empId: params.get('empId') || '',
      name: params.get('name') || '',
      age: params.get('age') || '',
      email: params.get('email') || '',
      phone: params.get('phone') || '',
      prefecture: params.get('prefecture') || '',
      city: params.get('city') || '',
      notes: params.get('notes') || '',
      consent: params.get('consent') || '',
      refType: params.get('refType') || ''
    };
  }

  static hasParams() {
    return window.location.search.length > 0;
  }

  static getParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || '';
  }
} 