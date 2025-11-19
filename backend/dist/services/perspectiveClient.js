"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.perspectiveClient = exports.PerspectiveAPI = void 0;
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class PerspectiveAPI {
    constructor(keyFilePath) {
        this.baseUrl = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';
        this.auth = new google_auth_library_1.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
    }
    async analyzeText(text) {
        try {
            const client = await this.auth.getClient();
            const accessToken = await client.getAccessToken();
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken.token}`,
                },
                body: JSON.stringify({
                    comment: { text },
                    languages: ['en'],
                    requestedAttributes: {
                        TOXICITY: {},
                        SEVERE_TOXICITY: {},
                        IDENTITY_ATTACK: {},
                        INSULT: {},
                        PROFANITY: {},
                        THREAT: {},
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`Perspective API error: ${response.status}`);
            }
            return response.json();
        }
        catch (err) {
            console.error('Perspective API error:', err);
            throw err;
        }
    }
}
exports.PerspectiveAPI = PerspectiveAPI;
// Singleton instance
exports.perspectiveClient = new PerspectiveAPI(process.env.PERSPECTIVE_KEY_PATH);
