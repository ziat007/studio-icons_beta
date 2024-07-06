const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

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
const unminifiedContent = `${templateStart}
var iconTemplates = ${JSON.stringify(iconTemplates)};
${templateEnd}`;

// Minify the content
async function buildAndMinify() {
  try {
    const minifiedResult = await minify(unminifiedContent, {
      mangle: true,
      compress: {
        dead_code: true,
        drop_debugger: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        keep_fargs: false,
        hoist_vars: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        warnings: false
      }
    });

    // Write the minified content to the output file
    fs.writeFileSync('src/studio-icons_beta.min.js', minifiedResult.code);
    console.log('studio-icons_beta.min.js has been generated successfully.');

    // Optionally, you can also save the unminified version
    fs.writeFileSync('src/studio-icons_beta.js', unminifiedContent);
    console.log('studio-icons_beta.js (unminified) has been generated successfully.');
  } catch (error) {
    console.error('Minification failed:', error);
  }
}

buildAndMinify();
