import crypto from 'crypto';

const SECRET = process.env.CARD_ENCRYPTION_SECRET || 'multistore_dev_card_secret_2026';

function getKey() {
  return crypto.createHash('sha256').update(SECRET).digest();
}

export function encryptText(value: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptText(encryptedValue: string) {
  const [ivHex, encrypted] = encryptedValue.split(':');

  if (!ivHex || !encrypted) {
    throw new Error('Token cifrado inválido');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    getKey(),
    Buffer.from(ivHex, 'hex')
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function getCardLastFour(cardNumber?: string) {
  if (!cardNumber) return null;

  const clean = cardNumber.replace(/\D/g, '');

  if (clean.length < 4) return null;

  return clean.slice(-4);
}

export function tokenizeCard(cardNumber?: string) {
  if (!cardNumber) return null;

  const clean = cardNumber.replace(/\D/g, '');

  if (clean.length < 12) {
    throw new Error('Número de tarjeta inválido');
  }

  const payload = JSON.stringify({
    type: 'CARD_TOKEN',
    lastFour: clean.slice(-4),
    fingerprint: crypto.createHash('sha256').update(clean).digest('hex'),
    createdAt: new Date().toISOString(),
  });

  return encryptText(payload);
}