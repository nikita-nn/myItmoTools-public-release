import { getSelectedAccount } from "../accountService";
import { getSelectedNode } from "../nodesService";
import { db } from "../../db/db";
import { PESettings } from "../../db/schema/peSchema";
import { clearPESettings, getPEData } from "./peService";
import chalk from "chalk";
import ora from "ora";

export const getBuildings = async () => {
  const user = await getSelectedAccount();
  const node = await getSelectedNode();
  const res = await fetch(node.url + "/api/v2/pe/lessons_initial", {
    headers: {
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
    },
  });

  const json = await res.json();

  return json.data["building_id"];
};

export const getAllLessonsData = async (date: string, buildingId: string) => {
  const user = await getSelectedAccount();
  const node = await getSelectedNode();
  const res = await fetch(
    node.url + `/api/v2/pe/lessons?date=${date}&buildingId=${buildingId}`,
    {
      headers: {
        "X-Username": String(user?.isu_id),
        "X-Password": String(user?.password),
      },
    },
  );

  const json = await res.json();

  return json.data;
};

export const prepareTimeSlotLessons = (allLessons: any, timeSlot: string) => {
  return allLessons.filter(
    (lesson: { time_slot_start: string; lesson_level: number }) =>
      lesson.time_slot_start == timeSlot && lesson.lesson_level != 3,
  );
};

export const findLessonsByType = (timeSlotLessons: any, type: string) => {
  return timeSlotLessons.filter(
    (lesson: { section_name: string }) =>
      lesson.section_name.trim() == type.trim(),
  );
};

export const setTargetLesson = async (
  filteredLessons: any,
  targetTeacher: string,
) => {
  const targetLesson = filteredLessons.find(
    (lesson: { teacher_fio: string }) => lesson.teacher_fio === targetTeacher,
  );
  await db.update(PESettings).set({ taskId: targetLesson.id });
};

export const getActiveLessonTasks = async () => {
  const node = await getSelectedNode();
  const user = await getSelectedAccount();

  const res = await fetch(node.url + "/api/v2/pe/active", {
    headers: {
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
    },
  });

  const json = await res.json();

  return json.data;
};

export const launchTask = async () => {
  const node = await getSelectedNode();
  const user = await getSelectedAccount();
  const peSettings = await getPEData();
  const launchTaskSpinner = ora({
    spinner: "aesthetic",
    text: `Launching task... Mode: ${chalk.whiteBright(peSettings.mode)} Lesson: ${chalk.whiteBright(peSettings.taskId)}`,
  }).start();

  const res = await fetch(node.url + "/api/v2/pe/sign", {
    method: "POST",
    headers: {
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lesson_id: peSettings.taskId,
    }),
  });

  if (res.ok) {
    await clearPESettings();
    launchTaskSpinner.succeed("Launched task. Success!");
  } else {
    launchTaskSpinner.fail("Error launching task. Please start healthcheck! ");
  }
};

export const stopLessonTask = async (task_id: number) => {
  const node = await getSelectedNode();
  const user = await getSelectedAccount();

  const stopTaskSpinner = ora({
    spinner: "aesthetic",
    text: `Stopping task...`,
  }).start();

  const res = await fetch(node.url + "/api/v2/pe/stop", {
    method: "POST",
    headers: {
      "X-Username": String(user?.isu_id),
      "X-Password": String(user?.password),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task_id: task_id,
    }),
  });

  if (res.ok) {
    await clearPESettings();
    stopTaskSpinner.succeed("Stopped task. Success!");
  } else {
    stopTaskSpinner.fail(
      "Error while stopping task. Please start healthcheck! ",
    );
  }
};
