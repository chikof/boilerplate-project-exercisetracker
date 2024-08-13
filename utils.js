
function generateId(length = 24) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randS = "";

  while (length > 0) {
    randS += chars.charAt(Math.floor(Math.random() * chars.length));
    length--;
  }

  return randS;
}

module.exports = { generateId }
