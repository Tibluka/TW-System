/**
 * Códigos de erro padronizados para a API
 * Formato: [Categoria][Subcategoria][Sequencial]
 * Categoria: 1=Validação, 2=Negócio, 3=Autenticação, 4=Autorização, 5=Recurso, 6=Sistema
 */
export const ERROR_CODES = {
    // VALIDAÇÃO (1xxx)
    VALIDATION_ERROR: 1001,
    INVALID_DATA: 1002,
    MISSING_REQUIRED_FIELD: 1003,
    INVALID_EMAIL_FORMAT: 1004,
    INVALID_PASSWORD_FORMAT: 1005,
    INVALID_DATE_FORMAT: 1006,
    INVALID_OBJECT_ID: 1007,
    INVALID_ENUM_VALUE: 1008,
    INVALID_STRING_LENGTH: 1009,
    INVALID_NUMBER_RANGE: 1010,
    INVALID_ARRAY_LENGTH: 1011,
    INVALID_FILE_TYPE: 1012,
    INVALID_FILE_SIZE: 1013,

    // NEGÓCIO (2xxx)
    DEVELOPMENT_NOT_APPROVED: 2001,
    PRODUCTION_ORDER_ALREADY_EXISTS: 2002,
    DELIVERY_SHEET_ALREADY_EXISTS: 2003,
    PRODUCTION_RECEIPT_ALREADY_EXISTS: 2004,
    INSUFFICIENT_PERMISSIONS: 2005,
    OPERATION_NOT_ALLOWED: 2006,
    BUSINESS_RULE_VIOLATION: 2007,
    DUPLICATE_ENTRY: 2008,
    INVALID_STATUS_TRANSITION: 2009,
    RESOURCE_IN_USE: 2010,
    INVALID_PRODUCTION_TYPE: 2011,
    MISSING_PRODUCTION_DATA: 2012,

    // AUTENTICAÇÃO (3xxx)
    AUTHENTICATION_REQUIRED: 3001,
    INVALID_CREDENTIALS: 3002,
    TOKEN_EXPIRED: 3003,
    TOKEN_INVALID: 3004,
    ACCOUNT_DISABLED: 3005,
    ACCOUNT_LOCKED: 3006,
    SESSION_EXPIRED: 3007,

    // AUTORIZAÇÃO (4xxx)
    INSUFFICIENT_PERMISSIONS_AUTH: 4001,
    ROLE_REQUIRED: 4002,
    ADMIN_REQUIRED: 4003,
    RESOURCE_ACCESS_DENIED: 4004,
    PROFILE_ACCESS_DENIED: 4005,
    PRINTING_RESTRICTION_VIOLATION: 4006,
    PRODUCTION_ORDER_STATUS_RESTRICTION: 4007,
    FIELD_UPDATE_RESTRICTION: 4008,
    ENDPOINT_ACCESS_DENIED: 4009,
    RESOURCE_CREATION_DENIED: 4010,

    // RECURSOS (5xxx)
    USER_NOT_FOUND: 5001,
    CLIENT_NOT_FOUND: 5002,
    DEVELOPMENT_NOT_FOUND: 5003,
    PRODUCTION_ORDER_NOT_FOUND: 5004,
    PRODUCTION_SHEET_NOT_FOUND: 5005,
    DELIVERY_SHEET_NOT_FOUND: 5006,
    PRODUCTION_RECEIPT_NOT_FOUND: 5007,
    FILE_NOT_FOUND: 5008,
    RESOURCE_NOT_FOUND: 5009,

    // SISTEMA (6xxx)
    DATABASE_ERROR: 6001,
    EXTERNAL_SERVICE_ERROR: 6002,
    FILE_UPLOAD_ERROR: 6003,
    EMAIL_SEND_ERROR: 6004,
    INTERNAL_SERVER_ERROR: 6005,
    SERVICE_UNAVAILABLE: 6006,
    TIMEOUT_ERROR: 6007,
    NETWORK_ERROR: 6008,
    CONFIGURATION_ERROR: 6009,
    RATE_LIMIT_EXCEEDED: 6010
} as const;

/**
 * Mapeamento de códigos de erro para mensagens amigáveis em português
 */
