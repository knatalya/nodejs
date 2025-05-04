const fs = require('fs');
const path = require('path');

// Чтения лог-файла
function readLogFile(filename) {
    const logFilePath = path.resolve(__dirname, filename);
    const data = fs.readFileSync(logFilePath, 'utf8');
    return data.split('\n').filter(line => line.trim() !== '');
}

// Анализа логов
function analyzeLogs(filename) {
    const logs = readLogFile(filename);

    const totalGames = logs.length;
    const wins = logs.filter(log => log.includes('Вы выиграли')).length;
    const losses = totalGames - wins;
    const winPercentage = (wins / totalGames) * 100;

    console.log(`Общее количество партий: ${totalGames}`);
    console.log(`Количество выигранных партий: ${wins}`);
    console.log(`Количество проигранных партий: ${losses}`);
    console.log(`Процент выигранных партий: ${winPercentage.toFixed(2)}%`);
}

const filename = process.argv[2];

if (!filename) {
    console.log("Ошибка: не указан файл с логами.");
    process.exit(1);
}

analyzeLogs(filename);
