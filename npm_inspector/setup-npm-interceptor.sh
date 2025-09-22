#!/bin/bash
# setup-npm-interceptor.sh - Script de configuração automática

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTERCEPTOR_SCRIPT="$SCRIPT_DIR/npm-smart-interceptor.sh"

echo -e "${BLUE}🚀 Configurando NPM Smart Interceptor${NC}"

# 1. Verificar se o script principal existe
if [[ ! -f "$INTERCEPTOR_SCRIPT" ]]; then
    echo -e "${RED}❌ Script npm-smart-interceptor.sh não encontrado!${NC}"
    exit 1
fi

# 2. Tornar executável
chmod +x "$INTERCEPTOR_SCRIPT"
echo -e "${GREEN}✅ Script tornou-se executável${NC}"

# 3. Instalar dependências do sistema
echo -e "${BLUE}📦 Verificando dependências...${NC}"

install_deps() {
    if command -v apt &> /dev/null; then
        # Ubuntu/Debian
        echo -e "${BLUE}📦 Instalando dependências no Ubuntu/Debian...${NC}"
        sudo apt update && sudo apt install -y jq curl
    elif command -v brew &> /dev/null; then
        # macOS
        echo -e "${BLUE}📦 Instalando dependências no macOS...${NC}"
        brew install jq curl
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        echo -e "${BLUE}📦 Instalando dependências no CentOS/RHEL...${NC}"
        sudo yum install -y jq curl
    else
        echo -e "${YELLOW}⚠️  Sistema não reconhecido. Instale manualmente: jq, curl${NC}"
        exit 1
    fi
}

# Verificar se jq e curl estão instalados
if ! command -v jq &> /dev/null || ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}⚠️  Dependências faltando. Instalando...${NC}"
    install_deps
fi

echo -e "${GREEN}✅ Dependências verificadas${NC}"

# 4. Configurar alias automático
setup_alias() {
    local shell_config=""
    local shell_name=$(basename "$SHELL")
    
    case $shell_name in
        "bash")
            shell_config="$HOME/.bashrc"
            ;;
        "zsh")
            shell_config="$HOME/.zshrc"
            ;;
        "fish")
            shell_config="$HOME/.config/fish/config.fish"
            echo -e "${YELLOW}⚠️  Fish shell detectado. Configuração manual necessária${NC}"
            return
            ;;
        *)
            echo -e "${YELLOW}⚠️  Shell não reconhecido: $shell_name${NC}"
            return
            ;;
    esac
    
    if [[ -n "$shell_config" ]]; then
        echo -e "${BLUE}🔧 Configurando alias no $shell_config...${NC}"
        
        # Backup do arquivo de configuração
        cp "$shell_config" "$shell_config.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Adicionar alias se não existir
        if ! grep -q "npm-smart-interceptor" "$shell_config" 2>/dev/null; then
            echo "" >> "$shell_config"
            echo "# NPM Smart Interceptor - Auto-generated" >> "$shell_config"
            echo "alias npm='$INTERCEPTOR_SCRIPT'" >> "$shell_config"
            echo "# Função para desabilitar temporariamente o interceptor" >> "$shell_config"
            echo "npm-direct() { command npm \"\$@\"; }" >> "$shell_config"
            
            echo -e "${GREEN}✅ Alias configurado em $shell_config${NC}"
            echo -e "${YELLOW}💡 Execute 'source $shell_config' ou reinicie o terminal${NC}"
        else
            echo -e "${YELLOW}⚠️  Alias já configurado em $shell_config${NC}"
        fi
    fi
}

# 5. Perguntar sobre configuração da IA
setup_ai() {
    echo -e "\n${BLUE}🤖 Configuração da Análise com IA${NC}"
    echo -e "${YELLOW}A análise com IA oferece detecção avançada de código malicioso${NC}"
    echo -e "${YELLOW}Requer uma API key da OpenAI (paga, mas uso mínimo)${NC}"
    
    read -p "Deseja habilitar análise com IA? (y/N): " enable_ai
    
    if [[ "$enable_ai" == "y" || "$enable_ai" == "Y" ]]; then
        read -p "Digite sua OpenAI API key: " api_key
        
        if [[ -n "$api_key" ]]; then
            # Adicionar ao shell config
            local shell_config=""
            case $(basename "$SHELL") in
                "bash") shell_config="$HOME/.bashrc" ;;
                "zsh") shell_config="$HOME/.zshrc" ;;
            esac
            
            if [[ -n "$shell_config" ]]; then
                echo "export OPENAI_API_KEY='$api_key'" >> "$shell_config"
                echo "export NPM_AI_ANALYSIS=true" >> "$shell_config"
                echo -e "${GREEN}✅ IA configurada${NC}"
            else
                echo -e "${YELLOW}💡 Adicione manualmente ao seu .bashrc/.zshrc:${NC}"
                echo "export OPENAI_API_KEY='$api_key'"
                echo "export NPM_AI_ANALYSIS=true"
            fi
        else
            echo -e "${YELLOW}⚠️  API key não fornecida. IA será desabilitada${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  IA desabilitada. Usando apenas detecção por padrões${NC}"
    fi
}

