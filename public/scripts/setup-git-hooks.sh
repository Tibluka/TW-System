#!/bin/bash

# Setup Git Hooks - Script para configurar Git Hooks de limpeza automática
# Versão mais detalhada com opções avançadas
# Salvar como: public/scripts/setup-git-hooks.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
HOOK_TYPE="pre-push"
CREATE_BACKUP=true
AUTO_TEST=false
VERBOSE=false

# Função para mostrar help
show_help() {
    echo -e "${BLUE}🔧 Setup Git Hooks - Configurador Avançado de Git Hooks${NC}"
    echo ""
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  -h, --help          Mostra esta ajuda"
    echo "  -t, --type TYPE     Tipo do hook (pre-push, pre-commit, post-commit)"
    echo "  -n, --no-backup     Não criar backup de hooks existentes"
    echo "  -a, --auto-test     Executar teste automaticamente após instalação"
    echo "  -v, --verbose       Modo verboso (mais detalhes)"
    echo ""
    echo "Exemplos:"
    echo "  $0                          # Configuração padrão (pre-push)"
    echo "  $0 --type pre-commit        # Hook para pre-commit"
    echo "  $0 --no-backup --auto-test  # Sem backup, com teste automático"
    echo ""
    echo "Tipos de hook disponíveis:"
    echo "  • pre-push     - Executa antes do push (padrão)"
    echo "  • pre-commit   - Executa antes do commit"
    echo "  • post-commit  - Executa após o commit"
}

# Função para log verboso
verbose_log() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[DEBUG] $1${NC}"
    fi
}

# Função para verificar dependências
check_dependencies() {
    verbose_log "Verificando dependências..."
    
    # Verifica se é um repositório Git
    if [ ! -d ".git" ]; then
        echo -e "${RED}❌ Este não é um repositório Git!${NC}"
        echo -e "${YELLOW}   Execute 'git init' primeiro.${NC}"
        exit 1
    fi
    
    # Verifica se git está instalado
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git não está instalado!${NC}"
        exit 1
    fi
    
    verbose_log "Dependências OK"
}

# Função para encontrar o script de limpeza
find_cleaner_script() {
    verbose_log "Procurando script de limpeza..."
    
    local cleaner_paths=(
        "./public/scripts/code-cleaner.sh"
        "./public/scripts/clean-code.sh"
        "./scripts/code-cleaner.sh"
        "./scripts/clean-code.sh"
        "./public/cleaner.sh"
        "./cleaner.sh"
        "./code-cleaner.sh"
        "./clean-code.sh"
    )
    
    for path in "${cleaner_paths[@]}"; do
        if [ -f "$path" ]; then
            echo -e "${GREEN}✅ Encontrado script de limpeza: $path${NC}"
            CLEANER_PATH="$path"
            return 0
        fi
    done
    
    echo -e "${RED}❌ Script de limpeza não encontrado!${NC}"
    echo -e "${YELLOW}   Procurei nos seguintes locais:${NC}"
    for path in "${cleaner_paths[@]}"; do
        echo -e "   • $path"
    done
    echo ""
    echo -e "${BLUE}💡 Certifique-se de que o script existe em um desses locais.${NC}"
    return 1
}

# Função para criar backup
create_hook_backup() {
    local hook_file=".git/hooks/$HOOK_TYPE"
    
    if [ -f "$hook_file" ]; then
        if [ "$CREATE_BACKUP" = true ]; then
            local backup_file="${hook_file}.backup.$(date +%s)"
            echo -e "${YELLOW}📋 Criando backup do hook existente...${NC}"
            cp "$hook_file" "$backup_file"
            echo -e "${GREEN}✅ Backup criado: $backup_file${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Substituindo hook existente sem backup...${NC}"
            return 0
        fi
    fi
    
    verbose_log "Nenhum hook existente encontrado"
    return 0
}

# Função para gerar conteúdo do hook baseado no tipo
generate_hook_content() {
    local hook_type="$1"
    
    case $hook_type in
        "pre-push")
            cat << 'EOF'
#!/bin/bash

# Git Pre-Push Hook - Limpa código antes do push
# Gerado automaticamente pelo setup-git-hooks.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 [PRE-PUSH] Executando limpeza de código...${NC}\n"

