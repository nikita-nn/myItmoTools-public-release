import { db } from "../db/db";
import { Nodes } from "../db/schema/nodesSchema";
import { eq } from "drizzle-orm";
import { baseNode } from "../settings";
import chalk from "chalk";
import Table from "cli-table3";

export const showSelectedNode = async () => {
  const selectedNode = await getSelectedNode();
  if (selectedNode) {
    return console.log(
      chalk.greenBright(`Selected node ${chalk.blueBright(selectedNode.name)}`),
    );
  } else {
    return console.log(chalk.greenBright(`Selected default node`));
  }
};

export const getNodes = async () => {
  let selectedNode = await getSelectedNode();
  const res = await fetch(
    (!selectedNode ? baseNode.url : selectedNode.url) + "/api/v2/nodes",
  );

  if (!res.ok) {
    return null;
  }

  const nodes = await res.json();
  for (const node of nodes.data) {
    await db
      .insert(Nodes)
      .values(node)
      .onConflictDoUpdate({
        target: Nodes.name,
        set: { name: node.name, url: node.url, ping: node.ping },
      });
  }

  if (!selectedNode) {
    await setSelectedNode(nodes.data[0].name);
  }

  return nodes.data;
};

export const setSelectedNode = async (nodeName: string) => {
  await clearNodeSelection();
  await db
    .update(Nodes)
    .set({ selected: "true" })
    .where(eq(Nodes.name, nodeName));
};

export const getSelectedNode = async () => {
  const node = await db
    .select()
    .from(Nodes)
    .where(eq(Nodes.selected, "true"))
    .then((nodes) => nodes[0]);

  if (!node) {
    return baseNode;
  }
  return node;
};

export const clearNodeSelection = async () =>
  await db.update(Nodes).set({ selected: "false" });

const colorPing = (ping: number) => {
  if (ping < 400) {
    return chalk.greenBright(`${ping}ms`);
  } else if (ping < 600) {
    return chalk.yellowBright(`${ping}ms`);
  } else if (ping == 99999) {
    return chalk.redBright(`Offline`);
  } else {
    return chalk.redBright(`${ping}ms`);
  }
};

export const constructNodeTable = (names: string[], load: number[]) => {
  const table = new Table({
    head: [chalk.whiteBright("Node"), chalk.whiteBright("Node -> MyITMO")],
  });

  names.forEach((name, index) => {
    table.push([name, colorPing(load[index])]);
  });

  return String(table);
};
