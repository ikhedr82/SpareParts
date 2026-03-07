/**
 * check-i18n-coverage.ts
 *
 * Scans all backend TypeScript files to detect:
 * 1. Hardcoded strings in throw new *Exception('...')
 * 2. Missing translation keys (keys used in t.translate() but absent from dictionaries)
 *
 * Usage: npx ts-node scripts/check-i18n-coverage.ts
 * CI: exits with code 1 if any issues found
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../src');
const EN_ERRORS = path.resolve(SRC_DIR, 'i18n/en/errors.json');
const AR_ERRORS = path.resolve(SRC_DIR, 'i18n/ar/errors.json');

interface Issue {
    file: string;
    line: number;
    issue: string;
}

function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules, dist, test dirs
            if (['node_modules', 'dist', '.git', 'scripts'].includes(entry.name)) continue;
            getAllTsFiles(fullPath, fileList);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') && !entry.name.endsWith('.d.ts')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

function flattenKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
            keys.push(...flattenKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

function scanForHardcodedStrings(filePath: string, content: string): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    // Skip non-service files, dto files, modules, etc.
    const basename = path.basename(filePath);
    if (
        basename.endsWith('.module.ts') ||
        basename.endsWith('.controller.ts') ||
        basename.endsWith('.dto.ts') ||
        basename.endsWith('.guard.ts') ||
        basename.endsWith('.middleware.ts') ||
        basename.endsWith('.interceptor.ts') ||
        basename.endsWith('.filter.ts') ||
        basename.endsWith('.decorator.ts') ||
        basename.endsWith('.strategy.ts') ||
        basename.includes('prisma') ||
        basename.includes('config')
    ) {
        return issues;
    }

    // Pattern: throw new *Exception('...' or `...`)
    const hardcodedPattern = /throw\s+new\s+\w*Exception\s*\(\s*['`][^'`]*['`]\s*\)/;
    // Exclude lines that already use translate
    const translatePattern = /this\.t\.translate/;
    // Exclude InvariantException with translate
    const invariantTranslatePattern = /InvariantException\s*\(\s*'[A-Z]+-\d+'/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip comments
        if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) continue;

        if (hardcodedPattern.test(line) && !translatePattern.test(line)) {
            // Special case: allow Error('CONCURRENCY_CONFLICT') — internal codes
            if (/throw\s+new\s+Error\s*\(\s*['`]CONCURRENCY_CONFLICT['`]\s*\)/.test(line)) continue;

            issues.push({
                file: path.relative(SRC_DIR, filePath),
                line: i + 1,
                issue: `Hardcoded string in exception: ${line.substring(0, 100)}`,
            });
        }
    }

    return issues;
}

function scanForMissingKeys(filePath: string, content: string, validKeys: Set<string>): Issue[] {
    const issues: Issue[] = [];
    const lines = content.split('\n');

    // Pattern: this.t.translate('errors.xxx.yyy',
    const translateCallPattern = /this\.t\.translate\s*\(\s*'(errors\.[^']+)'/g;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let match;
        translateCallPattern.lastIndex = 0;
        while ((match = translateCallPattern.exec(line)) !== null) {
            const key = match[1];
            if (!validKeys.has(key)) {
                issues.push({
                    file: path.relative(SRC_DIR, filePath),
                    line: i + 1,
                    issue: `Missing translation key: ${key}`,
                });
            }
        }
    }

    return issues;
}

function main() {
    console.log('=== i18n Coverage Audit ===\n');

    // Load dictionaries
    const enErrors = JSON.parse(fs.readFileSync(EN_ERRORS, 'utf-8'));
    const arErrors = JSON.parse(fs.readFileSync(AR_ERRORS, 'utf-8'));

    const enKeys = new Set(flattenKeys(enErrors).map(k => `errors.${k}`));
    const arKeys = new Set(flattenKeys(arErrors).map(k => `errors.${k}`));

    // Check EN/AR parity
    const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
    const missingInEn = [...arKeys].filter(k => !enKeys.has(k));

    // Scan all files
    const files = getAllTsFiles(SRC_DIR);
    const allIssues: Issue[] = [];

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        allIssues.push(...scanForHardcodedStrings(file, content));
        allIssues.push(...scanForMissingKeys(file, content, enKeys));
    }

    // Report
    console.log(`Scanned ${files.length} files\n`);

    if (missingInAr.length > 0) {
        console.log(`⚠ Keys in EN but missing in AR: ${missingInAr.length}`);
        missingInAr.forEach(k => console.log(`  - ${k}`));
        console.log();
    }

    if (missingInEn.length > 0) {
        console.log(`⚠ Keys in AR but missing in EN: ${missingInEn.length}`);
        missingInEn.forEach(k => console.log(`  - ${k}`));
        console.log();
    }

    if (allIssues.length === 0 && missingInAr.length === 0 && missingInEn.length === 0) {
        console.log('✅ No issues found. 100% i18n coverage!');
        process.exit(0);
    } else {
        console.log(`| ${'File'.padEnd(50)} | ${'Issue'.padEnd(70)} | Line |`);
        console.log(`|${'-'.repeat(52)}|${'-'.repeat(72)}|------|`);

        for (const issue of allIssues) {
            console.log(`| ${issue.file.padEnd(50)} | ${issue.issue.substring(0, 70).padEnd(70)} | ${String(issue.line).padStart(4)} |`);
        }

        console.log(`\n❌ Total issues: ${allIssues.length + missingInAr.length + missingInEn.length}`);
        process.exit(1);
    }
}

main();
