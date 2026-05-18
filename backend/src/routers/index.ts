import express from "express";
import path from "path";
import fs from "fs";

const loadRoutes = (app: express.Router) => {
  const modulesPath = path.join(__dirname, "..", "modules");

  if (!fs.existsSync(modulesPath)) {
    console.warn("No modules directory found");
    return;
  }

  const modules = fs.readdirSync(modulesPath).filter((file: string) => {
    return fs.statSync(path.join(modulesPath, file)).isDirectory();
  });

  modules.forEach((moduleName: any) => {
    const routePath = path.join(modulesPath, moduleName, "routes");

    if (fs.existsSync(routePath)) {
      const routeFiles = fs
        .readdirSync(routePath)
        .filter((file: string) => file.endsWith(".js"));

      routeFiles.forEach((routeFile: string) => {
        const fullRoutePath = path.join(routePath, routeFile);
        const routeModule = require(fullRoutePath);
        const route = routeModule.default || routeModule;

        if (routeFile === "index.js") {
          const basePath = `/${moduleName}`;
          app.use(basePath, route);
          console.log(`Loaded route: ${basePath}`);
        } else {
          const routeName = routeFile.replace(".js", "");
          const basePath = `/${moduleName}/${routeName}`;
          app.use(basePath, route);
          console.log(`Loaded route: ${basePath}`);
        }
      });
    }
  });
};

export default loadRoutes;
