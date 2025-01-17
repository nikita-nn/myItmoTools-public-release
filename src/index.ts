import { showMainMenu } from "./visual/menu/mainMenu";
import { clearConsole } from "./service/systemService";
import { getNodes } from "./service/nodesService";
import { healthCheck } from "./service/system/healthCheck";
import { clearPESettings } from "./service/pe/peService";

const main = async () => {
  console.clear();
  await healthCheck();
  setTimeout(async () => {
    await clearPESettings();
    await getNodes();
    await clearConsole();
    await showMainMenu();
  }, 2000);
};

main();