export const ERROR_MESSAGES: Record<number, { message: string; title: string; type: 'error' | 'warning' | 'info' }> = {
    // VALIDAÇÃO (1xxx)
    [ERROR_CODES.VALIDATION_ERROR]: {
        message: 'Os dados fornecidos são inválidos. Verifique as informações e tente novamente.',
        title: 'Erro de Validação',
        type: 'error'
    },
    [ERROR_CODES.INVALID_DATA]: {
        message: 'Os dados fornecidos são inválidos. Verifique as informações e tente novamente.',
        title: 'Dados Inválidos',
        type: 'error'
    },
    [ERROR_CODES.MISSING_REQUIRED_FIELD]: {
        message: 'Alguns campos obrigatórios estão faltando. Preencha todos os campos marcados com *.',
        title: 'Campos Obrigatórios',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_EMAIL_FORMAT]: {
        message: 'O formato do email é inválido. Verifique se o email está correto.',
        title: 'Email Inválido',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_PASSWORD_FORMAT]: {
        message: 'A senha deve ter pelo menos 6 caracteres.',
        title: 'Senha Inválida',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_DATE_FORMAT]: {
        message: 'O formato da data é inválido. Use o formato DD/MM/AAAA.',
        title: 'Data Inválida',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_OBJECT_ID]: {
        message: 'O identificador fornecido é inválido.',
        title: 'ID Inválido',
        type: 'error'
    },
    [ERROR_CODES.INVALID_ENUM_VALUE]: {
        message: 'O valor selecionado não é válido para este campo.',
        title: 'Valor Inválido',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_STRING_LENGTH]: {
        message: 'O texto deve ter entre {min} e {max} caracteres.',
        title: 'Tamanho Inválido',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_NUMBER_RANGE]: {
        message: 'O número deve estar entre {min} e {max}.',
        title: 'Valor Fora do Intervalo',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_ARRAY_LENGTH]: {
        message: 'A lista deve ter pelo menos {min} item(s).',
        title: 'Lista Vazia',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_FILE_TYPE]: {
        message: 'Tipo de arquivo não permitido. Apenas {types} são aceitos.',
        title: 'Tipo de Arquivo Inválido',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_FILE_SIZE]: {
        message: 'Arquivo muito grande. O tamanho máximo é {maxSize}MB.',
        title: 'Arquivo Muito Grande',
        type: 'warning'
    },

    // NEGÓCIO (2xxx)
    [ERROR_CODES.DEVELOPMENT_NOT_APPROVED]: {
        message: 'O desenvolvimento deve estar aprovado para criar uma ordem de produção.',
        title: 'Desenvolvimento Não Aprovado',
        type: 'warning'
    },
    [ERROR_CODES.PRODUCTION_ORDER_ALREADY_EXISTS]: {
        message: 'Já existe uma ordem de produção para este desenvolvimento.',
        title: 'Ordem de Produção Existente',
        type: 'warning'
    },
    [ERROR_CODES.DELIVERY_SHEET_ALREADY_EXISTS]: {
        message: 'Já existe uma ficha de entrega para esta ficha de produção.',
        title: 'Ficha de Entrega Existente',
        type: 'warning'
    },
    [ERROR_CODES.PRODUCTION_RECEIPT_ALREADY_EXISTS]: {
        message: 'Já existe um recibo de produção para esta ficha de entrega.',
        title: 'Recibo de Produção Existente',
        type: 'warning'
    },
    [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: {
        message: 'Você não tem permissão para realizar esta operação.',
        title: 'Permissão Insuficiente',
        type: 'error'
    },
    [ERROR_CODES.OPERATION_NOT_ALLOWED]: {
        message: 'Esta operação não é permitida no momento.',
        title: 'Operação Não Permitida',
        type: 'warning'
    },
    [ERROR_CODES.BUSINESS_RULE_VIOLATION]: {
        message: 'Esta operação viola uma regra de negócio do sistema.',
        title: 'Regra de Negócio',
        type: 'warning'
    },
    [ERROR_CODES.DUPLICATE_ENTRY]: {
        message: 'Já existe um registro com estes dados.',
        title: 'Registro Duplicado',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_STATUS_TRANSITION]: {
        message: 'Não é possível alterar o status de {from} para {to}.',
        title: 'Transição de Status Inválida',
        type: 'warning'
    },
    [ERROR_CODES.RESOURCE_IN_USE]: {
        message: 'Este recurso está sendo usado e não pode ser removido.',
        title: 'Recurso em Uso',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_PRODUCTION_TYPE]: {
        message: 'Tipo de produção inválido.',
        title: 'Tipo de Produção Inválido',
        type: 'error'
    },
    [ERROR_CODES.MISSING_PRODUCTION_DATA]: {
        message: 'Dados de produção obrigatórios estão faltando.',
        title: 'Dados de Produção Faltando',
        type: 'warning'
    },

    // AUTENTICAÇÃO (3xxx)
    [ERROR_CODES.AUTHENTICATION_REQUIRED]: {
        message: 'Você precisa estar logado para acessar esta funcionalidade.',
        title: 'Login Necessário',
        type: 'warning'
    },
    [ERROR_CODES.INVALID_CREDENTIALS]: {
        message: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
        title: 'Credenciais Inválidas',
        type: 'error'
    },
    [ERROR_CODES.TOKEN_EXPIRED]: {
        message: 'Sua sessão expirou. Faça login novamente.',
        title: 'Sessão Expirada',
        type: 'warning'
    },
    [ERROR_CODES.TOKEN_INVALID]: {
        message: 'Token de autenticação inválido. Faça login novamente.',
        title: 'Token Inválido',
        type: 'error'
    },
    [ERROR_CODES.ACCOUNT_DISABLED]: {
        message: 'Sua conta está desabilitada. Entre em contato com o administrador.',
        title: 'Conta Desabilitada',
        type: 'error'
    },
    [ERROR_CODES.ACCOUNT_LOCKED]: {
        message: 'Sua conta está bloqueada. Entre em contato com o administrador.',
        title: 'Conta Bloqueada',
        type: 'error'
    },
    [ERROR_CODES.SESSION_EXPIRED]: {
        message: 'Sua sessão expirou. Faça login novamente.',
        title: 'Sessão Expirada',
        type: 'warning'
    },

    // AUTORIZAÇÃO (4xxx)
    [ERROR_CODES.INSUFFICIENT_PERMISSIONS_AUTH]: {
        message: 'Você não tem permissão para acessar este recurso.',
        title: 'Acesso Negado',
        type: 'error'
    },
    [ERROR_CODES.ROLE_REQUIRED]: {
        message: 'Você precisa ter um perfil específico para acessar esta funcionalidade.',
        title: 'Perfil Necessário',
        type: 'warning'
    },
    [ERROR_CODES.ADMIN_REQUIRED]: {
        message: 'Apenas administradores podem acessar esta funcionalidade.',
        title: 'Acesso Restrito',
        type: 'error'
    },
    [ERROR_CODES.RESOURCE_ACCESS_DENIED]: {
        message: 'Você não tem permissão para acessar este recurso.',
        title: 'Acesso Negado',
        type: 'error'
    },
    [ERROR_CODES.PROFILE_ACCESS_DENIED]: {
        message: 'Seu perfil não tem acesso a esta funcionalidade.',
        title: 'Perfil Sem Acesso',
        type: 'warning'
    },
    [ERROR_CODES.PRINTING_RESTRICTION_VIOLATION]: {
        message: 'Perfil IMPRESSÃO tem restrições específicas para esta operação.',
        title: 'Restrição de Perfil',
        type: 'warning'
    },
    [ERROR_CODES.PRODUCTION_ORDER_STATUS_RESTRICTION]: {
        message: 'Você só pode alterar fichas de produção quando a ordem de produção estiver com status PRODUÇÃO_PILOTO.',
        title: 'Restrição de Status',
        type: 'warning'
    },
    [ERROR_CODES.FIELD_UPDATE_RESTRICTION]: {
        message: 'Perfil IMPRESSÃO só pode alterar os campos etapa e valor de máquina.',
        title: 'Restrição de Campos',
        type: 'warning'
    },
    [ERROR_CODES.ENDPOINT_ACCESS_DENIED]: {
        message: 'Apenas perfis específicos podem acessar esta funcionalidade.',
        title: 'Funcionalidade Restrita',
        type: 'error'
    },
    [ERROR_CODES.RESOURCE_CREATION_DENIED]: {
        message: 'Apenas administradores podem criar este tipo de recurso.',
        title: 'Criação Restrita',
        type: 'error'
    },

    // RECURSOS (5xxx)
    [ERROR_CODES.USER_NOT_FOUND]: {
        message: 'Usuário não encontrado.',
        title: 'Usuário Não Encontrado',
        type: 'error'
    },
    [ERROR_CODES.CLIENT_NOT_FOUND]: {
        message: 'Cliente não encontrado.',
        title: 'Cliente Não Encontrado',
        type: 'error'
    },
    [ERROR_CODES.DEVELOPMENT_NOT_FOUND]: {
        message: 'Desenvolvimento não encontrado.',
        title: 'Desenvolvimento Não Encontrado',
        type: 'error'
    },
    [ERROR_CODES.PRODUCTION_ORDER_NOT_FOUND]: {
        message: 'Ordem de produção não encontrada.',
        title: 'Ordem de Produção Não Encontrada',
        type: 'error'
    },
    [ERROR_CODES.PRODUCTION_SHEET_NOT_FOUND]: {
        message: 'Ficha de produção não encontrada.',
        title: 'Ficha de Produção Não Encontrada',
        type: 'error'
    },
    [ERROR_CODES.DELIVERY_SHEET_NOT_FOUND]: {
        message: 'Ficha de entrega não encontrada.',
        title: 'Ficha de Entrega Não Encontrada',
        type: 'error'
    },
    [ERROR_CODES.PRODUCTION_RECEIPT_NOT_FOUND]: {
        message: 'Recibo de produção não encontrado.',
        title: 'Recibo de Produção Não Encontrado',
        type: 'error'
    },
    [ERROR_CODES.FILE_NOT_FOUND]: {
        message: 'Arquivo não encontrado.',
        title: 'Arquivo Não Encontrado',
        type: 'error'
    },
    [ERROR_CODES.RESOURCE_NOT_FOUND]: {
        message: 'Recurso não encontrado.',
        title: 'Recurso Não Encontrado',
        type: 'error'
    },

    // SISTEMA (6xxx)
    [ERROR_CODES.DATABASE_ERROR]: {
        message: 'Erro interno do banco de dados. Tente novamente mais tarde.',
        title: 'Erro de Banco de Dados',
        type: 'error'
    },
    [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: {
        message: 'Erro em serviço externo. Tente novamente mais tarde.',
        title: 'Erro de Serviço Externo',
        type: 'error'
    },
    [ERROR_CODES.FILE_UPLOAD_ERROR]: {
        message: 'Erro ao fazer upload do arquivo. Tente novamente.',
        title: 'Erro de Upload',
        type: 'error'
    },
    [ERROR_CODES.EMAIL_SEND_ERROR]: {
        message: 'Erro ao enviar email. Tente novamente mais tarde.',
        title: 'Erro de Email',
        type: 'error'
    },
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
        title: 'Erro Interno',
        type: 'error'
    },
    [ERROR_CODES.SERVICE_UNAVAILABLE]: {
        message: 'Serviço temporariamente indisponível. Tente novamente mais tarde.',
        title: 'Serviço Indisponível',
        type: 'error'
    },
    [ERROR_CODES.TIMEOUT_ERROR]: {
        message: 'Tempo limite excedido. Tente novamente.',
        title: 'Tempo Limite',
        type: 'warning'
    },
    [ERROR_CODES.NETWORK_ERROR]: {
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        title: 'Erro de Conexão',
        type: 'error'
    },
    [ERROR_CODES.CONFIGURATION_ERROR]: {
        message: 'Erro de configuração do sistema. Entre em contato com o suporte.',
        title: 'Erro de Configuração',
        type: 'error'
    },
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
        message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        title: 'Limite Excedido',
        type: 'warning'
    }
};

