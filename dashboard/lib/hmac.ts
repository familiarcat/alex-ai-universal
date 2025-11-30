import crypto from 'crypto';

export function signBody(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

export function verifySignature({
  body,
  signature,
  secret,
  timestamp,
  toleranceMs = 300000,
}: {
  body: string;
  signature: string;
  secret: string;
  timestamp: number;
  toleranceMs?: number;
}): boolean {
  const now = Date.now();
  if (Math.abs(now - timestamp) > toleranceMs) return false;
  const expected = signBody(body + String(timestamp), secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}


