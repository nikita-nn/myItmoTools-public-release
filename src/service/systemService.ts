import chalk from "chalk";
import figlet from "figlet";
import { showSelectedAccount } from "./accountService";
import { showSelectedNode } from "./nodesService";
import { getPEData, showPEMode, showPETargetLesson } from "./pe/peService";
import { showActivationStatus } from "./keyService";

export const clearConsole = async () => {
  console.clear();
  console.log("");
  console.log(
    chalk.magentaBright(figlet.textSync("MyITMO Tools", { font: "3D-ASCII" })),
  );
  console.log(chalk.whiteBright("System settings"));
  console.log("----------------------------");
  await showSelectedNode();
  await showSelectedAccount();
  await showActivationStatus();
  console.log("----------------------------");
  console.log("");
};

export const clearConsolePE = async () => {
  await clearConsole();
  console.log(chalk.whiteBright("Physical education settings"));
  console.log("----------------------------");
  const peData = await getPEData();
  showPEMode(peData);
  showPETargetLesson(peData);
  console.log("----------------------------");
  console.log("");
};

export const asyncSleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
