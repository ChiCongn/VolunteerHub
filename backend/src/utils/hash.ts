import bcrypt from "bcrypt";

// balance between security and performance (gpt recommend :vvv)
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 * @param password Plain text password
 * @param hash Hashed password from DB
 * @returns true if match, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
