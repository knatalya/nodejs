const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Генерации случайного числа: 1 (орёл) или 2 (решка)
function flipCoin() {
    return Math.floor(Math.random() * 2) + 1;
}

// Лог
function logResult(filename, result) {
    const logFilePath = path.resolve(__dirname, filename);
    
    const logMessage = `${new Date().toISOString()} - ${result}\n`;
    
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
}


function playGame(filename) {
    rl.question("Выберите (1 - Орёл, 2 - Решка): ", (userChoice) => {
        userChoice = parseInt(userChoice);
        const coinResult = flipCoin();
        const result = userChoice === coinResult ? "Вы выиграли!" : "Вы проиграли.";

        console.log(result);
        logResult(filename, result);

        rl.close(); 
    });
}


const filename = process.argv[2];

if (!filename) {
    console.log("Ошибка: не указан файл для логирования.");
    process.exit(1);
}

playGame(filename);
