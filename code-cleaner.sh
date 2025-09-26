#!/bin/bash

# Script Ultra-Conservador - Remove APENAS comentários
# NÃO remove console.log nem debugger para evitar quebrar código

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Iniciando limpeza conservadora (apenas comentários)...${NC}\n"

# Contador de arquivos processados
PROCESSED=0

# Função para limpar apenas comentários
clean_file() {
    local file="$1"
    local temp_file=$(mktemp)
    local extension="${file##*.}"
    
    # Copia o arquivo original
    cp "$file" "$temp_file"
    
    # Para arquivos HTML/Vue - remove apenas comentários HTML
    if [[ "$extension" == "html" || "$extension" == "vue" ]]; then
        # Remove comentários HTML simples <!-- comentário -->
        sed -E 's|<!--[^>]*-->||g' "$temp_file" > "${temp_file}.html" && mv "${temp_file}.html" "$temp_file"
    fi
    
    # Para todos os arquivos - remove apenas comentários seguros
    # Remove comentários de linha única // (apenas no INÍCIO da linha)
    sed -E 's|^[[:space:]]*//.*$||g' "$temp_file" > "${temp_file}.1" && mv "${temp_file}.1" "$temp_file"
    
    # Remove comentários multi-linha /* ... */ simples (apenas em uma linha)
    sed -E 's|/\*[^*]*\*/||g' "$temp_file" > "${temp_file}.2" && mv "${temp_file}.2" "$temp_file"
    
    # Remove espaços no final das linhas
    sed -E 's/[[:space:]]*$//' "$temp_file" > "${temp_file}.3" && mv "${temp_file}.3" "$temp_file"
    
    # Remove linhas em branco excessivas (mais de 2 consecutivas)
    awk 'BEGIN{blank=0} /^[[:space:]]*$/{blank++; if(blank<=2) print; next} {blank=0; print}' "$temp_file" > "${temp_file}.4" && mv "${temp_file}.4" "$temp_file"
    
    # Verifica se houve mudanças
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo -e "${GREEN}✅ Limpo: $file${NC}"
        ((PROCESSED++))
    else
        rm -f "$temp_file"
        echo -e "${YELLOW}⏭️  Sem mudanças: $file${NC}"
    fi
}

echo -e "${BLUE}📂 Procurando arquivos para limpar...${NC}"

# Processa arquivos
while IFS= read -r -d '' file; do
    clean_file "$file"
done < <(find ./src -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" -o -name "*.html" \) \
    -not -path "./node_modules/*" \
    -not -path "./.netlify/*" \
    -not -path "./.git/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -not -path "./.next/*" \
    -print0 2>/dev/null)

echo ""
echo -e "${BLUE}✨ Limpeza conservadora concluída!${NC}"
echo -e "${GREEN}📊 Arquivos processados: $PROCESSED${NC}"
echo ""
echo -e "${BLUE}ℹ️  O que foi removido:${NC}"
echo -e "  • Comentários HTML <!-- -->"
echo -e "  • Comentários // no início das linhas"
echo -e "  • Comentários /* */ simples"
echo -e "  • Espaços no final das linhas"
echo -e "  • Linhas em branco excessivas"
echo ""
echo -e "${YELLOW}⚠️  Preservado (para segurança):${NC}"
echo -e "  • console.log, console.error, etc."
echo -e "  • debugger statements"
echo -e "  • URLs http:// e https://"