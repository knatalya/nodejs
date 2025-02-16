#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .command("current", "Вывести текущую дату и время", (yargs) => {
    return yargs
      .option("year", {
        alias: "y",
        describe: "Вывести текущий год",
        type: "boolean",
      })
      .option("month", {
        alias: "m",
        describe: "Вывести текущий месяц",
        type: "boolean",
      })
      .option("date", {
        alias: "d",
        describe: "Вывести текущую дату в месяце",
        type: "boolean",
      });
  })
  .command("add", "Добавить дни, месяцы или годы к текущей дате", (yargs) => {
    return yargs
      .option("day", {
        alias: "d",
        describe: "Добавить дни",
        type: "number",
      })
      .option("month", {
        alias: "m",
        describe: "Добавить месяцы",
        type: "number",
      })
      .option("year", {
        alias: "y",
        describe: "Добавить годы",
        type: "number",
      });
  })
  .command("sub", "Вычесть дни, месяцы или годы из текущей даты", (yargs) => {
    return yargs
      .option("day", {
        alias: "d",
        describe: "Вычесть дни",
        type: "number",
      })
      .option("month", {
        alias: "m",
        describe: "Вычесть месяцы",
        type: "number",
      })
      .option("year", {
        alias: "y",
        describe: "Вычесть годы",
        type: "number",
      });
  })
  .help()
  .alias("help", "h").argv;

const now = new Date();

if (argv._.includes("current")) {
  if (argv.year) {
    console.log(`Текущий год: ${now.getFullYear()}`);
  } else if (argv.month) {
    console.log(`Текущий месяц: ${now.getMonth() + 1}`);
  } else if (argv.date) {
    console.log(`Текущая дата: ${now.getDate()}`);
  } else {
    console.log(`Текущая дата и время (ISO): ${now.toISOString()}`);
  }
}

if (argv._.includes("add")) {
  if (argv.d) now.setDate(now.getDate() + argv.d);
  if (argv.m) now.setMonth(now.getMonth() + argv.m);
  if (argv.y) now.setFullYear(now.getFullYear() + argv.y);
  console.log(`Дата после добавления: ${now.toISOString()}`);
}

if (argv._.includes("sub")) {
  if (argv.d) now.setDate(now.getDate() - argv.d);
  if (argv.m) now.setMonth(now.getMonth() - argv.m);
  if (argv.y) now.setFullYear(now.getFullYear() - argv.y);
  console.log(`Дата после вычитания: ${now.toISOString()}`);
}