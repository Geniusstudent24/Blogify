const Settings = require("../model/settings");

const maintenanceMiddleware = async (req, res, next) => {
    try {
        let siteSettings = await Settings.findOne();
        if (!siteSettings) {
            siteSettings = await Settings.create({ isMaintenance: false });
        }

        if (siteSettings.isMaintenance) {
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
                                </style>
                            </head>
                            <body>
                                <div class="box">
                                    <h1>System Maintenance</h1>
                                    <p>Blogify is currently undergoing upgrades. We will be back online shortly.</p>
                                </div>
                            </body>
                        </html>
                    `);
                }
            }
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = maintenanceMiddleware;
