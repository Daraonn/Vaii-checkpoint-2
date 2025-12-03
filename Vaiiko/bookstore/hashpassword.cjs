const bcrypt = require('bcrypt');

(async () => {
  const password = 'administrator';
  const hashed = await bcrypt.hash(password, 10);
  console.log(hashed);
})();