import { getSelectedAccount } from "./accountService";
import { getSelectedNode } from "./nodesService";

export const linkTelegram = async (token: string, telegramId: string) => {
  const currentNode = await getSelectedNode();
  const user = await getSelectedAccount();

  const res = await fetch(currentNode.url + "/api/v2/user/link_tg", {
    method: "POST",
    body: JSON.stringify({
      token: token,
      userId: telegramId,
    }),
    headers: {
      "Content-Type": "application/json",
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
    },
  });

  return res.ok;
};

export const unlinkTelegram = async () => {
  const currentNode = await getSelectedNode();
  const user = await getSelectedAccount();

  const res = await fetch(currentNode.url + "/api/v2/user/unlink_tg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
    },
  });

  return res.ok;
};
