import inquirer from "inquirer";
import { clearConsole } from "../../service/systemService";
import { showMainMenu } from "./mainMenu";
import {
  constructNodeTable,
  getNodes,
  setSelectedNode,
} from "../../service/nodesService";
import { db } from "../../db/db";
import { Nodes } from "../../db/schema/nodesSchema";
import { healthCheck } from "../../service/system/healthCheck";
import { showActivateCopyMenu } from "./keyMenu";

export const showSettingsMenu = async () => {
  const settingsChoices = [
    { value: "activate", name: "Activation" },
    {
      name: "Nodes",
      value: "node",
    },
    { name: "Healthcheck system", value: "healthcheck" },
    { name: "> Back", value: "back" },
  ];

  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Settings",
        choices: settingsChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "activate":
          await clearConsole();
          await showActivateCopyMenu();
          break;
        case "node":
          await clearConsole();
          await showNodeMenu();
          break;
        case "back":
          await clearConsole();
          await showMainMenu();
          break;
        case "healthcheck":
          console.clear();
          await healthCheck();
          setTimeout(async () => {
            await clearConsole();
            await showSettingsMenu();
          }, 2000);
          break;
      }
    });
};

const showNodeMenu = async () => {
  await getNodes();
  const nodes = await db.select().from(Nodes);
  const nodeChoices = nodes.map((node) => {
    return { value: node.name, name: node.name };
  });
  nodeChoices.push({ name: "> Back", value: "back" });
  nodeChoices.push({ name: "↻ Update", value: "update" });
  console.log(
    constructNodeTable(
      nodes.map((node) => node.name),
      nodes.map((node) => node.ping),
    ),
  );
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Choose node ( advanced )",
        choices: nodeChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsole();
          await showSettingsMenu();
          break;
        case "update":
          await clearConsole();
          await getNodes();
          await showNodeMenu();
          break;
        default:
          await setSelectedNode(choice.action);
          await clearConsole();
          await showNodeMenu();
          break;
      }
    });
};
