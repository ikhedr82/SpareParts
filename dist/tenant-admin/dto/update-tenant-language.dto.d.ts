export declare enum LanguageCode {
    EN = "EN",
    AR = "AR"
}
export declare class UpdateTenantLanguageDto {
    defaultLanguage?: LanguageCode;
    supportedLanguages?: LanguageCode[];
}
