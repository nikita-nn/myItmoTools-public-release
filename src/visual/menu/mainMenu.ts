import inquirer from "inquirer";
import { clearConsole } from "../../service/systemService";
import { showAccountsMenu } from "./accounts/accountsMenu";
import { showSettingsMenu } from "./settingsMenu";
import { getSelectedAccount } from "../../service/accountService";
import { showStartMenu } from "./startMenu";

export const showMainMenu = async () => {
  const selectedAccount = await getSelectedAccount();
  const mainMenuChoices = [
    { value: "accounts", name: "Accounts" },
    { value: "settings", name: "Settings" },
    { value: "exit", name: "Exit" },
  ];
  if (selectedAccount) {
    mainMenuChoices.unshift({ value: "start", name: "Start" });
  }
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Main menu",
        choices: mainMenuChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "accounts":
          await clearConsole();
          await showAccountsMenu();
          break;
        case "settings":
          await clearConsole();
          await showSettingsMenu();
          break;
        case "start":
          await clearConsole();
          showStartMenu();
          break;
        case "exit":
          console.clear();
          process.exit(0);
      }
    });
};