/**
 * Função para obter código de erro baseado na mensagem
 * Prioriza mensagens em português
 */
export function getErrorCode(message: string): number {
    // Busca exata primeiro
    const exactMatch = ERROR_MESSAGE_TO_CODE[message];
    if (exactMatch) {
        return exactMatch;
    }

    // Busca parcial para mensagens que podem variar
    // Prioriza mensagens em português
    const portugueseKeys = Object.keys(ERROR_MESSAGE_TO_CODE).filter(key =>
        key.includes('não') || key.includes('inválido') || key.includes('erro') ||
        key.includes('permissão') || key.includes('acesso') || key.includes('encontrado')
    );

    const englishKeys = Object.keys(ERROR_MESSAGE_TO_CODE).filter(key =>
        !portugueseKeys.includes(key)
    );

    // Busca primeiro em português
    for (const key of portugueseKeys) {
        if (message.includes(key)) {
            return ERROR_MESSAGE_TO_CODE[key];
        }
    }

    // Depois busca em inglês
    for (const key of englishKeys) {
        if (message.includes(key)) {
            return ERROR_MESSAGE_TO_CODE[key];
        }
    }

    // Códigos padrão baseados em palavras-chave (português e inglês)
    if (message.includes('não encontrado') || message.includes('not found') ||
        message.includes('não existe') || message.includes('not exist')) {
        return ERROR_CODES.RESOURCE_NOT_FOUND;
    }

    if (message.includes('validação') || message.includes('validation') ||
        message.includes('inválido') || message.includes('invalid')) {
        return ERROR_CODES.VALIDATION_ERROR;
    }

    if (message.includes('permissão') || message.includes('permission') ||
        message.includes('não autorizado') || message.includes('unauthorized')) {
        return ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    }

    if (message.includes('duplicado') || message.includes('duplicate') ||
        message.includes('já existe') || message.includes('already exists')) {
        return ERROR_CODES.DUPLICATE_ENTRY;
    }

    if (message.includes('banco de dados') || message.includes('database') ||
        message.includes('conexão') || message.includes('connection')) {
        return ERROR_CODES.DATABASE_ERROR;
    }

    // Código padrão para erros não mapeados
    return ERROR_CODES.INTERNAL_SERVER_ERROR;
}

