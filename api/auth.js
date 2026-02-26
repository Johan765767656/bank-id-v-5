'use strict';

const BankIDService = require('../src/Service/BankIDService');

/**
 * POST /api/auth
 *
 * Body (JSON):
 *   { personalNumber?: string }
 *
 * Returns OrderResponse JSON.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const service = new BankIDService(
      process.env.BANKID_API_URL,
      req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      {
        verify:  process.env.BANKID_CA_CERT   || false,
        cert:    process.env.BANKID_CERT       || undefined,
        ssl_key: process.env.BANKID_CERT_KEY   || undefined,
      }
    );

    const { personalNumber } = req.body || {};
    const response = await service.getAuthResponse(personalNumber || null);

    return res.status(200).json(response);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};
