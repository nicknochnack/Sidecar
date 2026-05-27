const axios = require("axios");

const baseUrl = "http://localhost:5050";

(async () => {
  const res = await axios.post(`${baseUrl}/auth/login`, {
    email: "nicholas.renotte@gmail.com",
    password: "abc123",
  });
  console.log(res);
  process.exit();
})();
