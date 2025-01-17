import inquirer from "inquirer";
import { showMainMenu } from "./mainMenu";
import { clearConsole, clearConsolePE } from "../../service/systemService";
import { showPEMenu } from "./modes/physicalEducationMenu";

export const showStartMenu = () => {
  const startChoices = [
    {
      name: "Physical Education",
      value: "pe",
    },
    { name: "> Back", value: "back" },
  ];

  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Start menu",
        choices: startChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsole();
          await showMainMenu();
          break;
        case "pe":
          await clearConsolePE();
          await showPEMenu();
          break;
      }
    });
};
