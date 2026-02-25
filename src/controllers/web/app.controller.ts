// src/controllers/web/AppController.ts
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

class AppController {
  public static serveIndexPage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    try {
      const allowedOrigin = process.env.ALLOWED_ORIGIN;

      if (allowedOrigin && allowedOrigin !== "*") {
        return res.redirect(302, allowedOrigin);
      }

      const appName = process.env.APP_NAME || "Tiny GenAI Proxy";
      const envName = process.env.ENVIRONMENT || "Unknown";

      const filePath = path.join(process.cwd(), "public", "index.html");
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Failed to read index.html in AppController:", err);
          const fileReadError = new Error(
            "Internal Server Error loading page.",
          );
          return next(fileReadError);
        }

        let updatedHtml = data.replace(/{{APP_NAME}}/g, appName);
        updatedHtml = updatedHtml.replace(/{{ENVIRONMENT_NAME}}/g, envName);

        res.setHeader("Content-Type", "text/html");
        res.send(updatedHtml);
      });
    } catch (error) {
      console.error(
        "Synchronous error in AppController.serveIndexPage:",
        error,
      );
      next(error);
    }
  }
}

export default AppController;
// No changes needed for built-in modules like 'path' and 'fs'.
