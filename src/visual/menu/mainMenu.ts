import inquirer from "inquirer";
import { clearConsole } from "../../service/systemService";
import { showAccountsMenu } from "./accounts/accountsMenu";
import { showSettingsMenu } from "./settingsMenu";
import { getSelectedAccount } from "../../service/accountService";
import { showStartMenu } from "./startMenu";
import { showTelegramLoginPrompt } from "../prompts/linkTelegramPrompt";
import { db } from "../../db/db";
import { Users } from "../../db/schema/userSchema";
import ora from "ora";
import { linkTelegram, unlinkTelegram } from "../../service/telegramService";
import { eq } from "drizzle-orm";

export const showMainMenu = async () => {
  const selectedAccount = await getSelectedAccount();

  const mainMenuChoices = [
    { value: "accounts", name: "Accounts" },
    { value: "settings", name: "Settings" },
  ];

  if (selectedAccount) {
    mainMenuChoices.unshift({ value: "start", name: "Start" });
  }

  if (selectedAccount && selectedAccount.isTelegramLinked == "false") {
    mainMenuChoices.push({
      value: "link",
      name: `Link telegram -> account ${selectedAccount.isu_id}`,
    });
  } else if (selectedAccount) {
    mainMenuChoices.push({
      value: "unlink",
      name: `Unlink telegram -> account ${selectedAccount.isu_id}`,
    });
  }

  mainMenuChoices.push({ value: "exit", name: "Exit" });

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
        case "link":
          await clearConsole();
          const telegramLinkData = await showTelegramLoginPrompt();
          await clearConsole();
          const telegramSpinner = ora({
            spinner: "aesthetic",
            text: "Linking telegram account...",
          }).start();
          const telegramLinkResult = await linkTelegram(
            telegramLinkData.bot_token,
            telegramLinkData.telegramId,
          );
          if (telegramLinkResult) {
            await db
              .update(Users)
              .set({ isTelegramLinked: "true" })
              .where(eq(Users.isu_id, String(selectedAccount?.isu_id)));
            telegramSpinner.succeed("Telegram linked successfully");
          } else {
            telegramSpinner.fail("Can not link telegram to your account");
          }
          setTimeout(async () => {
            await clearConsole();
            await showMainMenu();
          }, 2000);
          break;
        case "unlink":
          await clearConsole();
          const unlinkTelegramSpinner = ora({
            spinner: "aesthetic",
            text: "Unlinking telegram...",
          });
          const result = await unlinkTelegram();
          if (result) {
            unlinkTelegramSpinner.succeed("Telegram unlinked successfully");
            await db
              .update(Users)
              .set({ isTelegramLinked: "false" })
              .where(eq(Users.isu_id, String(selectedAccount?.isu_id)));
          } else {
            unlinkTelegramSpinner.fail("Telegram unlinked successfully");
          }
          setTimeout(async () => {
            await clearConsole();
            await showMainMenu();
          }, 2000);
          break;
        case "exit":
          console.clear();
          process.exit(0);
      }
    });
};
