import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;
const password = "Theresia@0808";
const hash = await bcrypt.hash(password, SALT_ROUNDS);

console.log(hash);
