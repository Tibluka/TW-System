#!/bin/bash

# Install Hooks - Script para configurar Git Hooks de limpeza automática
# Salvar como: public/scripts/install-hooks.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configurando Git Hooks para limpeza automática de código...${NC}\n"

# Verifica se está em um repositório Git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Este não é um repositório Git!${NC}"
    echo -e "${YELLOW}   Execute 'git init' primeiro.${NC}"
    exit 1
fi

# Verifica se o script code-cleaner.sh existe
CLEANER_FOUND=false
CLEANER_PATH=""

# Procura pelo script em vários locais possíveis
if [ -f "./public/scripts/code-cleaner.sh" ]; then
    CLEANER_PATH="./public/scripts/code-cleaner.sh"
    CLEANER_FOUND=true
    echo -e "${GREEN}✅ Encontrado code-cleaner.sh em: ./public/scripts/code-cleaner.sh${NC}"
elif [ -f "./public/scripts/clean-code.sh" ]; then
    CLEANER_PATH="./public/scripts/clean-code.sh"
    CLEANER_FOUND=true
    echo -e "${GREEN}✅ Encontrado clean-code.sh em: ./public/scripts/clean-code.sh${NC}"
elif [ -f "./public/cleaner.sh" ]; then
    CLEANER_PATH="./public/cleaner.sh"
    CLEANER_FOUND=true
    echo -e "${GREEN}✅ Encontrado cleaner.sh em: ./public/cleaner.sh${NC}"
elif [ -f "./cleaner.sh" ]; then
    CLEANER_PATH="./cleaner.sh"
    CLEANER_FOUND=true
    echo -e "${GREEN}✅ Encontrado cleaner.sh em: ./cleaner.sh${NC}"
elif [ -f "./code-cleaner.sh" ]; then
    CLEANER_PATH="./code-cleaner.sh"
    CLEANER_FOUND=true
    echo -e "${GREEN}✅ Encontrado code-cleaner.sh em: ./code-cleaner.sh${NC}"
fi

if [ "$CLEANER_FOUND" = false ]; then
    echo -e "${RED}❌ Script de limpeza não encontrado!${NC}"
    echo -e "${YELLOW}   Procurei nos seguintes locais:${NC}"
    echo -e "   • ./public/scripts/code-cleaner.sh"
    echo -e "   • ./public/scripts/clean-code.sh"
    echo -e "   • ./public/cleaner.sh"
    echo -e "   • ./cleaner.sh"
    echo -e "   • ./code-cleaner.sh"
    echo ""
    echo -e "${BLUE}💡 Certifique-se de que o script existe em um desses locais.${NC}"
    exit 1
fi

# Verifica se o script tem permissão de execução
if [ ! -x "$CLEANER_PATH" ]; then
    echo -e "${YELLOW}⚠️  Dando permissão de execução para $CLEANER_PATH${NC}"
    chmod +x "$CLEANER_PATH"
fi

# Cria o diretório hooks se não existir
mkdir -p .git/hooks

# Verifica se já existe um hook pre-push
if [ -f ".git/hooks/pre-push" ]; then
    echo -e "${YELLOW}⚠️  Já existe um hook pre-push.${NC}"
    read -p "🤔 Deseja substituir? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🛑 Instalação cancelada.${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📋 Criando backup do hook atual...${NC}"
    cp .git/hooks/pre-push .git/hooks/pre-push.backup.$(date +%s)
fi

# Cria o arquivo pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# Git Pre-Push Hook - Limpa código antes do push
# Este arquivo foi gerado automaticamente pelo install-hooks.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Executando limpeza de código antes do push...${NC}\n"

# Procura pelo script de limpeza em vários locais
CLEANER_SCRIPT=""
if [ -f "./public/scripts/code-cleaner.sh" ]; then
    CLEANER_SCRIPT="./public/scripts/code-cleaner.sh"
elif [ -f "./public/scripts/clean-code.sh" ]; then
    CLEANER_SCRIPT="./public/scripts/clean-code.sh"
elif [ -f "./public/cleaner.sh" ]; then
    CLEANER_SCRIPT="./public/cleaner.sh"
elif [ -f "./cleaner.sh" ]; then
    CLEANER_SCRIPT="./cleaner.sh"
elif [ -f "./code-cleaner.sh" ]; then
    CLEANER_SCRIPT="./code-cleaner.sh"
