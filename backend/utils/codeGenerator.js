/**
 * Generates a unique referral code
 * Format: DGTL-XXXXXX (where X is alphanumeric)
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DGTL-';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

module.exports = { generateReferralCode };
