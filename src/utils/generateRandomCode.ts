export default function generateRandomCode(): string {
  return String(Math.floor(Math.random() * 100000));
};
