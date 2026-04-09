import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import surveyRoutes from "./modules/survey/survey.routes";
import communityRoutes from "./modules/community/community.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.routes";
import settingsRoutes from "./modules/settings/settings.routes";
import { globalErrorHandler } from "./middlewares/error";
import learningRoutes from "./modules/learning/learning.routes";
import routineRoutes from "./modules/routine/routine.routes";
import rewardsRoutes from "./modules/rewards/rewards.routes";
import gamesRoutes from "./modules/games/games.routes";
import progressRoutes from "./modules/progress/progress.routes";
import articlesRoutes from "./modules/articles/articles.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

// ✅ كل الـ routes الأول
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/survey", surveyRoutes);
app.use("/community", communityRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/settings", settingsRoutes);
app.use("/learning", learningRoutes);
app.use("/routine", routineRoutes);
app.use("/rewards", rewardsRoutes);
app.use("/games", gamesRoutes);
app.use("/progress", progressRoutes);
app.use("/articles", articlesRoutes);
app.use(globalErrorHandler);

export default app;