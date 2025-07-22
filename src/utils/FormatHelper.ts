/**
 * 📝 Format Helper - Utilitários para formatação de dados
 *
 * Helper estático com funções puras para formatação de textos,
 * números, datas e outros tipos de dados.
 */

export class FormatHelper {
  /**
   * Formata um número como moeda brasileira
   */
  static currency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  }

  /**
   * Formata um número com separadores de milhares
   */
  static number(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Formata uma porcentagem
   */
  static percentage(value: number, decimals: number = 1): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  /**
   * Formata uma data no formato brasileiro
   */
  static date(
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case 'short':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        break;
      case 'medium':
        options.day = '2-digit';
        options.month = 'short';
        options.year = 'numeric';
        break;
      case 'long':
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
      case 'full':
        options.weekday = 'long';
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
    }

    return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
  }

  /**
   * Formata uma hora
   */
  static time(date: Date | string | number, includeSeconds: boolean = false): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Hora inválida';
    }

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    if (includeSeconds) {
      options.second = '2-digit';
    }

    return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
  }

  /**
   * Formata data e hora juntas
   */
  static datetime(
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' = 'medium',
  ): string {
    const dateStr = this.date(date, format);
    const timeStr = this.time(date);
    return `${dateStr} às ${timeStr}`;
  }

  /**
   * Formata um período de tempo relativo (ex: "há 2 horas")
   */
  static timeAgo(date: Date | string | number): string {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return 'agora mesmo';
    if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffMonths < 12) return `há ${diffMonths} mês${diffMonths > 1 ? 'es' : ''}`;
    return `há ${diffYears} ano${diffYears > 1 ? 's' : ''}`;
  }

  /**
   * Formata o tamanho de um arquivo
   */
  static fileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formata um texto para Title Case
   */
  static titleCase(text: string): string {
    return text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  }

  /**
   * Formata um texto para camelCase
   */
  static camelCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase(),
      )
      .replace(/\s+/g, '');
  }

  /**
   * Formata um texto para kebab-case
   */
  static kebabCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Formata um texto para snake_case
   */
  static snakeCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Trunca um texto com reticências
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Remove acentos de um texto
   */
  static removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Formata um slug amigável para URLs
   */
  static slug(text: string): string {
    return this.removeAccents(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Formata um telefone brasileiro
   */
  static phone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return phone;
  }

  /**
   * Formata um CPF
   */
  static cpf(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    return cpf;
  }

  /**
   * Formata um CNPJ
   */
  static cnpj(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return cnpj;
  }

  /**
   * Formata um CEP
   */
  static cep(cep: string): string {
    const cleaned = cep.replace(/\D/g, '');

    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    return cep;
  }

  /**
   * Formata primeiro nome + inicial do sobrenome
   */
  static shortName(fullName: string): string {
    const parts = fullName
      .trim()
      .split(' ')
      .filter((part) => part.length > 0);

    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0] || '';

    const firstName = parts[0] || '';
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName?.charAt(0).toUpperCase() || ''}.`;
  }

  /**
   * Formata iniciais de um nome
   */
  static initials(fullName: string, maxInitials: number = 2): string {
    const parts = fullName
      .trim()
      .split(' ')
      .filter((part) => part.length > 0);

    return parts
      .slice(0, maxInitials)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  /**
   * Formata um objeto JSON de forma legível
   */
  static json(obj: unknown, indent: number = 2): string {
    try {
      return JSON.stringify(obj, null, indent);
    } catch {
      return 'Erro ao formatar JSON';
    }
  }

  /**
   * Formata uma lista de itens em texto
   */
  static list(items: string[], separator: string = ', ', lastSeparator: string = ' e '): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0] || '';
    if (items.length === 2) return items.join(lastSeparator);

    const allButLast = items.slice(0, -1).join(separator);
    const last = items[items.length - 1];

    return `${allButLast}${lastSeparator}${last || ''}`;
  }

  /**
   * Formata bytes para formato legível mais específico
   */
  static bytesDetailed(bytes: number): { value: number; unit: string; formatted: string } {
    if (bytes === 0) return { value: 0, unit: 'Bytes', formatted: '0 Bytes' };

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    const unit = sizes[i] || 'Bytes';

    return {
      value,
      unit,
      formatted: `${value} ${unit}`,
    };
  }
}
