import { db } from "../db/db";
import { Users } from "../db/schema/userSchema";
import { eq } from "drizzle-orm";
import chalk from "chalk";
import { clearConsole } from "./systemService";
import { getSelectedNode } from "./nodesService";

export const loginUser = async (username: string, password: string) => {
  const currentNode = await getSelectedNode();
  const res = await fetch(currentNode.url + "/api/v2/auth/login", {
    method: "POST",
    body: JSON.stringify({
      isu_id: username.trim(),
      password: password.trim(),
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    return false;
  }

  const json = await res.json();
  const accounts = await db.select().from(Users);
  if (accounts.filter((account) => account.isu_id == username).length > 0) {
    return false;
  }
  await db
    .insert(Users)
    .values({ ...json.data, timeToUpdate: getRefreshDate() });
  await clearConsole();
  return true;
};

export const selectAccount = async (isuId: string) => {
  await db.update(Users).set({ selected: "false" });
  await db
    .update(Users)
    .set({ selected: "true" })
    .where(eq(Users.isu_id, isuId));
};

export const getSelectedAccount = async () => {
  const account = await db
    .select()
    .from(Users)
    .where(eq(Users.selected, "true"))
    .then((accounts) => accounts[0]);
  if (account) {
    return account;
  } else {
    return null;
  }
};

export const showSelectedAccount = async () => {
  const checkResult = await getSelectedAccount();
  if (checkResult) {
    return console.log(
      chalk.greenBright(
        `Selected account ${chalk.blueBright(checkResult.isu_id)}`,
      ),
    );
  } else {
    return console.log(
      chalk.redBright(`Please select account in "Accounts" menu`),
    );
  }
};

const getRefreshDate = () => {
  let dt = new Date();
  dt.setMonth(dt.getMonth() + 1);
  return dt;
};

export const deleteAccount = async (isu_id: string) =>
  await db.delete(Users).where(eq(Users.isu_id, isu_id));