# Procura pelo script de limpeza
CLEANER_SCRIPT=""
SEARCH_PATHS=(
    "./public/scripts/code-cleaner.sh"
    "./public/scripts/clean-code.sh"
    "./scripts/code-cleaner.sh"
    "./scripts/clean-code.sh"
    "./public/cleaner.sh"
    "./cleaner.sh"
    "./code-cleaner.sh"
    "./clean-code.sh"
)

for path in "${SEARCH_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CLEANER_SCRIPT="$path"
        break
    fi
done

if [ -z "$CLEANER_SCRIPT" ]; then
    echo -e "${RED}❌ Script de limpeza não encontrado!${NC}"
    echo -e "${YELLOW}   Execute o setup-git-hooks.sh novamente para reconfigurar.${NC}"
    exit 1
fi

# Executa o script de limpeza
echo -e "${YELLOW}🧹 Executando: $CLEANER_SCRIPT${NC}"
if $CLEANER_SCRIPT; then
    echo -e "${GREEN}✅ Limpeza concluída com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro durante a limpeza do código${NC}"
    echo -e "${YELLOW}⚠️  Push cancelado. Corrija os erros e tente novamente.${NC}"
    exit 1
fi

# Verifica mudanças pós-limpeza
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✅ Nenhuma mudança detectada. Prosseguindo com o push...${NC}"
else
    echo -e "${YELLOW}⚠️  Código foi limpo e há mudanças não commitadas.${NC}"
    echo -e "${BLUE}📝 Opções disponíveis:${NC}"
    echo -e "   1. ${GREEN}Continuar o push${NC} (mudanças são apenas limpeza)"
    echo -e "   2. ${YELLOW}Cancelar e commitar mudanças${NC}"
    echo ""
    
    git diff --stat --color=always | head -10
    if [ $(git diff --stat | wc -l) -gt 10 ]; then
        echo -e "${YELLOW}   ... e mais arquivos${NC}"
    fi
    echo ""
    
    read -p "🤔 Continuar com o push? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🛑 Push cancelado.${NC}"
        echo -e "${BLUE}💡 Para commitar as mudanças:${NC}"
        echo -e "   ${GREEN}git add .${NC}"
        echo -e "   ${GREEN}git commit -m \"🧹 Limpeza automática\"${NC}"
        echo -e "   ${GREEN}git push${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🚀 Prosseguindo com o push...${NC}\n"
exit 0
EOF
            ;;
        "pre-commit")
            cat << 'EOF'
#!/bin/bash

# Git Pre-Commit Hook - Limpa código antes do commit
# Gerado automaticamente pelo setup-git-hooks.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 [PRE-COMMIT] Limpeza automática de código...${NC}\n"

# Procura script de limpeza
CLEANER_SCRIPT=""
for path in "./public/scripts/code-cleaner.sh" "./cleaner.sh" "./code-cleaner.sh"; do
    if [ -f "$path" ]; then
        CLEANER_SCRIPT="$path"
        break
    fi
done

if [ -z "$CLEANER_SCRIPT" ]; then
    echo -e "${RED}❌ Script de limpeza não encontrado!${NC}"
    exit 1
fi

# Executa limpeza
if $CLEANER_SCRIPT; then
    echo -e "${GREEN}✅ Código limpo! Prosseguindo com o commit...${NC}"
else
    echo -e "${RED}❌ Erro na limpeza. Commit cancelado.${NC}"
    exit 1
fi
EOF
            ;;
        "post-commit")
            cat << 'EOF'
#!/bin/bash

# Git Post-Commit Hook - Executa após o commit
# Gerado automaticamente pelo setup-git-hooks.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}ℹ️  [POST-COMMIT] Commit realizado com sucesso!${NC}"
echo -e "${GREEN}📝 Último commit: $(git log -1 --pretty=format:'%h - %s')${NC}"
EOF
            ;;
        *)
            echo -e "${RED}❌ Tipo de hook não suportado: $hook_type${NC}"
            return 1
            ;;
    esac
}

