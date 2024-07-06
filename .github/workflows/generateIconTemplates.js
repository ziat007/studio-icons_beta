// generateIconTemplates.js
const fs = require('fs');
const path = require('path');

const folderPath = './lottie-json'; // Change this to your folder path

const files = fs.readdirSync(folderPath);
const iconTemplates = {};

files.forEach(file => {
    const fileNameWithoutExt = path.parse(file).name;
    const fileContent = fs.readFileSync(path.join(folderPath, file), 'utf-8');
    iconTemplates[fileNameWithoutExt] = fileContent;
});

const output = `
