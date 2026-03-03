"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageMiddleware = void 0;
const common_1 = require("@nestjs/common");
let LanguageMiddleware = class LanguageMiddleware {
    use(req, res, next) {
        var _a;
        const FALLBACK = 'EN';
        const headerLang = req.headers['x-language'];
        const tenantLang = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.defaultLanguage;
        let resolved = FALLBACK;
        if (headerLang && this.isValid(headerLang)) {
            resolved = headerLang.toUpperCase();
        }
        else if (tenantLang) {
            resolved = tenantLang;
        }
        req.language = resolved;
        res.setHeader('X-Language', resolved);
        next();
    }
    isValid(lang) {
        return ['EN', 'AR'].includes(lang.toUpperCase());
    }
};
exports.LanguageMiddleware = LanguageMiddleware;
exports.LanguageMiddleware = LanguageMiddleware = __decorate([
    (0, common_1.Injectable)()
], LanguageMiddleware);
//# sourceMappingURL=language.middleware.js.map