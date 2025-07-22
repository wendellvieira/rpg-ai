/**
 * ✅ Date Helper - Utilitários para manipulação de datas
 *
 * Helper estático com funções puras para manipulação, formatação
 * e cálculos com datas.
 */

export type DateFormat =
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'DD/MM/YY'
  | 'MM/DD/YY'
  | 'DD.MM.YYYY'
  | 'YYYY/MM/DD';

export type TimeFormat = 'HH:mm' | 'HH:mm:ss' | 'hh:mm A' | 'hh:mm:ss A';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeDifference {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
  };
}

export class DateHelper {
  /**
   * Formatar data conforme padrão especificado
   */
  static format(date: Date | string, format: DateFormat = 'DD/MM/YYYY'): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const yearShort = String(year).slice(-2);

    const formatMap: Record<DateFormat, string> = {
      'DD/MM/YYYY': `${day}/${month}/${year}`,
      'MM/DD/YYYY': `${month}/${day}/${year}`,
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'DD-MM-YYYY': `${day}-${month}-${year}`,
      'DD/MM/YY': `${day}/${month}/${yearShort}`,
      'MM/DD/YY': `${month}/${day}/${yearShort}`,
      'DD.MM.YYYY': `${day}.${month}.${year}`,
      'YYYY/MM/DD': `${year}/${month}/${day}`,
    };

