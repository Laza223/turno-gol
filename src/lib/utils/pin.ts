import { hash, compare } from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPin(pin: string): Promise<string> {
  return hash(pin, SALT_ROUNDS);
}

export async function verifyPin(
  pin: string,
  hashedPin: string
): Promise<boolean> {
  return compare(pin, hashedPin);
}
