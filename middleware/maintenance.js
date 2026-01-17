const maintenanceMiddleware = (req, res, next) => {
  const isMaintenance = false; 

  if (isMaintenance) {
    if (!req.user || req.user.role !== "ADMIN") {
      if (req.path !== "/user/signin" && req.path !== "/user/signup") {
        return res.send(`
          <html>
            <head>
              <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
              <style>
                body { background: linear-gradient(135deg, #6a00ff 0%, #a170ff 100%); height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Poppins', sans-serif; color: white; margin: 0; }
                .box { text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.3); max-width: 500px; }
                h1 { font-size: 2.5rem; margin-bottom: 10px; }
                p { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; }
                .icon { font-size: 4rem; margin-bottom: 20px; animation: bounce 2s infinite ease-in-out; display: inline-block; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
              </style>
            </head>
            <body>
              <div class="box">
                <div class="icon">🚀</div>
                <h1>Upgrading Blogify!</h1>
                <p>We are currently adding some powerful new features.<br>Please Try again after sometime</p>
              </div>
            </body>
          </html>
        `);
      }
    }
  }
  next();
};

module.exports = maintenanceMiddleware;
