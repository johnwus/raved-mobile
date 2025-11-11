"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const path_1 = __importDefault(require("path"));
(async () => {
    await i18next_1.default
        .use(i18next_fs_backend_1.default)
        .use(i18next_http_middleware_1.default.LanguageDetector)
        .init({
        fallbackLng: 'en',
        lng: 'en',
        ns: ['common', 'auth', 'errors', 'notifications'],
        defaultNS: 'common',
        backend: {
            loadPath: path_1.default.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
        },
        detection: {
            order: ['header', 'querystring', 'cookie'],
            lookupHeader: 'accept-language',
            lookupQuerystring: 'lang',
            lookupCookie: 'i18next',
            caches: ['cookie'],
        },
    });
})();
exports.default = i18next_1.default;
