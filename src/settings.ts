import { Nodes } from "./db/schema/nodesSchema";

export const baseNode: typeof Nodes.$inferSelect = {
  ping: 99999,
  name: "Default",
  url: "",
  id: "100",
  selected: "false",
};