/**
 * Mapeamento de mensagens de erro para códigos (baseado no backend)
 * Inclui mensagens em inglês e português para compatibilidade
 */
const ERROR_MESSAGE_TO_CODE: Record<string, number> = {
    // Validação - Inglês
    'Invalid data': ERROR_CODES.INVALID_DATA,
    'Validation error': ERROR_CODES.VALIDATION_ERROR,
    'Required field is missing': ERROR_CODES.MISSING_REQUIRED_FIELD,
    'Invalid email format': ERROR_CODES.INVALID_EMAIL_FORMAT,
    'Invalid password format': ERROR_CODES.INVALID_PASSWORD_FORMAT,
    'Invalid date format': ERROR_CODES.INVALID_DATE_FORMAT,
    'Invalid ObjectId': ERROR_CODES.INVALID_OBJECT_ID,
    'Invalid enum value': ERROR_CODES.INVALID_ENUM_VALUE,
    'String length invalid': ERROR_CODES.INVALID_STRING_LENGTH,
    'Number out of range': ERROR_CODES.INVALID_NUMBER_RANGE,
    'Array length invalid': ERROR_CODES.INVALID_ARRAY_LENGTH,
    'Invalid file type': ERROR_CODES.INVALID_FILE_TYPE,
    'File too large': ERROR_CODES.INVALID_FILE_SIZE,

    // Validação - Português
    'Dados inválidos': ERROR_CODES.INVALID_DATA,
    'Erro de validação': ERROR_CODES.VALIDATION_ERROR,
    'Campo obrigatório não preenchido': ERROR_CODES.MISSING_REQUIRED_FIELD,
    'Formato de email inválido': ERROR_CODES.INVALID_EMAIL_FORMAT,
    'Formato de senha inválido': ERROR_CODES.INVALID_PASSWORD_FORMAT,
    'Formato de data inválido': ERROR_CODES.INVALID_DATE_FORMAT,
    'ID do objeto inválido': ERROR_CODES.INVALID_OBJECT_ID,
    'Valor de enum inválido': ERROR_CODES.INVALID_ENUM_VALUE,
    'Tamanho da string inválido': ERROR_CODES.INVALID_STRING_LENGTH,
    'Número fora do intervalo': ERROR_CODES.INVALID_NUMBER_RANGE,
    'Tamanho do array inválido': ERROR_CODES.INVALID_ARRAY_LENGTH,
    'Tipo de arquivo inválido': ERROR_CODES.INVALID_FILE_TYPE,
    'Arquivo muito grande': ERROR_CODES.INVALID_FILE_SIZE,

    // Negócio - Inglês
    'Development must be approved to create production order': ERROR_CODES.DEVELOPMENT_NOT_APPROVED,
    'Production order already exists for this development': ERROR_CODES.PRODUCTION_ORDER_ALREADY_EXISTS,
    'Delivery sheet already exists for this production sheet': ERROR_CODES.DELIVERY_SHEET_ALREADY_EXISTS,
    'Production receipt already exists for this delivery sheet': ERROR_CODES.PRODUCTION_RECEIPT_ALREADY_EXISTS,
    'Insufficient permissions': ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    'Operation not allowed': ERROR_CODES.OPERATION_NOT_ALLOWED,
    'Business rule violation': ERROR_CODES.BUSINESS_RULE_VIOLATION,
    'Duplicate entry': ERROR_CODES.DUPLICATE_ENTRY,
    'Invalid status transition': ERROR_CODES.INVALID_STATUS_TRANSITION,
    'Resource in use': ERROR_CODES.RESOURCE_IN_USE,
    'Invalid production type': ERROR_CODES.INVALID_PRODUCTION_TYPE,
    'Missing production data': ERROR_CODES.MISSING_PRODUCTION_DATA,

    // Negócio - Português
    'O desenvolvimento deve estar aprovado para criar ordem de produção': ERROR_CODES.DEVELOPMENT_NOT_APPROVED,
    'Já existe uma ordem de produção para este desenvolvimento': ERROR_CODES.PRODUCTION_ORDER_ALREADY_EXISTS,
    'Já existe uma ficha de entrega para esta ficha de produção': ERROR_CODES.DELIVERY_SHEET_ALREADY_EXISTS,
    'Já existe um recibo de produção para esta ficha de entrega': ERROR_CODES.PRODUCTION_RECEIPT_ALREADY_EXISTS,
    'Permissões insuficientes': ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    'Operação não permitida': ERROR_CODES.OPERATION_NOT_ALLOWED,
    'Violação de regra de negócio': ERROR_CODES.BUSINESS_RULE_VIOLATION,
    'Entrada duplicada': ERROR_CODES.DUPLICATE_ENTRY,
    'Transição de status inválida': ERROR_CODES.INVALID_STATUS_TRANSITION,
    'Recurso em uso': ERROR_CODES.RESOURCE_IN_USE,
    'Tipo de produção inválido': ERROR_CODES.INVALID_PRODUCTION_TYPE,
    'Dados de produção obrigatórios não fornecidos': ERROR_CODES.MISSING_PRODUCTION_DATA,

    // Autenticação - Inglês
    'Authentication required': ERROR_CODES.AUTHENTICATION_REQUIRED,
    'Invalid credentials': ERROR_CODES.INVALID_CREDENTIALS,
    'Token expired': ERROR_CODES.TOKEN_EXPIRED,
    'Invalid token': ERROR_CODES.TOKEN_INVALID,
    'Account disabled': ERROR_CODES.ACCOUNT_DISABLED,
    'Account locked': ERROR_CODES.ACCOUNT_LOCKED,
    'Session expired': ERROR_CODES.SESSION_EXPIRED,

    // Autenticação - Português
    'Autenticação necessária': ERROR_CODES.AUTHENTICATION_REQUIRED,
    'Credenciais inválidas': ERROR_CODES.INVALID_CREDENTIALS,
    'Token expirado': ERROR_CODES.TOKEN_EXPIRED,
    'Token inválido': ERROR_CODES.TOKEN_INVALID,
    'Conta desabilitada': ERROR_CODES.ACCOUNT_DISABLED,
    'Conta bloqueada': ERROR_CODES.ACCOUNT_LOCKED,
    'Sessão expirada': ERROR_CODES.SESSION_EXPIRED,

    // Autorização - Inglês
    'Role required': ERROR_CODES.ROLE_REQUIRED,
    'Admin required': ERROR_CODES.ADMIN_REQUIRED,
    'Resource access denied': ERROR_CODES.RESOURCE_ACCESS_DENIED,

    // Autorização - Português
    'Função específica necessária': ERROR_CODES.ROLE_REQUIRED,
    'Acesso de administrador necessário': ERROR_CODES.ADMIN_REQUIRED,
    'Acesso ao recurso negado': ERROR_CODES.RESOURCE_ACCESS_DENIED,
    'Acesso negado. Seu perfil': ERROR_CODES.PROFILE_ACCESS_DENIED,
    'Perfil IMPRESSÃO só pode alterar os campos': ERROR_CODES.FIELD_UPDATE_RESTRICTION,
    'Você só pode alterar fichas de produção quando a ordem de produção estiver com status PRODUÇÃO_PILOTO': ERROR_CODES.PRODUCTION_ORDER_STATUS_RESTRICTION,
    'Acesso negado. Apenas perfis': ERROR_CODES.ENDPOINT_ACCESS_DENIED,
    'Apenas administradores podem criar usuários': ERROR_CODES.RESOURCE_CREATION_DENIED,

    // Recursos - Inglês
    'User not found': ERROR_CODES.USER_NOT_FOUND,
    'Client not found': ERROR_CODES.CLIENT_NOT_FOUND,
    'Development not found': ERROR_CODES.DEVELOPMENT_NOT_FOUND,
    'Production order not found': ERROR_CODES.PRODUCTION_ORDER_NOT_FOUND,
    'Production sheet not found': ERROR_CODES.PRODUCTION_SHEET_NOT_FOUND,
    'Delivery sheet not found': ERROR_CODES.DELIVERY_SHEET_NOT_FOUND,
    'Production receipt not found': ERROR_CODES.PRODUCTION_RECEIPT_NOT_FOUND,
    'File not found': ERROR_CODES.FILE_NOT_FOUND,
    'Resource not found': ERROR_CODES.RESOURCE_NOT_FOUND,

    // Recursos - Português
    'Usuário não encontrado': ERROR_CODES.USER_NOT_FOUND,
    'Cliente não encontrado': ERROR_CODES.CLIENT_NOT_FOUND,
    'Desenvolvimento não encontrado': ERROR_CODES.DEVELOPMENT_NOT_FOUND,
    'Ordem de produção não encontrada': ERROR_CODES.PRODUCTION_ORDER_NOT_FOUND,
    'Ficha de produção não encontrada': ERROR_CODES.PRODUCTION_SHEET_NOT_FOUND,
    'Ficha de entrega não encontrada': ERROR_CODES.DELIVERY_SHEET_NOT_FOUND,
    'Recibo de produção não encontrado': ERROR_CODES.PRODUCTION_RECEIPT_NOT_FOUND,
    'Arquivo não encontrado': ERROR_CODES.FILE_NOT_FOUND,
    'Recurso não encontrado': ERROR_CODES.RESOURCE_NOT_FOUND,

    // Sistema - Inglês
    'Database error': ERROR_CODES.DATABASE_ERROR,
    'External service error': ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    'File upload error': ERROR_CODES.FILE_UPLOAD_ERROR,
    'Email send error': ERROR_CODES.EMAIL_SEND_ERROR,
    'Internal server error': ERROR_CODES.INTERNAL_SERVER_ERROR,
    'Service unavailable': ERROR_CODES.SERVICE_UNAVAILABLE,
    'Timeout error': ERROR_CODES.TIMEOUT_ERROR,
    'Network error': ERROR_CODES.NETWORK_ERROR,
    'Configuration error': ERROR_CODES.CONFIGURATION_ERROR,
    'Too many requests': ERROR_CODES.RATE_LIMIT_EXCEEDED,

    // Sistema - Português
    'Erro de banco de dados': ERROR_CODES.DATABASE_ERROR,
    'Erro em serviço externo': ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    'Erro ao fazer upload do arquivo': ERROR_CODES.FILE_UPLOAD_ERROR,
    'Erro ao enviar email': ERROR_CODES.EMAIL_SEND_ERROR,
    'Erro interno do servidor': ERROR_CODES.INTERNAL_SERVER_ERROR,
    'Serviço indisponível': ERROR_CODES.SERVICE_UNAVAILABLE,
    'Erro de tempo limite': ERROR_CODES.TIMEOUT_ERROR,
    'Erro de rede': ERROR_CODES.NETWORK_ERROR,
    'Erro de configuração': ERROR_CODES.CONFIGURATION_ERROR,
    'Muitas tentativas': ERROR_CODES.RATE_LIMIT_EXCEEDED
};
