import express from "express";
import chatbotControllers from "../controllers/chatbotController";
let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", chatbotControllers.getHomepage)
    router.get("/webhook", chatbotControllers.getWebhook);
    router.post("/webhook", chatbotControllers.postWebhook);
    router.get("/profile", chatbotControllers.getFacebookUserProfile);
    router.post("/set-up-user-fb-profile", chatbotControllers.setUpUserFacebookProfile);
    return app.use("/", router);
};

module.exports = initWebRoutes;