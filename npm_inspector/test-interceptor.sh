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