# Função para instalar o hook
install_hook() {
    verbose_log "Instalando hook $HOOK_TYPE..."
    
    local hook_file=".git/hooks/$HOOK_TYPE"
    
    # Cria diretório hooks se não existir
    mkdir -p .git/hooks
    
    # Gera e salva o conteúdo do hook
    if generate_hook_content "$HOOK_TYPE" > "$hook_file"; then
        chmod +x "$hook_file"
        echo -e "${GREEN}✅ Hook $HOOK_TYPE instalado com sucesso!${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro ao instalar hook $HOOK_TYPE${NC}"
        return 1
    fi
}

# Função para testar o hook
test_hook() {
    local hook_file=".git/hooks/$HOOK_TYPE"
    
    echo -e "${BLUE}🧪 Testando hook $HOOK_TYPE...${NC}"
    echo -e "${YELLOW}⚠️  Este é apenas um teste, não afetará o repositório.${NC}\n"
    
    if [ -x "$hook_file" ]; then
        if "$hook_file"; then
            echo -e "\n${GREEN}✅ Teste do hook executado com sucesso!${NC}"
            return 0
        else
            echo -e "\n${RED}❌ Falha no teste do hook.${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Hook não encontrado ou sem permissão de execução.${NC}"
        return 1
    fi
}

# Função para mostrar resumo da instalação
show_installation_summary() {
    echo ""
    echo -e "${PURPLE}📋 RESUMO DA INSTALAÇÃO${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "Hook instalado:     ${GREEN}$HOOK_TYPE${NC}"
    echo -e "Script de limpeza:  ${GREEN}$CLEANER_PATH${NC}"
    echo -e "Local do hook:      ${GREEN}.git/hooks/$HOOK_TYPE${NC}"
    echo -e "Backup criado:      ${GREEN}$CREATE_BACKUP${NC}"
    echo ""
    echo -e "${YELLOW}🔄 Comandos úteis:${NC}"
    echo -e "  Testar hook:      ${GREEN}.git/hooks/$HOOK_TYPE${NC}"
    if [ "$HOOK_TYPE" = "pre-push" ]; then
        echo -e "  Push sem hook:    ${GREEN}git push --no-verify${NC}"
    elif [ "$HOOK_TYPE" = "pre-commit" ]; then
        echo -e "  Commit sem hook:  ${GREEN}git commit --no-verify${NC}"
    fi
    echo -e "  Remover hook:     ${GREEN}rm .git/hooks/$HOOK_TYPE${NC}"
    echo -e "  Reconfigurar:     ${GREEN}$0${NC}"
    echo ""
    echo -e "${GREEN}🎉 Configuração concluída com sucesso!${NC}"
}

# Função principal
main() {
    echo -e "${BLUE}🔧 Setup Git Hooks - Configuração Avançada${NC}\n"
    
    # Verifica dependências
    check_dependencies
    
    # Encontra script de limpeza
    if ! find_cleaner_script; then
        exit 1
    fi
    
    # Verifica permissões do script
    if [ ! -x "$CLEANER_PATH" ]; then
        echo -e "${YELLOW}⚠️  Dando permissão de execução para $CLEANER_PATH${NC}"
        chmod +x "$CLEANER_PATH"
    fi
    
    # Cria backup se necessário
    if ! create_hook_backup; then
        exit 1
    fi
    
    # Pergunta confirmação se hook já existe
    if [ -f ".git/hooks/$HOOK_TYPE" ] && [ "$CREATE_BACKUP" = false ]; then
        read -p "🤔 Hook $HOOK_TYPE já existe. Substituir? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}🛑 Instalação cancelada.${NC}"
            exit 1
        fi
    fi
    
    # Instala o hook
    if ! install_hook; then
        exit 1
    fi
    
    # Testa se solicitado
    if [ "$AUTO_TEST" = true ]; then
        test_hook
    else
        read -p "🤔 Quer testar o hook agora? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            test_hook
        fi
    fi
    
    # Mostra resumo
    show_installation_summary
}

# Parse dos argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--type)
            HOOK_TYPE="$2"
            shift 2
            ;;
        -n|--no-backup)
            CREATE_BACKUP=false
            shift
            ;;
        -a|--auto-test)
            AUTO_TEST=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo -e "${RED}❌ Opção desconhecida: $1${NC}"
            echo "Use $0 --help para ver as opções disponíveis."
            exit 1
            ;;
    esac
done

# Executa função principal
main