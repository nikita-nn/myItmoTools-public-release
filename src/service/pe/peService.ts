import { db } from "../../db/db";
import { PESettings } from "../../db/schema/peSchema";
import chalk from "chalk";

export const showPEMode = (peData: typeof PESettings.$inferSelect) => {
  if (peData.mode) {
    console.log(
      chalk.greenBright(`Selected mode: ${chalk.blueBright(peData.mode)}`),
    );
  } else {
    console.log(chalk.redBright('Please select work mode in "Mode" menu.'));
  }
};

export const showPETargetLesson = (peData: typeof PESettings.$inferSelect) => {
  if (peData.taskId) {
    console.log(
      chalk.greenBright(
        `Selected target ID: ${chalk.blueBright(peData.taskId)}`,
      ),
    );
  } else {
    console.log(chalk.redBright('Please select lesson in "Mode" menu.'));
  }
};

export const setPEMode = async (mode: string) =>
  await db.update(PESettings).set({ mode: mode });

export const getPEData = async () =>
  await db
    .select()
    .from(PESettings)
    .then((data) => data[0]);

export const generatePEDates = () => {
  const currentDate = new Date();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return Array.from({ length: 14 }, (_, i) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + i);
    return formatDate(newDate);
  });
};

export const clearPESettings = async () => {
  await db.update(PESettings).set({ taskId: null, mode: null });
};
