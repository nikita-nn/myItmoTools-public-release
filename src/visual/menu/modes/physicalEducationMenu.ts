import inquirer from "inquirer";
import { clearConsole, clearConsolePE } from "../../../service/systemService";
import {
  clearPESettings,
  generatePEDates,
  getPEData,
  setPEMode,
} from "../../../service/pe/peService";
import { showMainMenu } from "../mainMenu";
import {
  findLessonsByType,
  getActiveLessonTasks,
  getAllLessonsData,
  getBuildings,
  launchTask,
  prepareTimeSlotLessons,
  setTargetLesson,
  stopLessonTask,
} from "../../../service/pe/lessonsService";

export const showPEMenu = async () => {
  const peData = await getPEData();
  const peMenuChoices = [
    { value: "mode", name: "Mode" },
    { value: "selectTarget", name: "Select a target" },
    { value: "activeTargets", name: "Active targets" },
    { value: "clear", name: "Reset settings" },
    { value: "back", name: "> Back" },
  ];

  if (peData.taskId && peData.mode) {
    peMenuChoices.unshift({ value: "launch", name: "Launch task" });
  }

  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Physical education menu",
        choices: peMenuChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "mode":
          await clearConsolePE();
          await showPEModeMenu();
          break;
        case "back":
          await clearConsole();
          await showMainMenu();
          break;
        case "launch":
          await clearConsolePE();
          await launchTask();
          setTimeout(async () => {
            await clearConsolePE();
            await showPEMenu();
          }, 2000);
          break;
        case "selectTarget":
          await clearConsolePE();
          await showChooseLessonDateMenu();
          break;
        case "clear":
          await clearPESettings();
          await clearConsolePE();
          await showPEMenu();
          break;
        case "activeTargets":
          await clearConsolePE();
          await showActiveTargetsMenu();
          break;
      }
    });
};

const showPEModeMenu = async () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Select PhysEd work mode",
        choices: [
          { name: "Base_V1", value: "base_V1" },
          { name: "Base_V2", value: "base_V2" },
          { value: "back", name: "> Back" },
        ],
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showPEMenu();
          break;
        default:
          await setPEMode(choice.action.toUpperCase());
          await clearConsolePE();
          await showPEMenu();
          break;
      }
    });
};

const showChooseLessonDateMenu = async () => {
  const datesArray = generatePEDates();

  const dateOptions = datesArray.map((date) => {
    return { value: date, name: date };
  });

  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "Select date of the lesson",
        choices: dateOptions,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showPEMenu();
          break;
        default:
          await clearConsolePE();
          await showBuildingsMenu(choice.action);
          break;
      }
    });
};

const showBuildingsMenu = async (selectedDate: string) => {
  const buildings = await getBuildings();

  const buildingsOptions = buildings.map(
    (building: { id: number; value: string }) => {
      return { value: building.id, name: building.value };
    },
  );

  buildingsOptions.push({ value: "back", name: "> Back" });

  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "Select date of the lesson",
        choices: buildingsOptions,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showPEMenu();
          break;
        default:
          await clearConsolePE();
          await showLessonsTimeSlotMenu(choice.action, selectedDate);
          break;
      }
    });
};

const showLessonsTimeSlotMenu = async (
  buildingId: string,
  selectedDate: string,
) => {
  const allLessons = await getAllLessonsData(selectedDate, buildingId);
  const lessonsTimeSlots: { value: string; name: string }[] = allLessons.map(
    (lesson: { time_slot_start: string }) => {
      return { value: lesson.time_slot_start, name: lesson.time_slot_start };
    },
  );

  const timeSlotChoices: { value: string; name: string }[] =
    lessonsTimeSlots.filter(
      (slot, index, self) =>
        index === self.findIndex((l) => l.value === slot.value),
    );

  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "Select time of the lesson start",
        choices: timeSlotChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showPEMenu();
          break;
        default:
          await clearConsolePE();
          await showLessonsTypesMenu(choice.action, allLessons);
          break;
      }
    });
};

const showLessonsTypesMenu = async (timeSlot: string, allLessons: any) => {
  const preparedTimeSlotLessons = prepareTimeSlotLessons(allLessons, timeSlot);
  const lessonTypeOptions: { value: string; name: string }[] =
    preparedTimeSlotLessons.map((lesson: { section_name: string }) => {
      return { value: lesson.section_name, name: lesson.section_name };
    });

  const uniqueTypeOptions = lessonTypeOptions.filter(
    (choice, index, self) =>
      index === self.findIndex((t) => t.value === choice.value),
  );

  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "Select type of the lesson",
        choices: uniqueTypeOptions,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showPEMenu();
          break;
        default:
          await clearConsolePE();
          await showLessonTeachersMenu(preparedTimeSlotLessons, choice.action);
          break;
      }
    });
};

const showLessonTeachersMenu = async (timeSlotLessons: any, type: string) => {
  const preparedLessons = findLessonsByType(timeSlotLessons, type);
  const teacherChoices = preparedLessons.map(
    (lesson: { teacher_fio: string }) => {
      return { value: lesson.teacher_fio, name: lesson.teacher_fio };
    },
  );

  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "Select teacher of the lesson",
        choices: teacherChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showPEMenu();
          break;
        default:
          await setTargetLesson(preparedLessons, choice.action);
          await clearConsolePE();
          await showPEMenu();
          break;
      }
    });
};

const showActiveTargetsMenu = async () => {
  const activeTargets = await getActiveLessonTasks();
  const activeTargetsChoices = activeTargets.map(
    (target: { task_id: string; id: number }) => {
      return { name: target.task_id, section_name: target.id };
    },
  );

  if (activeTargets.length > 0) {
    activeTargetsChoices.push({ value: "stop", name: "Stop single target" });
  }

  activeTargetsChoices.push(
    { value: "update", name: "↻ Update " },
    { value: "back", name: "> Back" },
  );
  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "Active targets menu",
        choices: activeTargetsChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showPEMenu();
          break;
        case "update":
          await clearConsolePE();
          await showActiveTargetsMenu();
          break;
        default:
          await clearConsolePE();
          await showStopTargetMenu(activeTargets);
          break;
      }
    });
};

const showStopTargetMenu = async (activeTargets: any) => {
  const activeTargetsChoices = activeTargets.map(
    (target: { task_id: string; id: number }) => {
      return { name: target.task_id, value: target.id };
    },
  );

  activeTargetsChoices.push({ value: "back", name: "> Back" });
  inquirer
    .prompt([
      {
        type: "select",
        name: "action",
        message: "Select target to stop",
        choices: activeTargetsChoices,
      },
    ])
    .then(async (choice) => {
      switch (choice.action) {
        case "back":
          await clearConsolePE();
          await showActiveTargetsMenu();
          break;
        default:
          await clearConsolePE();
          await stopLessonTask(choice.action);
          setTimeout(async () => {
            await clearConsolePE();
            await showActiveTargetsMenu();
          }, 2000);
          break;
      }
    });
};
