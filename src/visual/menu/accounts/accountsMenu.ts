import inquirer from "inquirer";
import { db } from "../../../db/db";
import { Users } from "../../../db/schema/userSchema";
import {
  deleteAccount,
  loginUser,
  selectAccount,
} from "../../../service/accountService";
import { showMainMenu } from "../mainMenu";
import { clearConsole } from "../../../service/systemService";
import ora from "ora";
import { showLoginPrompt } from "../../prompts/loginPrompt";

export const showAccountsMenu = async () => {
  const accounts = await db.select().from(Users);
  const accountChoices = accounts.map((account) => {
    return { value: account.isu_id, name: `Account: ${account.isu_id}` };
  });
  accountChoices.push({ value: "add", name: "+ Add a account " });
  accountChoices.push({ value: "delete", name: "x Delete account " });
  accountChoices.push({ value: "back", name: "> Back " });
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Accounts",
        choices: accountChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "add":
          await clearConsole();
          const { isu_id, password } = await showLoginPrompt();
          const spinner = ora({
            spinner: "aesthetic",
            text: "Authenticating...",
          }).start();
          const result = await loginUser(isu_id, password);

          if (result) {
            spinner.succeed("Account added successfully.");
          } else {
            spinner.fail("Error adding account");
          }
          setTimeout(async () => {
            await clearConsole();
            await showAccountsMenu();
          }, 1500);
          break;
        case "back":
          await clearConsole();
          await showMainMenu();
          break;
        case "delete":
          await clearConsole();
          await showDeleteAccountMenu();
          break;
        default:
          await selectAccount(choice.action);
          await clearConsole();
          await showMainMenu();
          break;
      }
    });
};

export const showDeleteAccountMenu = async () => {
  const accounts = await db.select().from(Users);

  const deleteAccountChoices = accounts.map((account) => {
    return { value: account.isu_id, name: `Account: ${account.isu_id}` };
  });

  deleteAccountChoices.push({ value: "back", name: "> Back " });

  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Select account to delete",
        choices: deleteAccountChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsole();
          await showAccountsMenu();
          break;
        default:
          await deleteAccount(choice.action);
          await clearConsole();
          await showAccountsMenu();
          break;
      }
    });
};
