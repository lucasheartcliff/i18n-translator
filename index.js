const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');


async function translateTexts(textsByFile = {}, languages = []) {
  const entries = Object.entries(textsByFile)
  const result = {}
  for (const e of entries) {
    for (const v of e.values()) {
      if (v in result) continue
      for (const l of languages) {

        const { text } = await translate(v, { to: l });
        if (!result[v]) result[v] = {}
        result[v][l] = text
      }
    }
  }
  return result
}
// Regex to match i18n calls like i18n("content")
const i18nRegex = /i18n\(["'`]([^"']+)["'`]\)/g;

// Function to recursively read all files in a directory
function getFilesInDirectory(dir, fileTypes) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let matchedFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Recurse into directories
      matchedFiles = matchedFiles.concat(getFilesInDirectory(fullPath, fileTypes));
    } else if (fileTypes.some(type => file.name.endsWith(type))) {
      matchedFiles.push(fullPath);
    }
  }

  return matchedFiles;
}



// Function to extract i18n text from a file
function extractI18nFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];
  let match;

  while ((match = i18nRegex.exec(content)) !== null) {
    matches.push(match[1]); // The content inside i18n("...")
  }

  return matches;
}

// Main function to extract i18n from all files in a project
function extractI18nFromProject(projectPath) {
  const fileTypes = ['.js', '.jsx', '.ts', '.tsx'];
  const files = getFilesInDirectory(projectPath, fileTypes);
  const i18nStrings = {};

  for (const file of files) {
    const matches = extractI18nFromFile(file);

    if (matches.length > 0) {
      i18nStrings[file] = matches;
    }
  }

  return i18nStrings;
}

// Output results
function outputResults(i18nStrings) {
  for (const [file, strings] of Object.entries(i18nStrings)) {
    console.log(`File: ${file}`);
    strings.forEach((str, index) => {
      console.log(`  ${index + 1}: ${str}`);
    });
  }
}

// Run the script

function main() {
  const projectPath = './src/'; // Change to your project directory
  const i18nStrings = extractI18nFromProject(projectPath);

  const languages = ["en", "pt", "jp", "es"]
  if (Object.keys(i18nStrings).length === 0) {
    console.log('No i18n strings found.');
  } else {
    console.log('Extracted i18n strings:');
    outputResults(i18nStrings);
    translateTexts(i18nStrings, languages).then(r => console.log(r)).catch(e => console.error(e))
  }
}

main()
