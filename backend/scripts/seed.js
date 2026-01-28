const db = require('../db');

async function run() {
  try {
    db.init();
    console.log('DB initialized (seed executed in init).');
  } catch (err) {
    console.error(err);
  }
}

run();