# 6. Criar script de teste
create_test_script() {
    local test_script="$SCRIPT_DIR/test-interceptor.sh"
    
    cat > "$test_script" << 'EOF'
#!/bin/bash
# test-interceptor.sh - Script de teste do interceptor

echo "🧪 Testando NPM Smart Interceptor..."

# Teste 1: Verificar se alias está funcionando
echo "Teste 1: Verificando configuração do alias..."
if alias npm | grep -q "npm-smart-interceptor"; then
    echo "✅ Alias configurado corretamente"
else
    echo "❌ Alias não encontrado"
fi

# Teste 2: Testar comando que não instala
echo "Teste 2: Executando 'npm --version'..."
npm --version

# Teste 3: Simular instalação (dry-run não disponível para npm install)
echo "Teste 3: Testando verificação de pacotes comprometidos..."
echo "Executando verificação manual..."

# Verificar se algum pacote comprometido está instalado
npm ls ansi-styles@6.2.2 debug@4.4.2 chalk@5.6.1 2>/dev/null && echo "⚠️  Pacotes comprometidos encontrados!" || echo "✅ Nenhum pacote comprometido encontrado"

echo "🎉 Testes concluídos!"
EOF

    chmod +x "$test_script"
    echo -e "${GREEN}✅ Script de teste criado: $test_script${NC}"
}

# 7. Criar arquivo de configuração
create_config() {
    local config_file="$SCRIPT_DIR/npm-interceptor.conf"
    
    cat > "$config_file" << EOF
# Configuração do NPM Smart Interceptor
# Edite este arquivo para personalizar o comportamento

# Habilitar/desabilitar análise com IA
AI_ANALYSIS_ENABLED=true

# Nível mínimo de audit para bloquear instalação
AUDIT_LEVEL=moderate

# Log detalhado (true/false) 
VERBOSE_LOGGING=true

# Timeout para análise IA (segundos)
AI_TIMEOUT=30

# Auto-remover pacotes suspeitos (true/false)
AUTO_REMOVE_SUSPICIOUS=false

# Whitelist de pacotes (separados por vírgula)
PACKAGE_WHITELIST=""

# Blacklist adicional de pacotes (separados por vírgula) 
PACKAGE_BLACKLIST=""
EOF

    echo -e "${GREEN}✅ Arquivo de configuração criado: $config_file${NC}"
}

# Executar configuração
main() {
    echo -e "${BLUE}📋 Configuração automática iniciada${NC}"
    
    setup_alias
    setup_ai
    create_test_script
    create_config
    
    echo -e "\n${GREEN}🎉 Configuração concluída com sucesso!${NC}"
    echo -e "\n${BLUE}📋 Próximos passos:${NC}"
    echo -e "${YELLOW}1. Execute: source ~/.bashrc (ou ~/.zshrc)${NC}"
    echo -e "${YELLOW}2. Teste: ./test-interceptor.sh${NC}"
    echo -e "${YELLOW}3. Use: npm install <pacote> (será interceptado automaticamente)${NC}"
    echo -e "${YELLOW}4. Para usar npm diretamente: npm-direct install <pacote>${NC}"
    echo -e "${YELLOW}5. Logs em: $SCRIPT_DIR/npm-security.log${NC}"
    
    echo -e "\n${BLUE}🛡️  O interceptor agora protege contra:${NC}"
    echo -e "   • Todos os pacotes comprometidos conhecidos (setembro 2025 + Shai-Hulud)"
    echo -e "   • Análise de padrões maliciosos pós-instalação"
    echo -e "   • Análise com IA para detectar novos ataques"
    echo -e "   • Verificação de npm audit automática"
    
    echo -e "\n${GREEN}✨ Sistema de proteção ativo!${NC}"
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi