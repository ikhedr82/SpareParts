"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductNormalizer = void 0;
class ProductNormalizer {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async normalize(raw, manufacturerName) {
        var _a, _b;
        return {
            partNumber: this.normalizePartNumber(raw.partNumber),
            name: this.generateProductName(raw),
            description: ((_a = raw.description) === null || _a === void 0 ? void 0 : _a.trim()) || undefined,
            brandName: raw.brand || manufacturerName,
            categoryName: raw.category || 'Engine Parts',
            weight: raw.weight,
            dimensions: ((_b = raw.dimensions) === null || _b === void 0 ? void 0 : _b.trim()) || undefined,
            unitOfMeasure: this.detectUnitOfMeasure(raw),
            images: raw.images || [],
            alternatePartNumbers: this.normalizeAlternatePartNumbers(raw.alternatePartNumbers || []),
            fitments: this.normalizeFitments(raw.fitment || []),
            rawData: raw,
        };
    }
    normalizePartNumber(partNumber) {
        return partNumber
            .trim()
            .toUpperCase()
            .replace(/\s+/g, ' ');
    }
    generateProductName(raw) {
        if (raw.name) {
            return raw.name.trim();
        }
        return `${raw.brand} ${raw.partNumber}`.trim();
    }
    detectUnitOfMeasure(raw) {
        var _a, _b;
        const name = ((_a = raw.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        const desc = ((_b = raw.description) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
        const combined = `${name} ${desc}`.toLowerCase();
        if (combined.includes('pair') || combined.includes(' pr ')) {
            return 'PR';
        }
        if (combined.includes('set') || combined.includes('kit')) {
            return 'SET';
        }
        if (combined.includes('liter') || combined.includes('quart') || combined.includes(' l ')) {
            return 'LT';
        }
        if (combined.includes('kg') || combined.includes('kilogram')) {
            return 'KG';
        }
        return 'EA';
    }
    normalizeAlternatePartNumbers(alternates) {
        return alternates
            .map(pn => this.normalizePartNumber(pn))
            .filter(pn => pn.length > 0);
    }
    normalizeFitments(fitments) {
        return fitments.map(f => {
            var _a, _b, _c;
            return ({
                make: this.normalizeMakeName(f.make),
                model: f.model.trim(),
                yearStart: f.yearStart,
                yearEnd: f.yearEnd,
                engineType: ((_a = f.engineType) === null || _a === void 0 ? void 0 : _a.trim()) || undefined,
                position: ((_b = f.position) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || undefined,
                notes: ((_c = f.notes) === null || _c === void 0 ? void 0 : _c.trim()) || undefined,
            });
        });
    }
    normalizeMakeName(make) {
        const normalized = make.trim();
        const makeMap = {
            'CHEVROLET': 'Chevrolet',
            'CHEVY': 'Chevrolet',
            'TOYOTA': 'Toyota',
            'HONDA': 'Honda',
            'FORD': 'Ford',
            'NISSAN': 'Nissan',
            'BMW': 'BMW',
            'MERCEDES': 'Mercedes-Benz',
            'MERCEDES-BENZ': 'Mercedes-Benz',
            'VW': 'Volkswagen',
            'VOLKSWAGEN': 'Volkswagen',
        };
        return makeMap[normalized.toUpperCase()] || normalized;
    }
}
exports.ProductNormalizer = ProductNormalizer;
//# sourceMappingURL=product-normalizer.js.map