"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
// Generate JWT Token
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.CONFIG.JWT_SECRET, { expiresIn: '24h' });
}
exports.generateToken = generateToken;
// Generate Refresh Token
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_1.CONFIG.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
exports.generateRefreshToken = generateRefreshToken;
// Verify Token
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
exports.verifyToken = verifyToken;
// Hash Password
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
exports.hashPassword = hashPassword;
// Compare Password
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
exports.comparePassword = comparePassword;
