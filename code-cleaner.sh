#!/bin/bash

# Script Simples de Limpeza de Código - Compatível com macOS
# Remove comentários, console logs e outros elementos desnecessários

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Iniciando limpeza do código...${NC}\n"

# Contador de arquivos processados
PROCESSED=0

# Função para limpar um arquivo
clean_file() {
    local file="$1"
    local temp_file=$(mktemp)
    
    # Copia o arquivo original
    cp "$file" "$temp_file"
    
    # Remove comentários multi-linha /* ... */ (compatível com macOS)
    sed -E 's|/\*[^*]*\*+([^/*][^*]*\*+)*/||g' "$temp_file" > "${temp_file}.1" && mv "${temp_file}.1" "$temp_file"
    
    # Remove comentários de linha única //
    sed -E 's|//.*$||g' "$temp_file" > "${temp_file}.2" && mv "${temp_file}.2" "$temp_file"
    
    # Remove console statements
    sed -E '/console\.(log|error|warn|info|debug|trace|table|group|time|clear|count|assert|dir)/d' "$temp_file" > "${temp_file}.3" && mv "${temp_file}.3" "$temp_file"
    
    # Remove debugger
    sed -E '/debugger;*/d' "$temp_file" > "${temp_file}.4" && mv "${temp_file}.4" "$temp_file"
    
    # Remove espaços no final das linhas
    sed -E 's/[[:space:]]*$//' "$temp_file" > "${temp_file}.5" && mv "${temp_file}.5" "$temp_file"
    
    # Remove linhas em branco excessivas
    sed -E '/^[[:space:]]*$/{N;/^\n$/d;}' "$temp_file" > "${temp_file}.6" && mv "${temp_file}.6" "$temp_file"
    
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

# Processa apenas os arquivos do seu projeto (ignora dependências)
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" \) \
    -not -path "./node_modules/*" \
    -not -path "./.netlify/*" \
    -not -path "./.git/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -not -path "./.next/*" \
    -not -path "./coverage/*" \
    -not -path "./vendor/*" \
    -path "./src/*" | while read -r file; do
    clean_file "$file"
done

echo ""
echo -e "${BLUE}✨ Limpeza concluída!${NC}"
echo -e "${GREEN}📊 Arquivos processados: $PROCESSED${NC}"