    return formatMap[format];
  }

  /**
   * Formatar horário conforme padrão especificado
   */
  static formatTime(date: Date | string, format: TimeFormat = 'HH:mm'): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return 'Horário inválido';
    }

    const hours24 = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';

    const formatMap: Record<TimeFormat, string> = {
      'HH:mm': `${String(hours24).padStart(2, '0')}:${minutes}`,
      'HH:mm:ss': `${String(hours24).padStart(2, '0')}:${minutes}:${seconds}`,
      'hh:mm A': `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`,
      'hh:mm:ss A': `${String(hours12).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`,
    };

    return formatMap[format];
  }

  /**
   * Formatar data e hora juntas
   */
  static formatDateTime(
    date: Date | string,
    dateFormat: DateFormat = 'DD/MM/YYYY',
    timeFormat: TimeFormat = 'HH:mm',
  ): string {
    const formattedDate = this.format(date, dateFormat);
    const formattedTime = this.formatTime(date, timeFormat);

    if (formattedDate === 'Data inválida' || formattedTime === 'Horário inválido') {
      return 'Data/Hora inválida';
    }

    return `${formattedDate} ${formattedTime}`;
  }

  /**
   * Parselar data de string formatada
   */
  static parse(dateString: string, format: DateFormat = 'DD/MM/YYYY'): Date | null {
    let day: number, month: number, year: number;

    try {
      switch (format) {
        case 'DD/MM/YYYY':
        case 'DD/MM/YY': {
          const parts = dateString.split('/');
          day = parseInt(parts[0] || '0');
          month = parseInt(parts[1] || '0') - 1;
          year = parseInt(parts[2] || '0');
          if (format === 'DD/MM/YY' && year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          break;
        }
        case 'MM/DD/YYYY':
        case 'MM/DD/YY': {
          const parts = dateString.split('/');
          month = parseInt(parts[0] || '0') - 1;
          day = parseInt(parts[1] || '0');
          year = parseInt(parts[2] || '0');
          if (format === 'MM/DD/YY' && year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          break;
        }
        case 'YYYY-MM-DD': {
          const parts = dateString.split('-');
          year = parseInt(parts[0] || '0');
          month = parseInt(parts[1] || '0') - 1;
          day = parseInt(parts[2] || '0');
          break;
        }
        case 'DD-MM-YYYY': {
          const parts = dateString.split('-');
          day = parseInt(parts[0] || '0');
          month = parseInt(parts[1] || '0') - 1;
          year = parseInt(parts[2] || '0');
          break;
        }
        case 'DD.MM.YYYY': {
          const parts = dateString.split('.');
          day = parseInt(parts[0] || '0');
          month = parseInt(parts[1] || '0') - 1;
          year = parseInt(parts[2] || '0');
          break;
        }
        case 'YYYY/MM/DD': {
          const parts = dateString.split('/');
          year = parseInt(parts[0] || '0');
          month = parseInt(parts[1] || '0') - 1;
          day = parseInt(parts[2] || '0');
          break;
        }
        default:
          return null;
      }

      const date = new Date(year, month, day);

      // Verificar se a data é válida
      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  }

  /**
   * Adicionar tempo a uma data
   */
  static add(
    date: Date | string,
    amount: number,
    unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds',
  ): Date {
    const d = new Date(date);

    switch (unit) {
      case 'years':
        d.setFullYear(d.getFullYear() + amount);
        break;
      case 'months':
        d.setMonth(d.getMonth() + amount);
        break;
      case 'days':
        d.setDate(d.getDate() + amount);
        break;
      case 'hours':
        d.setHours(d.getHours() + amount);
        break;
      case 'minutes':
        d.setMinutes(d.getMinutes() + amount);
        break;
      case 'seconds':
        d.setSeconds(d.getSeconds() + amount);
        break;
      case 'milliseconds':
        d.setMilliseconds(d.getMilliseconds() + amount);
        break;
    }

    return d;
  }

  /**
   * Subtrair tempo de uma data
   */
  static subtract(
    date: Date | string,
    amount: number,
    unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds',
  ): Date {
    return this.add(date, -amount, unit);
  }

  /**
   * Calcular diferença entre duas datas
   */
  static diff(date1: Date | string, date2: Date | string): TimeDifference {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const diffMs = Math.abs(d2.getTime() - d1.getTime());

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      total: {
        milliseconds: diffMs,
        seconds: totalSeconds,
        minutes: totalMinutes,
        hours: totalHours,
        days: totalDays,
      },
    };
  }

  /**
   * Obter início do dia
   */
  static startOfDay(date: Date | string): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Obter fim do dia
   */
  static endOfDay(date: Date | string): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Obter início da semana (domingo)
   */
  static startOfWeek(date: Date | string): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  /**
   * Obter fim da semana (sábado)
   */
  static endOfWeek(date: Date | string): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    return this.endOfDay(new Date(d.setDate(diff)));
  }

  /**
   * Obter início do mês
   */
  static startOfMonth(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  /**
   * Obter fim do mês
   */
  static endOfMonth(date: Date | string): Date {
    const d = new Date(date);
    return this.endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  }

  /**
   * Obter início do ano
   */
  static startOfYear(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), 0, 1);
  }

  /**
   * Obter fim do ano
   */
  static endOfYear(date: Date | string): Date {
    const d = new Date(date);
    return this.endOfDay(new Date(d.getFullYear(), 11, 31));
  }

  /**
   * Verificar se duas datas são do mesmo dia
   */
  static isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  /**
   * Verificar se duas datas são do mesmo mês
   */
  static isSameMonth(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  }

  /**
   * Verificar se duas datas são do mesmo ano
   */
  static isSameYear(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1.getFullYear() === d2.getFullYear();
  }

  /**
   * Verificar se uma data está entre duas outras
   */
  static isBetween(
    date: Date | string,
    start: Date | string,
    end: Date | string,
    inclusive = true,
  ): boolean {
    const d = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (inclusive) {
      return d >= startDate && d <= endDate;
    } else {
      return d > startDate && d < endDate;
    }
  }

  /**
   * Verificar se uma data é hoje
   */
  static isToday(date: Date | string): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Verificar se uma data é ontem
   */
  static isYesterday(date: Date | string): boolean {
    const yesterday = this.subtract(new Date(), 1, 'days');
    return this.isSameDay(date, yesterday);
  }

  /**
   * Verificar se uma data é amanhã
   */
  static isTomorrow(date: Date | string): boolean {
    const tomorrow = this.add(new Date(), 1, 'days');
    return this.isSameDay(date, tomorrow);
  }

  /**
   * Verificar se uma data é um fim de semana
   */
  static isWeekend(date: Date | string): boolean {
    const d = new Date(date);
    const day = d.getDay();
    return day === 0 || day === 6; // domingo ou sábado
  }

  /**
   * Verificar se uma data é um dia útil
   */
  static isWeekday(date: Date | string): boolean {
    return !this.isWeekend(date);
  }

  /**
   * Obter a idade em anos
   */
  static age(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Obter lista de datas em um range
   */
  static dateRange(start: Date | string, end: Date | string): Date[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dates: Date[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  /**
   * Formatar duração em formato humanizado
   */
  static formatDuration(duration: TimeDifference): string {
    const parts: string[] = [];

    if (duration.years > 0) {
      parts.push(`${duration.years} ano${duration.years > 1 ? 's' : ''}`);
    }
    if (duration.months > 0) {
      parts.push(`${duration.months} mês${duration.months > 1 ? 'es' : ''}`);
    }
    if (duration.days > 0) {
      parts.push(`${duration.days} dia${duration.days > 1 ? 's' : ''}`);
    }
    if (duration.hours > 0) {
      parts.push(`${duration.hours} hora${duration.hours > 1 ? 's' : ''}`);
    }
    if (duration.minutes > 0) {
      parts.push(`${duration.minutes} minuto${duration.minutes > 1 ? 's' : ''}`);
    }
    if (duration.seconds > 0 && parts.length === 0) {
      parts.push(`${duration.seconds} segundo${duration.seconds > 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return 'agora mesmo';
    }

    if (parts.length === 1) {
      return parts[0] || '';
    }

    const lastPart = parts.pop();
    return `${parts.join(', ')} e ${lastPart}`;
  }

  /**
   * Formatar data em formato relativo (ex: "há 2 dias")
   */
  static timeAgo(date: Date | string): string {
    const now = new Date();
    const diff = this.diff(date, now);

    if (diff.total.seconds < 60) {
      return 'agora mesmo';
    }

    if (diff.total.minutes < 60) {
      return `há ${diff.total.minutes} minuto${diff.total.minutes > 1 ? 's' : ''}`;
    }

    if (diff.total.hours < 24) {
      return `há ${diff.total.hours} hora${diff.total.hours > 1 ? 's' : ''}`;
    }

    if (diff.total.days < 7) {
      return `há ${diff.total.days} dia${diff.total.days > 1 ? 's' : ''}`;
    }

    if (diff.total.days < 30) {
      const weeks = Math.floor(diff.total.days / 7);
      return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }

    if (diff.total.days < 365) {
      const months = Math.floor(diff.total.days / 30);
      return `há ${months} mês${months > 1 ? 'es' : ''}`;
    }

    const years = Math.floor(diff.total.days / 365);
    return `há ${years} ano${years > 1 ? 's' : ''}`;
  }

  /**
   * Obter fuso horário
   */
  static getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Converter para UTC
   */
  static toUTC(date: Date | string): Date {
    const d = new Date(date);
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
    );
  }

  /**
   * Converter de UTC para fuso local
   */
  static fromUTC(date: Date | string): Date {
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset);
  }
}
