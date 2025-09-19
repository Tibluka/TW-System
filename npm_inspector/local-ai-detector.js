#!/usr/bin/env node
// local-ai-detector.js - Detector inteligente sem necessidade de API externa

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LocalMalwareDetector {
    constructor() {
        // Banco de dados de assinaturas maliciosas conhecidas
        this.malwareSignatures = [
            // Cryptominers conhecidos
            'coinhive', 'cryptoloot', 'coin-hive', 'authedmine',
            
            // Trojans conhecidos
            'cobalt-strike', 'metasploit', 'meterpreter',
            
            // Ferramentas de exfiltração
            'trufflehog', 'gitleaks', 'shhgit',
            
            // Domínios suspeitos
            'npmjs.help', 'npn-js.org', 'registry-npm.org'
        ];
        
        // Padrões avançados de detecção
        this.advancedPatterns = {
            // Obfuscação avançada
            obfuscation: [
                /\b(eval|Function|setTimeout|setInterval)\s*\(\s*['"`][^'"`]{50,}['"`]\s*\)/g,
                /String\.fromCharCode\(\s*\d+(?:\s*,\s*\d+){10,}\s*\)/g,
                /\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){20,}/g,
                /btoa\s*\(\s*['"`][A-Za-z0-9+/]{50,}['"`]\s*\)/g,
                /atob\s*\(\s*['"`][A-Za-z0-9+/]{50,}['"`]\s*\)/g
            ],
            
            // Atividade de rede suspeita
            network: [
                /https?:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?/g,
                /https?:\/\/[a-zA-Z0-9-]+\.(?:tk|ml|cf|ga|onion|bit)/g,
                /fetch\s*\(\s*['"`]https?:\/\/[^'"`]+\/[^'"`]*(?:download|payload|exec)/g,
                /new\s+XMLHttpRequest\s*\(\s*\)[^;]*\.open\s*\(\s*['"`]POST['"`]/g
            ],
            
            // Acesso ao sistema suspeito
            system: [
                /require\s*\(\s*['"`]child_process['"`]\s*\)[^;]*\.(?:exec|spawn|fork)/g,
                /fs\.(?:writeFileSync?|createWriteStream|appendFileSync?)\s*\([^)]*(?:\/tmp\/|\/var\/tmp\/|\.ssh\/|\.aws\/)/g,
                /process\.env\s*\[\s*['"`](?:AWS_|GITHUB_|SSH_|API_|TOKEN_|KEY_|SECRET_|PASSWORD_)/g,
                /os\.(?:homedir|tmpdir|userInfo)\s*\(\s*\)[^;]*(?:\.ssh|\.aws|\.config)/g
            ],
            
            // Cryptocurrency específico
            crypto: [
                /0x[a-fA-F0-9]{40}/g, // Ethereum addresses
                /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g, // Bitcoin addresses
                /addr1[a-z0-9]{54}/g, // Cardano addresses
                /(?:wallet|address|private[_-]?key|seed|mnemonic)[^;]{0,50}(?:=|:)[^;]{0,100}[a-zA-Z0-9]{20,}/gi
            ],
            
            // Comportamento de rootkit
            rootkit: [
                /setInterval\s*\(\s*function[^}]*(?:fetch|XMLHttpRequest)[^}]*\}\s*,\s*\d{4,}\s*\)/g,
                /document\.addEventListener\s*\(\s*['"`](?:copy|paste|keydown|keyup)['"`]/g,
                /new\s+MutationObserver\s*\([^)]*(?:input|password|credit|card)/gi
            ]
        };
        
        // Pesos para scoring de risco
        this.riskWeights = {
            obfuscation: 3,
            network: 2,
            system: 4,
            crypto: 2,
            rootkit: 5,
            signature: 10
        };
    }
    
    // Analisar pacote completo
    analyzePackage(packagePath) {
        const results = {
            packageName: path.basename(packagePath),
            riskScore: 0,
            maxRiskScore: 100,
            riskLevel: 'LOW',
            findings: [],
            suspicious: false,
            confidence: 0.0
        };
        
        try {
            this.scanDirectory(packagePath, results);
            this.calculateRiskLevel(results);
            this.calculateConfidence(results);
            
            return results;
        } catch (error) {
            results.error = error.message;
            return results;
        }
    }
    
    // Escanear diretório recursivamente
    scanDirectory(dir, results) {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            
            try {
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    this.scanDirectory(filePath, results);
                } else if (this.shouldScanFile(file)) {
                    this.scanFile(filePath, results);
                }
            } catch (err) {
                // Arquivo pode ter sido removido ou sem permissão
                continue;
            }
        }
    }
    
    // Verificar se arquivo deve ser escaneado
    shouldScanFile(filename) {
        const extensions = ['.js', '.json', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'];
        const ext = path.extname(filename).toLowerCase();
        return extensions.includes(ext) || 
               filename === 'package.json' || 
               filename.startsWith('.');
    }
    
    // Escanear arquivo individual
    scanFile(filePath, results) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(process.cwd(), filePath);
            
            // 1. Verificar assinaturas conhecidas
            this.checkSignatures(content, relativePath, results);
            
            // 2. Análise de padrões avançados
            this.analyzePatterns(content, relativePath, results);
            
            // 3. Análise de entropia (código ofuscado)
            this.analyzeEntropy(content, relativePath, results);
            
            // 4. Análise específica do package.json
            if (path.basename(filePath) === 'package.json') {
                this.analyzePackageJson(content, relativePath, results);
            }
            
        } catch (err) {
            // Arquivo binário ou erro de leitura
        }
    }
    
    // Verificar assinaturas maliciosas conhecidas
    checkSignatures(content, filePath, results) {
        const contentLower = content.toLowerCase();
        
        for (const signature of this.malwareSignatures) {
            if (contentLower.includes(signature.toLowerCase())) {
                this.addFinding(results, {
                    file: filePath,
                    type: 'malware_signature',
                    signature: signature,
                    severity: 'CRITICAL',
                    riskScore: this.riskWeights.signature
                });
            }
        }
    }
    
    // Analisar padrões avançados
    analyzePatterns(content, filePath, results) {
        for (const [category, patterns] of Object.entries(this.advancedPatterns)) {
            for (const pattern of patterns) {
                const matches = content.match(pattern);
                if (matches) {
                    this.addFinding(results, {
                        file: filePath,
                        type: `suspicious_${category}`,
                        pattern: pattern.source,
                        matches: matches.length,
                        samples: matches.slice(0, 3), // Primeiras 3 ocorrências
                        severity: this.getSeverityFromCategory(category),
                        riskScore: this.riskWeights[category] * Math.min(matches.length, 3)
                    });
                }
            }
        }
    }
    
    // Análise de entropia (detecta ofuscação)
    analyzeEntropy(content, filePath, results) {
        // Analisar entropia de strings grandes
        const largeStrings = content.match(/['"`][^'"`]{50,}['"`]/g) || [];
        
        for (const str of largeStrings) {
            const entropy = this.calculateEntropy(str);
            if (entropy > 4.5) {
                this.addFinding(results, {
                    file: filePath,
                    type: 'high_entropy_string',
                    entropy: entropy.toFixed(2),
                    length: str.length,
                    severity: entropy > 6 ? 'HIGH' : 'MEDIUM',
                    riskScore: entropy > 6 ? 4 : 2
                });
            }
        }
    }
    
    // Analisar package.json específicamente
    analyzePackageJson(content, filePath, results) {
        try {
            const pkg = JSON.parse(content);
            
            // Verificar scripts suspeitos
            if (pkg.scripts) {
                for (const [scriptName, scriptContent] of Object.entries(pkg.scripts)) {
                    if (this.isSuspiciousScript(scriptContent)) {
                        this.addFinding(results, {
                            file: filePath,
                            type: 'suspicious_script',
                            script: scriptName,
                            content: scriptContent,
                            severity: 'HIGH',
                            riskScore: 5
                        });
                    }
                }
            }
            
            // Verificar dependências suspeitas
            const allDeps = {
                ...pkg.dependencies,
                ...pkg.devDependencies,
                ...pkg.peerDependencies,
                ...pkg.optionalDependencies
            };
            
            for (const [depName, depVersion] of Object.entries(allDeps || {})) {
                if (this.isSuspiciousDependency(depName, depVersion)) {
                    this.addFinding(results, {
                        file: filePath,
                        type: 'suspicious_dependency',
                        dependency: `${depName}@${depVersion}`,
                        severity: 'MEDIUM',
                        riskScore: 3
                    });
                }
            }
            
        } catch (err) {
            // package.json malformado é suspeito
            this.addFinding(results, {
                file: filePath,
                type: 'malformed_package_json',
                severity: 'MEDIUM',
                riskScore: 2
            });
        }
    }
    
    // Verificar se script é suspeito
    isSuspiciousScript(script) {
        const suspiciousCommands = [
            'curl', 'wget', 'rm -rf', 'dd if=', 'chmod +x',
            'base64', 'python -c', 'perl -e', 'ruby -e',
            '> /dev/null', '&& rm', '|| rm'
        ];
        
        return suspiciousCommands.some(cmd => 
            script.toLowerCase().includes(cmd.toLowerCase())
        );
    }
    
    // Verificar se dependência é suspeita
    isSuspiciousDependency(name, version) {
        // Typosquatting comum
        const commonPackages = {
            'lodash': ['lodahs', 'lodas', 'loda sh'],
            'express': ['expres', 'expresss', 'expres s'],
            'react': ['reactt', 'reac t', 'raect'],
            'jquery': ['jquerry', 'jqeury', 'jqurey']
        };
        
        for (const [realPkg, fakes] of Object.entries(commonPackages)) {
            if (fakes.includes(name.toLowerCase())) {
                return true;
            }
        }
        
        // Versões suspeitas
        if (version.includes('file:') || version.includes('git+') || 
            version.includes('http://')) {
            return true;
        }
        
        return false;
    }
    
    // Adicionar descoberta
    addFinding(results, finding) {
        results.findings.push(finding);
        results.riskScore += finding.riskScore || 1;
        results.suspicious = true;
    }
    
    // Calcular entropia de Shannon
    calculateEntropy(str) {
        const chars = {};
        for (let char of str) {
            chars[char] = (chars[char] || 0) + 1;
        }
        
        const length = str.length;
        let entropy = 0;
        
        for (let char in chars) {
            const freq = chars[char] / length;
            entropy -= freq * Math.log2(freq);
        }
        
        return entropy;
    }
    
    // Determinar severidade por categoria
    getSeverityFromCategory(category) {
        const severityMap = {
            'obfuscation': 'MEDIUM',
            'network': 'HIGH',
            'system': 'CRITICAL',
            'crypto': 'HIGH',
            'rootkit': 'CRITICAL'
        };
        
        return severityMap[category] || 'MEDIUM';
    }
    
    // Calcular nível de risco
    calculateRiskLevel(results) {
        const score = results.riskScore;
        
        if (score >= 20) {
            results.riskLevel = 'CRITICAL';
        } else if (score >= 10) {
            results.riskLevel = 'HIGH';
        } else if (score >= 5) {
            results.riskLevel = 'MEDIUM';
        } else {
            results.riskLevel = 'LOW';
        }
    }
    
    // Calcular confiança na detecção
    calculateConfidence(results) {
        let confidence = 0;
        
        // Base na quantidade e qualidade das descobertas
        const criticalFindings = results.findings.filter(f => f.severity === 'CRITICAL').length;
        const highFindings = results.findings.filter(f => f.severity === 'HIGH').length;
        const mediumFindings = results.findings.filter(f => f.severity === 'MEDIUM').length;
        
        confidence = Math.min(
            (criticalFindings * 0.3 + highFindings * 0.2 + mediumFindings * 0.1),
            1.0
        );
        
        results.confidence = confidence;
    }
    
    // Gerar relatório detalhado
    generateReport(results) {
        const emojis = {
            'CRITICAL': '🚨',
            'HIGH': '⚠️',
            'MEDIUM': '🔍',
            'LOW': '✅'
        };
        
        console.log(`\n${emojis[results.riskLevel]} RELATÓRIO DE ANÁLISE: ${results.packageName}`);
        console.log(`📊 Nível de Risco: ${results.riskLevel} (Score: ${results.riskScore})`);
        console.log(`🎯 Confiança: ${(results.confidence * 100).toFixed(1)}%`);
        console.log(`🚨 Suspeito: ${results.suspicious ? 'SIM' : 'NÃO'}`);
        console.log(`📋 Descobertas: ${results.findings.length}`);
        
        if (results.findings.length > 0) {
            console.log('\n📝 DETALHES DAS DESCOBERTAS:');
            
            // Agrupar por severidade
            const grouped = {};
            for (const finding of results.findings) {
                const sev = finding.severity;
                if (!grouped[sev]) grouped[sev] = [];
                grouped[sev].push(finding);
            }
            
            for (const [severity, findings] of Object.entries(grouped)) {
                console.log(`\n${emojis[severity]} ${severity} (${findings.length}):`);
                
                for (const finding of findings) {
                    console.log(`  📁 ${finding.file}`);
                    console.log(`  🔍 Tipo: ${finding.type}`);
                    
                    if (finding.signature) {
                        console.log(`  🦠 Assinatura: ${finding.signature}`);
                    }
                    if (finding.pattern) {
                        console.log(`  🎯 Padrão: ${finding.pattern.substring(0, 50)}...`);
                        console.log(`  📊 Ocorrências: ${finding.matches}`);
                    }
                    if (finding.entropy) {
                        console.log(`  📈 Entropia: ${finding.entropy}`);
                    }
                    if (finding.script) {
                        console.log(`  📜 Script: ${finding.script}`);
                        console.log(`  💾 Comando: ${finding.content}`);
                    }
                    console.log('');
                }
            }
        }
        
        // Recomendações
        console.log('\n💡 RECOMENDAÇÕES:');
        if (results.riskLevel === 'CRITICAL') {
            console.log('  🚨 REMOVA IMEDIATAMENTE este pacote!');
            console.log('  🔒 Verifique se não houve comprometimento do sistema');
            console.log('  🔄 Faça scan completo de malware');
        } else if (results.riskLevel === 'HIGH') {
            console.log('  ⚠️  Use com EXTREMA cautela');
            console.log('  🔍 Analise manualmente o código suspeito');
            console.log('  📞 Contate o autor do pacote');
        } else if (results.riskLevel === 'MEDIUM') {
            console.log('  🔍 Monitore este pacote');
            console.log('  📋 Revise as descobertas reportadas');
            console.log('  🔄 Considere alternativas mais seguras');
        } else {
            console.log('  ✅ Pacote parece seguro');
            console.log('  🔄 Continue monitorando updates');
        }
        
        return results;
    }
}

// CLI Usage
if (require.main === module) {
    const packagePath = process.argv[2] || './node_modules';
    
    if (!fs.existsSync(packagePath)) {
        console.error('❌ Caminho não encontrado:', packagePath);
        process.exit(1);
    }
    
    console.log('🔍 Iniciando análise local avançada...\n');
    
    const detector = new LocalMalwareDetector();
    
    if (fs.statSync(packagePath).isDirectory()) {
        // Se for diretório node_modules, analisar todos os pacotes
        if (path.basename(packagePath) === 'node_modules') {
            const packages = fs.readdirSync(packagePath).filter(pkg => 
                !pkg.startsWith('.') && fs.statSync(path.join(packagePath, pkg)).isDirectory()
            );
            
            console.log(`🔍 Analisando ${packages.length} pacote(s)...\n`);
            
            let criticalCount = 0;
            let highCount = 0;
            let suspiciousCount = 0;
            
            for (const pkg of packages) {
                const pkgPath = path.join(packagePath, pkg);
                const results = detector.analyzePackage(pkgPath);
                detector.generateReport(results);
                
                if (results.riskLevel === 'CRITICAL') criticalCount++;
                else if (results.riskLevel === 'HIGH') highCount++;
                if (results.suspicious) suspiciousCount++;
                
                console.log('\n' + '='.repeat(60) + '\n');
            }
            
            console.log(`📊 RESUMO FINAL:`);
            console.log(`   📦 Total analisado: ${packages.length}`);
            console.log(`   🚨 Críticos: ${criticalCount}`);
            console.log(`   ⚠️  Alto risco: ${highCount}`);
            console.log(`   🔍 Suspeitos: ${suspiciousCount}`);
            console.log(`   ✅ Limpos: ${packages.length - suspiciousCount}`);
            
            if (criticalCount > 0 || highCount > 0) {
                process.exit(1);
            }
        } else {
            // Analisar pacote individual
            const results = detector.analyzePackage(packagePath);
            detector.generateReport(results);
            
            if (results.riskLevel === 'CRITICAL' || results.riskLevel === 'HIGH') {
                process.exit(1);
            }
        }
    }
}

module.exports = LocalMalwareDetector;