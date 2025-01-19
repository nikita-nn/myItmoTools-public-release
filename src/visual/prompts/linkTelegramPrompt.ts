import inquirer from "inquirer";

export const showTelegramLoginPrompt = async () => {
  const { bot_token } = await inquirer.prompt([
    {
      type: "input",
      name: "bot_token",
      message: "Enter your bot token: ",
    },
  ]);

  const { telegramId } = await inquirer.prompt([
    {
      type: "password",
      name: "telegramId",
      message: "Enter your telegram ID // NOT USERNAME: ",
    },
  ]);
  return { bot_token, telegramId };
};
