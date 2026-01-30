import { Handler } from "@netlify/functions";
import jwt from "jsonwebtoken";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "";

const handler: Handler = async (event) => {
    const allowedOrigins = ["https://agentauth.in", "https://www.agentauth.in", "http://localhost:5173"];
    const origin = event.headers["origin"] || "";
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    const headers = {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json",
    };

    if (!ADMIN_PASSWORD || !JWT_SECRET) {
        return { statusCode: 503, headers, body: JSON.stringify({ error: "Server not configured" }) };
    }

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    try {
        const { password } = JSON.parse(event.body || "{}");

        if (password !== ADMIN_PASSWORD) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ detail: "Invalid password" }),
            };
        }

        // Create token
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const token = jwt.sign(
            { type: "admin", exp: Math.floor(expiresAt.getTime() / 1000) },
            JWT_SECRET
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                token,
                expires_at: expiresAt.toISOString(),
                message: "Login successful",
            }),
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Invalid request" }),
        };
    }
};

export { handler };
