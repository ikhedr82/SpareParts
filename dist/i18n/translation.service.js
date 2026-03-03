"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const SUPPORTED_LANGUAGES = ['EN', 'AR'];
const DEFAULT_LANGUAGE = 'EN';
let TranslationService = class TranslationService {
    constructor() {
        this.dictionaries = {};
    }
    onModuleInit() {
        this.loadDictionaries();
    }
    loadDictionaries() {
        const i18nDir = path.join(__dirname, '..');
        for (const lang of SUPPORTED_LANGUAGES) {
            const langDir = path.join(i18nDir, lang.toLowerCase());
            if (!fs.existsSync(langDir))
                continue;
            const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const namespace = file.replace('.json', '');
                const filePath = path.join(langDir, file);
                const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const key = `${lang.toLowerCase()}.${namespace}`;
                this.dictionaries[key] = content;
            }
        }
    }
    translate(key, lang, params) {
        const targetLang = (lang || DEFAULT_LANGUAGE).toString().toUpperCase();
        const segments = key.split('.');
        if (segments.length < 2)
            return key;
        const namespace = segments[0];
        const nestedPath = segments.slice(1);
        let value = this.resolveKey(targetLang.toLowerCase(), namespace, nestedPath);
        if (value === null && targetLang !== 'EN') {
            value = this.resolveKey('en', namespace, nestedPath);
        }
        if (value === null)
            return key;
        if (params) {
            for (const [paramKey, paramValue] of Object.entries(params)) {
                value = value.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
            }
        }
        return value;
    }
    t(key, lang, params) {
        return this.translate(key, lang, params);
    }
    resolveKey(lang, namespace, path) {
        const dictKey = `${lang}.${namespace}`;
        const dict = this.dictionaries[dictKey];
        if (!dict)
            return null;
        let current = dict;
        for (const segment of path) {
            if (current === undefined || current === null || typeof current !== 'object') {
                return null;
            }
            current = current[segment];
        }
        return typeof current === 'string' ? current : null;
    }
    isSupported(lang) {
        return SUPPORTED_LANGUAGES.includes(lang.toUpperCase());
    }
    getSupportedLanguages() {
        return [...SUPPORTED_LANGUAGES];
    }
};
exports.TranslationService = TranslationService;
exports.TranslationService = TranslationService = __decorate([
    (0, common_1.Injectable)()
], TranslationService);
//# sourceMappingURL=translation.service.js.map