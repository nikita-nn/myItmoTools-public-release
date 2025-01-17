import inquirer from "inquirer";
import { activateAccessKey } from "../../service/keyService";
import ora from "ora";
import { db } from "../../db/db";
import { System } from "../../db/schema/systemSchema";
import { getSelectedAccount } from "../../service/accountService";

export const showEnterKeyPrompt = async () => {
  const { key } = await inquirer.prompt({
    type: "input",
    name: "key",
    message: "Enter activation key",
  });

  const account = await getSelectedAccount();

  const spinner = ora({
    spinner: "aesthetic",
    text: "Checking your access key...",
  }).start();

  const keyCheckResult = await activateAccessKey(key);

  if (keyCheckResult) {
    spinner.succeed("Access key checked. Success!");
    await db.update(System).set({ key: key, activatedTo: account?.isu_id });
  } else {
    spinner.fail("Access key checked. Error!");
  }
};
