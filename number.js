#!/usr/bin/env node

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const min = 0;
const max = 100;
const random = Math.floor(Math.random() * (max - min + 1)) + min;

console.log(`Загадано число в диапазоне от ${min} до ${max}`);

rl.on("line", (input) => {
  const guess = Number(input.trim());

  if (isNaN(guess)) {
    console.log("Введите число!");
    return;
  }

  if (guess < random) {
    console.log("Больше");
  } else if (guess > random) {
    console.log("Меньше");
  } else {
    console.log(`Отгадано число ${random}`);
    rl.close();
  }
});