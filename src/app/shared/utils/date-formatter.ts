/**
 * 📅 UTILITÁRIO DE FORMATAÇÃO DE DATAS
 *
 * Funções centralizadas para formatação de datas em todo o sistema
 * com validação UTC e tratamento de erros robusto.
 */

export class DateFormatter {

    /**
     * 📅 FORMATAR DATA - Formata data para exibição (dd/MM/yyyy)
     *
     * @param date - Data em formato Date, string ou undefined
     * @returns String formatada em pt-BR ou '-' se inválida
     */
    static formatDate(date: Date | string | undefined): string {
        if (!date) return '-';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;


            if (isNaN(dateObj.getTime())) {
                return '-';
            }


            return dateObj.toLocaleDateString('pt-BR', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return '-';
        }
    }

    /**
     * ⏰ FORMATAR DATA E HORA - Formata data e hora para exibição (dd/MM/yyyy HH:mm)
     *
     * @param date - Data em formato Date, string ou undefined
     * @returns String formatada em pt-BR ou '-' se inválida
     */
    static formatDateTime(date: Date | string | undefined): string {
        if (!date) return '-';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;


            if (isNaN(dateObj.getTime())) {
                return '-';
            }


            return dateObj.toLocaleString('pt-BR', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    }

    /**
     * 🕐 FORMATAR HORA - Formata apenas a hora (HH:mm)
     *
     * @param date - Data em formato Date, string ou undefined
     * @returns String formatada em pt-BR ou '-' se inválida
     */
    static formatTime(date: Date | string | undefined): string {
        if (!date) return '-';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;


            if (isNaN(dateObj.getTime())) {
                return '-';
            }


            return dateObj.toLocaleTimeString('pt-BR', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    }

    /**
     * 📅 FORMATAR DATA PARA INPUT - Converte data para formato de input HTML (yyyy-MM-dd)
     *
     * @param date - Data em formato Date, string ou undefined
     * @returns String no formato yyyy-MM-dd ou string vazia se inválida
     */
    static formatDateForInput(date: Date | string | undefined): string {
        if (!date) return '';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;


            if (isNaN(dateObj.getTime())) {
                return '';
            }

            return dateObj.toISOString().split('T')[0];
        } catch {
            return '';
        }
    }

    /**
     * 🌍 FORMATAR DATA PARA ISO UTC - Converte data do input para formato ISO UTC
     *
     * @param dateString - Data em formato yyyy-MM-dd
     * @returns String no formato ISO UTC ou string vazia se inválida
     */
    static formatDateToISO(dateString: string): string {
        if (!dateString) return '';

        try {

            const date = new Date(dateString + 'T00:00:00');


            if (isNaN(date.getTime())) {
                return '';
            }


            return date.toISOString();
        } catch {
            return '';
        }
    }

    /**
     * 📅 OBTER DATA DE HOJE - Retorna data de hoje no formato de input
     *
     * @returns String no formato yyyy-MM-dd
     */
    static getTodayDateString(): string {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    /**
     * ✅ VALIDAR DATA - Verifica se uma data é válida
     *
     * @param date - Data em formato Date, string ou undefined
     * @returns true se a data é válida, false caso contrário
     */
    static isValidDate(date: Date | string | undefined): boolean {
        if (!date) return false;

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return !isNaN(dateObj.getTime());
        } catch {
            return false;
        }
    }

    /**
     * 🔍 VERIFICAR SE É FORMATO ISO UTC - Verifica se a string está no formato ISO UTC
     *
     * @param dateString - String de data
     * @returns true se está no formato ISO UTC, false caso contrário
     */
    static isISOUTCFormat(dateString: string): boolean {
        return typeof dateString === 'string' &&
            dateString.includes('T') &&
            dateString.endsWith('Z');
    }
}
