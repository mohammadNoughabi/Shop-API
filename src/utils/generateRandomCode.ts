export default function generateRandomCode(length: number): string {
  return String(Math.floor(Math.random() * Math.pow(10, length))).padStart(
    length,
    '0',
  );
}
