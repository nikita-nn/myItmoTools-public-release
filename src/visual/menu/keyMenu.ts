import inquirer from "inquirer";
import { clearConsole } from "../../service/systemService";
import { showEnterKeyPrompt } from "../prompts/keyPrompt";
import { showSettingsMenu } from "./settingsMenu";
import { getSystemRow, relinkKey } from "../../service/keyService";
import { db } from "../../db/db";
import { Users } from "../../db/schema/userSchema";

export const showActivateCopyMenu = async () => {
  const system = await getSystemRow();

  const keyChoices = [
    {
      name: "> Back",
      value: "back",
    },
  ];

  if (!system.key) {
    keyChoices.unshift({ name: "Activate copy", value: "activate" });
  } else {
    keyChoices.unshift({ name: "Relink to account", value: "relink" });
  }

  await inquirer
    .prompt({
      type: "select",
      name: "action",
      message: "Activate copy menu",
      choices: keyChoices,
    })
    .then(async (choice) => {
      switch (choice.action) {
        case "activate":
          await clearConsole();
          await showEnterKeyPrompt();
          setTimeout(async () => {
            await clearConsole();
            await showSettingsMenu();
          }, 2000);
          break;
        case "back":
          await clearConsole();
          await showSettingsMenu();
          break;
        case "relink":
          await clearConsole();
          await showRelinkMenu();
          break;
      }
    });
};

export const showRelinkMenu = async () => {
  const accounts = await db.select().from(Users);
  const accountChoices = accounts.map((account) => {
    return { value: account.isu_id, name: `Account: ${account.isu_id}` };
  });

  accountChoices.push({ value: "back", name: "> Back" });

  await inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Relink key to",
        choices: accountChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsole();
          await showActivateCopyMenu();
          break;
        default:
          await clearConsole();
          await relinkKey(choice.action);
          setTimeout(async () => {
            await clearConsole();
            await showActivateCopyMenu();
          }, 2000);
          break;
      }
    });
};
