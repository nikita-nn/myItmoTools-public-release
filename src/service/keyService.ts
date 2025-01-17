import { getSelectedAccount } from "./accountService";
import { getSelectedNode } from "./nodesService";
import { db } from "../db/db";
import { System } from "../db/schema/systemSchema";
import chalk from "chalk";
import ora from "ora";

export const activateAccessKey = async (key: string) => {
  const user = await getSelectedAccount();
  const node = await getSelectedNode();
  const res = await fetch(node.url + "/api/v2/keys/activate", {
    method: "POST",
    headers: {
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: key }),
  });

  return res.ok;
};

export const checkAccessKey = async (key: string) => {
  const user = await getSelectedAccount();
  const node = await getSelectedNode();

  const res = await fetch(node.url + "/api/v2/keys/check", {
    method: "POST",
    headers: {
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: key }),
  });

  return res.ok;
};

export const getSystemRow = async () =>
  await db
    .select()
    .from(System)
    .then((system) => system[0]);

export const showActivationStatus = async () => {
  const system = await getSystemRow();

  if (system.key) {
    console.log(
      chalk.greenBright(
        `Software activated to ${chalk.blueBright(system.activatedTo)}`,
      ),
    );
  } else {
    console.log(chalk.redBright(`Software doesn't activated.`));
  }
};

export const relinkKey = async (toAcct: string) => {
  const node = await getSelectedNode();
  const user = await getSelectedAccount();

  const keySpinner = ora({
    spinner: "aesthetic",
    text: "Relinking copy...",
  }).start();

  const res = await fetch(node.url + "/api/v2/keys/relink", {
    method: "POST",
    headers: {
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ relink_to: toAcct }),
  });

  if (res.ok) {
    await db.update(System).set({ activatedTo: toAcct });
    keySpinner.succeed("Copy successfully relinked");
  } else {
    keySpinner.fail("Can not relink copy");
  }
};
