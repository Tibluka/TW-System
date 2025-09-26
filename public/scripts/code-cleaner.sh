#!/bin/bash

# Code Cleaner - Script de Limpeza de Código
# Remove comentários, console logs e outros elementos desnecessários
# Salvar como: public/scripts/code-cleaner.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
EXTENSIONS=("js" "ts" "jsx" "tsx" "vue")
EXCLUDE_DIRS=("node_modules" ".git" "dist" "build" ".next" "coverage" ".vscode" ".idea")
BACKUP_DIR=""
CREATE_BACKUP=false
TARGET_PATH="."
PROCESSED_COUNT=0

# Função para mostrar help
show_help() {
    echo -e "${BLUE}🧹 Code Cleaner - Script de Limpeza de Código${NC}"
    echo ""
    echo "Uso: $0 [opções] [caminho]"
    echo ""
    echo "Opções:"
    echo "  -h, --help      Mostra esta ajuda"
    echo "  -b, --backup    Cria backup antes de limpar"
    echo "  -p, --path      Especifica o caminho (padrão: diretório atual)"
    echo ""
    echo "Exemplos:"
    echo "  $0                    # Limpa o diretório atual"
    echo "  $0 ./src             # Limpa apenas a pasta src"
    echo "  $0 --backup         # Cria backup e limpa"
    echo "  $0 -b -p ./frontend  # Backup e limpa pasta frontend"
    echo ""
    echo "Remove:"
    echo "  • console.log, console.error, console.warn, etc."
    echo "  • Comentários // e /* */"
    echo "  • debugger statements"
    echo "  • alert statements"
    echo "  • Linhas em branco excessivas"
    echo "  • Espaços em branco no final das linhas"
    echo ""
    echo "Arquivos suportados:"
    echo "  • .js, .ts, .jsx, .tsx, .vue"
    echo ""
    echo "Diretórios ignorados:"
    echo "  • node_modules, .git, dist, build, .next, coverage"
}

# Função para criar backup
create_backup() {
    local source_path="$1"
    BACKUP_DIR="${source_path}_backup_$(date +%s)"
    
    echo -e "${YELLOW}💾 Criando backup em: ${BACKUP_DIR}${NC}"
    
    if cp -r "$source_path" "$BACKUP_DIR" 2>/dev/null; then
        # Remove diretórios excluídos do backup
        for exclude_dir in "${EXCLUDE_DIRS[@]}"; do
            if [ -d "$BACKUP_DIR/$exclude_dir" ]; then
                rm -rf "$BACKUP_DIR/$exclude_dir"
            fi
        done
        echo -e "${GREEN}✅ Backup criado com sucesso!${NC}\n"
    else
        echo -e "${RED}❌ Erro ao criar backup${NC}"
        exit 1
    fi
}

# Função para verificar se deve pular diretório
should_skip_directory() {
    local dir_name=$(basename "$1")
    for exclude_dir in "${EXCLUDE_DIRS[@]}"; do
        if [[ "$dir_name" == "$exclude_dir" ]]; then
            return 0
        fi
    done
    return 1
}

# Função para verificar se deve processar arquivo
should_process_file() {
    local file_path="$1"
    local extension="${file_path##*.}"
    
    for ext in "${EXTENSIONS[@]}"; do
        if [[ "$extension" == "$ext" ]]; then
            return 0
        fi
    done
    return 1
}

