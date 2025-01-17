import { PESettings } from "../../db/schema/peSchema";
import { db } from "../../db/db";
import ora from "ora";
import { Users } from "../../db/schema/userSchema";
import { deleteAccount, loginUser } from "../accountService";
import { baseNode } from "../../settings";
import { Nodes } from "../../db/schema/nodesSchema";
import chalk from "chalk";
import { clearNodeSelection, setSelectedNode } from "../nodesService";
import { asyncSleep } from "../systemService";
import { System } from "../../db/schema/systemSchema";
import { checkAccessKey } from "../keyService";

export const healthCheck = async () => {
  console.log("");
  console.log(chalk.yellowBright("Healthcheck of MyITMO Tools started."));
  console.log("");
  const dbTablesResult = await checkDBTables();
  await checkTokenOfAccounts();
  const nodeCheckingResult = await pingAndChangeNode();
  await checkActivationOfSoftware();
  if (!nodeCheckingResult || !dbTablesResult) {
    console.log(
      chalk.redBright("Health check failed, please contact me @pay4x"),
    );
    process.exit(1);
  } else {
    console.log(chalk.greenBright("Health check passed!"));
  }

  return true;
};

const checkPESettingsRow = async () => {
  const peSettingsRow = await db
    .select()
    .from(PESettings)
    .then((rows) => rows[0]);

  if (!peSettingsRow) {
    await db.insert(PESettings).values({ id: 1 });
  }
};

const checkSystemRow = async () => {
  const systemRow = await db
    .select()
    .from(System)
    .then((system) => system[0]);

  if (!systemRow) {
    await db.insert(System).values({ id: 1 });
  }
};

const checkActivationOfSoftware = async () => {
  const systemData = await db
    .select()
    .from(System)
    .then((system) => system[0]);
  const result = await checkAccessKey(systemData.key || "");

  if (result) {
  } else {
    await db.update(System).set({ key: null, activatedTo: null });
  }
};

const checkDBTables = async () => {
  const dbSpinner = ora({
    spinner: "aesthetic",
    text: "Checking tables...",
  }).start();

  try {
    await db.select().from(PESettings);
    await checkPESettingsRow();
    await db.select().from(Users);
    await db.select().from(Nodes);
    await checkSystemRow();
  } catch (e) {
    dbSpinner.fail(`Checked tables. Error ${e.message}!`);
    return false;
  }

  dbSpinner.succeed("Checked tables. Success!");
  return true;
};

const generateAliveNodes = async (nodes: (typeof Nodes.$inferSelect)[]) => {
  let aliveNodes: (typeof Nodes.$inferSelect)[] = [];

  for (const node of nodes) {
    const nodeSpinner = ora({
      spinner: "aesthetic",
      text: `Checking node ${chalk.blueBright(node.name)}...`,
    });
    await asyncSleep(200);
    const result = await pingSingleNode(node.url);
    if (!result) {
      nodeSpinner.fail(
        `Checked node ${chalk.redBright(`${node.name}`)}. Error!`,
      );
    } else {
      nodeSpinner.succeed(
        `Checked node ${chalk.whiteBright(`${node.name}`)} (${result} ms). Success!`,
      );
      aliveNodes.push(node);
    }
  }

  const baseNodeSpinner = ora({
    spinner: "aesthetic",
    text: "Checking base node...",
  }).start();

  const resultBase = await pingSingleNode(baseNode.url);

  if (!resultBase) {
    baseNodeSpinner.fail("Checked base node. Error!");
  } else {
    baseNodeSpinner.succeed("Checked base node. Success!");
    aliveNodes.push(baseNode);
  }
  return aliveNodes;
};

const pingAndChangeNode = async () => {
  const nodes = await db.select().from(Nodes);
  const aliveNodes = await generateAliveNodes(nodes);
  if (aliveNodes.length == 0) {
    return false;
  } else {
    if (aliveNodes.length == 1 && aliveNodes[0].name == "Default") {
      await clearNodeSelection();
    } else {
      await setSelectedNode(aliveNodes[0].name);
    }
  }
  return true;
};

const checkTokenOfAccounts = async () => {
  const accountSpinner = ora({
    spinner: "aesthetic",
    text: "Checking account data...",
  }).start();

  const accounts = await db.select().from(Users);
  const now = new Date();
  for (const account of accounts) {
    if (!account.timeToUpdate) {
      await deleteAccount(account.isu_id);
      continue;
    }

    if (account.timeToUpdate < now) {
      const result = await loginUser(account.isu_id, account.password);
      if (!result) {
        await deleteAccount(account.isu_id);
      }
    }
  }
  accountSpinner.succeed("Account data checked. Success!");
};

const pingSingleNode = async (node: string) => {
  try {
    const start = Date.now();
    await fetch(node);
    const end = Date.now();
    return end - start;
  } catch (error) {
    return false;
  }
};
