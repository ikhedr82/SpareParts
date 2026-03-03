"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTenantLanguageDto = exports.LanguageCode = void 0;
const class_validator_1 = require("class-validator");
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["EN"] = "EN";
    LanguageCode["AR"] = "AR";
})(LanguageCode || (exports.LanguageCode = LanguageCode = {}));
class UpdateTenantLanguageDto {
}
exports.UpdateTenantLanguageDto = UpdateTenantLanguageDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LanguageCode),
    __metadata("design:type", String)
], UpdateTenantLanguageDto.prototype, "defaultLanguage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsEnum)(LanguageCode, { each: true }),
    __metadata("design:type", Array)
], UpdateTenantLanguageDto.prototype, "supportedLanguages", void 0);
//# sourceMappingURL=update-tenant-language.dto.js.map