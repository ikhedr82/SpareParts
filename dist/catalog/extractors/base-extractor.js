"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExtractor = void 0;
class BaseExtractor {
    constructor(config) {
        this.config = config;
    }
    async saveRawData(result) {
        const fs = await Promise.resolve().then(() => require('fs/promises'));
        const path = await Promise.resolve().then(() => require('path'));
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${this.config.manufacturerName.toLowerCase()}_${timestamp}.json`;
        const filepath = path.join(this.config.outputDirectory, filename);
        await fs.mkdir(this.config.outputDirectory, { recursive: true });
        await fs.writeFile(filepath, JSON.stringify(result, null, 2), 'utf-8');
        return filepath;
    }
    log(message) {
        console.log(`[${this.config.manufacturerName}] ${message}`);
    }
    logError(message, error) {
        console.error(`[${this.config.manufacturerName}] ERROR: ${message}`, error);
    }
}
exports.BaseExtractor = BaseExtractor;
//# sourceMappingURL=base-extractor.js.map