#!/bin/bash

echo "🧹 Iniciando limpeza completa do SSR..."

# 1. Remove arquivos relacionados ao SSR
echo "📁 Removendo arquivos do servidor..."
rm -f src/main.server.ts
rm -f src/server.ts
rm -f src/app/app.config.server.ts

# 2. Para o servidor de desenvolvimento (se estiver rodando)
echo "🛑 Parando servidor..."
pkill -f "ng serve" 2>/dev/null || true

# 3. Remove dependências e cache
echo "🗑️ Limpando cache e dependências..."
rm -rf node_modules
rm -f package-lock.json
rm -rf .angular/cache
rm -rf dist

# 4. Reinstala dependências limpas
echo "📦 Reinstalando dependências..."
npm install

echo "✅ Limpeza completa! Agora você pode:"
echo "   - Substituir o conteúdo dos arquivos pelos códigos que forneci"
echo "   - Executar: ng serve"
echo ""
echo "📋 Arquivos para atualizar:"
echo "   1. package.json"
echo "   2. angular.json" 
echo "   3. tsconfig.app.json"
echo "   4. src/app/app.config.ts"