const crypto = require('crypto');

const QRCODE_SECRET = process.env.QRCODE_SECRET || 'rx_qrcode_secret_key_2026_#$';
const ALGORITHM = 'aes-256-gcm';

const generateQrCodeToken = (prescriptionId, patientIdCard) => {
  const plaintext = JSON.stringify({
    pid: prescriptionId,
    idc: patientIdCard,
    ts: Date.now()
  });

  const key = crypto.scryptSync(QRCODE_SECRET, 'rx-salt', 32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  const token = Buffer.concat([iv, authTag, encrypted]).toString('base64url');
  return token;
};

const parseQrCodeToken = (token) => {
  try {
    const buf = Buffer.from(token, 'base64url');
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);

    const key = crypto.scryptSync(QRCODE_SECRET, 'rx-salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]).toString('utf8');

    const data = JSON.parse(plaintext);
    return {
      prescriptionId: data.pid,
      patientIdCard: data.idc,
      timestamp: data.ts
    };
  } catch (err) {
    return null;
  }
};

const maskIdCard = (idCard) => {
  if (!idCard || idCard.length < 8) return idCard || '';
  const prefix = idCard.slice(0, 6);
  const suffix = idCard.slice(-4);
  const middle = '*'.repeat(idCard.length - 10);
  return `${prefix}${middle}${suffix}`;
};

module.exports = {
  generateQrCodeToken,
  parseQrCodeToken,
  maskIdCard
};
