"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeRegistration = void 0;
const database_1 = require("../config/database");
const auth_utils_1 = require("../utils/auth.utils");
const email_service_1 = require("./email.service");
const completeRegistration = async (data, password) => {
    const client = await database_1.pgPool.connect();
    try {
        await client.query('BEGIN');
        const passwordHash = await (0, auth_utils_1.hashPassword)(password);
        const result = await client.query(`
            INSERT INTO users (
                username, email, phone, password_hash,
                first_name, last_name, faculty, university, student_id,
                email_verified, phone_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)
            RETURNING id, username, email, first_name, last_name, created_at
        `, [
            data.username.toLowerCase(),
            data.email.toLowerCase(),
            data.phone,
            passwordHash,
            data.firstName,
            data.lastName,
            data.faculty,
            data.university,
            data.studentId
        ]);
        const user = result.rows[0];
        await client.query('INSERT INTO user_scores (user_id) VALUES ($1)', [user.id]);
        await client.query('COMMIT');
        const token = (0, auth_utils_1.generateToken)({ userId: user.id, username: user.username });
        const refreshToken = (0, auth_utils_1.generateRefreshToken)({ userId: user.id });
        await database_1.redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);
        await database_1.redis.del(`registration:${data.sessionId}`);
        // Send welcome email
        try {
            await email_service_1.EmailService.sendWelcomeEmail(user.email, user.first_name);
        }
        catch (emailError) {
            console.warn('Welcome email failed to send:', emailError);
            // Don't fail registration if email fails
        }
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            },
            token,
            refreshToken
        };
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.completeRegistration = completeRegistration;
