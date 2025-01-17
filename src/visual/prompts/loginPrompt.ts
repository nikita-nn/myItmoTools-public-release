import inquirer from "inquirer";

export const showLoginPrompt = async () => {
  const { isu_id } = await inquirer.prompt([
    {
      type: "input",
      name: "isu_id",
      message: "Enter your ISU ID: ",
    },
  ]);

  const { password } = await inquirer.prompt([
    {
      type: "password",
      name: "password",
      message: "Enter your MyITMO password: ",
    },
  ]);

  return { isu_id, password };
};