# Função para limpar o código
clean_code() {
    local file_path="$1"
    local temp_file=$(mktemp)
    
    # Lê o arquivo original
    if ! cat "$file_path" > "$temp_file" 2>/dev/null; then
        echo -e "${RED}❌ Erro ao ler arquivo: $file_path${NC}"
        rm -f "$temp_file"
        return 1
    fi
    
    # Remove comentários multi-linha /* ... */
    # Regex mais robusta para comentários multi-linha
    sed -i 's|/\*[^*]*\*\+\([^/*][^*]*\*\+\)*/||g' "$temp_file"
    
    # Remove comentários de linha única //
    sed -i 's|//.*$||g' "$temp_file"
    
    # Remove console statements (versão mais robusta)
    sed -i '/console\.\(log\|error\|warn\|info\|debug\|trace\|table\|group\|groupCollapsed\|groupEnd\|time\|timeEnd\|clear\|count\|countReset\|assert\|dir\|dirxml\)/d' "$temp_file"
    
    # Remove debugger statements
    sed -i '/debugger;*/d' "$temp_file"
    
    # Remove alert statements
    sed -i '/alert\s*(/d' "$temp_file"
    
    # Remove espaços em branco no final das linhas
    sed -i 's/[[:space:]]*$//' "$temp_file"
    
    # Remove linhas em branco excessivas (mais de 2 consecutivas)
    sed -i '/^[[:space:]]*$/N;/^\n$/d' "$temp_file"
    
    # Remove linhas vazias do início e fim do arquivo
    sed -i '/./,$!d' "$temp_file"  # Remove linhas vazias do início
    sed -i -e :a -e '/^\s*$/N;ba' -e 's/^\s*\n//' "$temp_file"  # Remove do final
    
    # Verifica se houve mudanças
    if ! cmp -s "$file_path" "$temp_file"; then
        mv "$temp_file" "$file_path"
        echo -e "${GREEN}✅ Limpo: $file_path${NC}"
        ((PROCESSED_COUNT++))
        return 0
    else
        echo -e "${YELLOW}⏭️  Pulado (sem mudanças): $file_path${NC}"
        rm -f "$temp_file"
        return 1
    fi
}

# Função para processar diretório recursivamente
process_directory() {
    local dir_path="$1"
    
    # Verifica se deve pular este diretório
    if should_skip_directory "$dir_path"; then
        return
    fi
    
    # Processa todos os itens do diretório
    for item in "$dir_path"/*; do
        if [ ! -e "$item" ]; then
            continue
        fi
        
        if [ -d "$item" ]; then
            process_directory "$item"
        elif [ -f "$item" ] && should_process_file "$item"; then
            clean_code "$item"
        fi
    done
}

# Função principal
main() {
    local start_time=$(date +%s)
    
    echo -e "${BLUE}🧹 Iniciando limpeza do código...${NC}\n"
    
    # Verifica se o caminho existe
    if [ ! -e "$TARGET_PATH" ]; then
        echo -e "${RED}❌ Caminho não encontrado: $TARGET_PATH${NC}"
        exit 1
    fi
    
    # Cria backup se solicitado
    if [ "$CREATE_BACKUP" = true ]; then
        create_backup "$TARGET_PATH"
    fi
    
    # Processa arquivo único ou diretório
    if [ -f "$TARGET_PATH" ]; then
        if should_process_file "$TARGET_PATH"; then
            clean_code "$TARGET_PATH"
        else
            echo -e "${YELLOW}⚠️  Arquivo não suportado: $TARGET_PATH${NC}"
        fi
    elif [ -d "$TARGET_PATH" ]; then
        process_directory "$TARGET_PATH"
    fi
    
    # Estatísticas finais
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${BLUE}✨ Limpeza concluída!${NC}"
    echo -e "${GREEN}📊 Arquivos processados: $PROCESSED_COUNT${NC}"
    echo -e "${GREEN}⏱️  Tempo: ${duration}s${NC}"
    
    if [ "$CREATE_BACKUP" = true ] && [ -n "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}💾 Backup salvo em: $BACKUP_DIR${NC}"
    fi
    
    # Retorna 0 se processou arquivos, 1 se não houve mudanças
    if [ $PROCESSED_COUNT -gt 0 ]; then
        return 0
    else
        return 1
    fi
}

# Parse dos argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--backup)
            CREATE_BACKUP=true
            shift
            ;;
        -p|--path)
            TARGET_PATH="$2"
            shift 2
            ;;
        *)
            if [[ "$1" != -* ]]; then
                TARGET_PATH="$1"
            else
                echo -e "${RED}❌ Opção desconhecida: $1${NC}"
                echo "Use $0 --help para ver as opções disponíveis."
                exit 1
            fi
            shift
            ;;
    esac
done

# Executa o script
main