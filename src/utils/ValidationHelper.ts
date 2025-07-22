/**
 * ✅ Validation Helper - Utilitários para validação de dados
 *
 * Helper estático com funções puras para validação de diferentes
 * tipos de dados, formatos e regras de negócio.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationHelper {
  /**
   * Valida se um email é válido
   */
  static email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida um CPF brasileiro
   */
  static cpf(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11 || /^(.)\1{10}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;

    return digit === parseInt(cleaned.charAt(10));
  }

  /**
   * Valida um CNPJ brasileiro
   */
  static cnpj(cnpj: string): boolean {
    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14 || /^(.)\1{13}$/.test(cleaned)) {
      return false;
    }

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * (weights1[i] || 0);
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(cleaned.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * (weights2[i] || 0);
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return digit === parseInt(cleaned.charAt(13));
  }

  /**
   * Valida um telefone brasileiro
   */
  static phone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }

  /**
   * Valida um CEP brasileiro
   */
  static cep(cep: string): boolean {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
  }

  /**
   * Valida uma URL
   */
  static url(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida se uma string contém apenas números
   */
  static numeric(value: string): boolean {
    return /^\d+$/.test(value);
  }

  /**
   * Valida se uma string contém apenas letras
   */
  static alphabetic(value: string): boolean {
    return /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
  }

  /**
   * Valida se uma string é alfanumérica
   */
  static alphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9À-ÿ\s]+$/.test(value);
  }

  /**
   * Valida o comprimento de uma string
   */
  static length(value: string, min: number, max?: number): boolean {
    if (value.length < min) return false;
    if (max !== undefined && value.length > max) return false;
    return true;
  }

  /**
   * Valida se um valor está dentro de um range numérico
   */
  static range(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Valida se uma data é válida
   */
  static date(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  }

  /**
   * Valida se uma data está no futuro
   */
  static futureDate(date: string | Date): boolean {
    if (!this.date(date)) return false;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getTime() > Date.now();
  }

  /**
   * Valida se uma data está no passado
   */
  static pastDate(date: string | Date): boolean {
    if (!this.date(date)) return false;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getTime() < Date.now();
  }

  /**
   * Valida se uma idade está dentro de um range
   */
  static age(birthDate: string | Date, minAge: number, maxAge?: number): boolean {
    if (!this.date(birthDate)) return false;

    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;

    if (actualAge < minAge) return false;
    if (maxAge !== undefined && actualAge > maxAge) return false;

    return true;
  }

  /**
   * Valida força de senha
   */
  static passwordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Comprimento
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    }

    // Letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter letras minúsculas');
    }

    // Letras maiúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter letras maiúsculas');
    }

    // Números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter números');
    }

    // Caracteres especiais
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter caracteres especiais');
    }

    return {
      isStrong: score >= 4,
      score,
      feedback,
    };
  }

  /**
   * Valida se um arquivo tem extensão permitida
   */
  static fileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  /**
   * Valida tamanho de arquivo em bytes
   */
  static fileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
  }

  /**
   * Valida um JSON válido
   */
  static json(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida um array não vazio
   */
  static notEmptyArray<T>(array: T[]): boolean {
    return Array.isArray(array) && array.length > 0;
  }

  /**
   * Valida se um objeto não está vazio
   */
  static notEmptyObject(obj: object): boolean {
    return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
  }

  /**
   * Valida se um valor não é null, undefined ou string vazia
   */
  static required(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /**
   * Valida múltiplas regras para um campo
   */
  static field(
    value: unknown,
    rules: {
      required?: boolean;
      email?: boolean;
      cpf?: boolean;
      cnpj?: boolean;
      phone?: boolean;
      url?: boolean;
      numeric?: boolean;
      alphabetic?: boolean;
      alphanumeric?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      pattern?: RegExp;
      custom?: (value: unknown) => boolean;
    },
  ): ValidationResult {
    const errors: string[] = [];

    // Required
    if (rules.required && !this.required(value)) {
      errors.push('Campo obrigatório');
      return { isValid: false, errors };
    }

    // Se não é required e está vazio, passa
    if (!rules.required && !this.required(value)) {
      return { isValid: true, errors: [] };
    }

    const stringValue = String(value);

    // Email
    if (rules.email && !this.email(stringValue)) {
      errors.push('Email inválido');
    }

    // CPF
    if (rules.cpf && !this.cpf(stringValue)) {
      errors.push('CPF inválido');
    }

    // CNPJ
    if (rules.cnpj && !this.cnpj(stringValue)) {
      errors.push('CNPJ inválido');
    }

    // Phone
    if (rules.phone && !this.phone(stringValue)) {
      errors.push('Telefone inválido');
    }

    // URL
    if (rules.url && !this.url(stringValue)) {
      errors.push('URL inválida');
    }

    // Numeric
    if (rules.numeric && !this.numeric(stringValue)) {
      errors.push('Deve conter apenas números');
    }

    // Alphabetic
    if (rules.alphabetic && !this.alphabetic(stringValue)) {
      errors.push('Deve conter apenas letras');
    }

    // Alphanumeric
    if (rules.alphanumeric && !this.alphanumeric(stringValue)) {
      errors.push('Deve conter apenas letras e números');
    }

    // Length
    if (rules.minLength !== undefined && stringValue.length < rules.minLength) {
      errors.push(`Deve ter pelo menos ${rules.minLength} caracteres`);
    }

    if (rules.maxLength !== undefined && stringValue.length > rules.maxLength) {
      errors.push(`Deve ter no máximo ${rules.maxLength} caracteres`);
    }

    // Numeric range
    if ((rules.min !== undefined || rules.max !== undefined) && this.numeric(stringValue)) {
      const numValue = parseFloat(stringValue);

      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`Valor deve ser pelo menos ${rules.min}`);
      }

      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`Valor deve ser no máximo ${rules.max}`);
      }
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push('Formato inválido');
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      errors.push('Valor inválido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida um objeto completo com múltiplos campos
   */
  static object<T extends Record<string, unknown>>(
    obj: T,
    schema: {
      [K in keyof T]?: Parameters<typeof ValidationHelper.field>[1];
    },
  ): ValidationResult & { fieldErrors: Record<keyof T, string[]> } {
    const fieldErrors = {} as Record<keyof T, string[]>;
    let hasErrors = false;

    Object.keys(schema).forEach((field) => {
      const fieldKey = field as keyof T;
      const rules = schema[fieldKey];

      if (rules) {
        const result = this.field(obj[fieldKey], rules);
        fieldErrors[fieldKey] = result.errors;

        if (!result.isValid) {
          hasErrors = true;
        }
      }
    });

    const allErrors = Object.values(fieldErrors).flat();

    return {
      isValid: !hasErrors,
      errors: allErrors,
      fieldErrors,
    };
  }
}
