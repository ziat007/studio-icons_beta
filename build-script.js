const fs = require('fs');
const path = require('path');

// Read the template files
const templateStart = fs.readFileSync('src/template-start.js', 'utf8');
const templateEnd = fs.readFileSync('src/template-end.js', 'utf8');

// Read all JSON files from the lottie-json directory
const lottieDir = path.join(__dirname, 'lottie-json');
const files = fs.readdirSync(lottieDir);

// Create the iconTemplates object
const iconTemplates = {};
files.forEach(file => {
  if (path.extname(file) === '.json') {
    const fileName = path.basename(file, '.json');
    const fileContent = fs.readFileSync(path.join(lottieDir, file), 'utf8');
    iconTemplates[fileName] = JSON.parse(fileContent);
  }
});

// Generate the final content
const finalContent = `${templateStart}
var iconTemplates = ${JSON.stringify(iconTemplates, null, 2)};
${templateEnd}`;

// Write the final content to the output file
fs.writeFileSync('output/studio-icons_beta.js', finalContent);

console.log('studio-icons_beta.js has been generated successfully.');