else
    echo -e "${RED}❌ Script de limpeza não encontrado!${NC}"
    echo -e "${YELLOW}   Procurei em:${NC}"
    echo -e "   • ./public/scripts/code-cleaner.sh"
    echo -e "   • ./public/scripts/clean-code.sh"
    echo -e "   • ./public/cleaner.sh"
    echo -e "   • ./cleaner.sh"
    echo -e "   • ./code-cleaner.sh"
    echo ""
    echo -e "${BLUE}💡 Execute o install-hooks.sh novamente para reconfigurar.${NC}"
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

# Verifica se há mudanças após a limpeza
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✅ Nenhuma mudança detectada após limpeza. Prosseguindo com o push...${NC}"
else
    echo -e "${YELLOW}⚠️  Código foi limpo e há mudanças não commitadas.${NC}"
    echo -e "${BLUE}📝 Você tem algumas opções:${NC}"
    echo -e "   1. ${GREEN}Continuar o push${NC} (recomendado se as mudanças são apenas limpeza)"
    echo -e "   2. ${YELLOW}Cancelar e fazer commit das mudanças de limpeza${NC}"
    echo ""
    
    # Mostra um resumo das mudanças
    echo -e "${BLUE}📊 Resumo das mudanças detectadas:${NC}"
    git diff --stat --color=always | head -10
    if [ $(git diff --stat | wc -l) -gt 10 ]; then
        echo -e "${YELLOW}   ... e mais arquivos${NC}"
    fi
    echo ""
    
    read -p "🤔 Continuar com o push? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🛑 Push cancelado.${NC}"
        echo -e "${BLUE}💡 Para commitar as mudanças de limpeza:${NC}"
        echo -e "   ${GREEN}git add .${NC}"
        echo -e "   ${GREEN}git commit -m \"🧹 Limpeza automática de código\"${NC}"
        echo -e "   ${GREEN}git push${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🚀 Limpeza concluída! Prosseguindo com o push...${NC}\n"
exit 0
EOF

# Dá permissão de execução para o hook
chmod +x .git/hooks/pre-push

echo -e "${GREEN}✅ Git Hook configurado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 O que foi configurado:${NC}"
echo -e "   • Pre-push hook criado em ${GREEN}.git/hooks/pre-push${NC}"
echo -e "   • Script encontrado em: ${GREEN}$CLEANER_PATH${NC}"
echo -e "   • Limpeza automática será executada antes de cada push"
echo ""
echo -e "${YELLOW}🔄 O que acontece agora em cada push:${NC}"
echo -e "   1. Executa automaticamente o script de limpeza"
echo -e "   2. Remove console.logs, comentários, debuggers, etc."
echo -e "   3. Mostra relatório do que foi limpo"
echo -e "   4. Se houver mudanças, pergunta se quer continuar"
echo ""
echo -e "${BLUE}🧪 Comandos úteis:${NC}"
echo -e "   • Testar o hook:     ${GREEN}.git/hooks/pre-push${NC}"
echo -e "   • Push sem hook:     ${GREEN}git push --no-verify${NC}"
echo -e "   • Remover hook:      ${GREEN}rm .git/hooks/pre-push${NC}"
echo ""
echo -e "${GREEN}🎉 Configuração concluída!${NC}"

# Opcional: Perguntar se quer testar agora
echo ""
read -p "🤔 Quer testar o hook agora? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧪 Executando teste do hook...${NC}"
    echo -e "${YELLOW}⚠️  Isso é apenas um teste, não fará push real.${NC}\n"
    
    # Executa o hook diretamente para teste
    if .git/hooks/pre-push; then
        echo -e "\n${GREEN}✅ Teste do hook executado com sucesso!${NC}"
        echo -e "${BLUE}💡 Agora o hook funcionará automaticamente em cada 'git push'.${NC}"
    else
        echo -e "\n${RED}❌ Houve um problema no teste.${NC}"
        echo -e "${YELLOW}💡 Verifique se o script de limpeza está funcionando corretamente.${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📚 Próximos passos:${NC}"
echo -e "   1. Faça suas alterações no código"
echo -e "   2. Execute: ${GREEN}git add .${NC}"
echo -e "   3. Execute: ${GREEN}git commit -m \"sua mensagem\"${NC}"
echo -e "   4. Execute: ${GREEN}git push${NC} ${YELLOW}← O hook funcionará aqui!${NC}"