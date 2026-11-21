module.exports = function handler(req, res) {
  return res.status(200).json({
    ok: true,
    providerConfigured: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY)
  });
};