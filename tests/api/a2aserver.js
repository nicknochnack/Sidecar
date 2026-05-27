const axios = require("axios");

const baseUrl = "http://localhost:5050";

(async () => {
  const res = await axios.post(
    `${baseUrl}/servers`,
    {
      name: "copilot_test",
      description: "test",
      serverType: "A2A",
      config: {
        directLineSecret: "1234567890",
        baseUrl: "https://directline.botframework.com/v3/directline",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFiMGFjMWNjLWE5YWEtNDJhZi1iZGIwLWJkZDU1ZWI0NTJhYiIsImlhdCI6MTc3OTc1NTQ2OH0._RnhAkHa9hsGLJFuejrDxX6AP7JLPWUOenSHRUp4D5M",
      },
    },
  );
  console.log(res.data);
  process.exit();
})();
