#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');
const yargs = require('yargs');

// Write translations to files
function writeTranslatedFiles(translations, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [originalText, translationsByLang] of Object.entries(translations)) {
    for (const [language, translatedText] of Object.entries(translationsByLang)) {
      const outputFilePath = path.join(outputDir, `${language}.json`);

      let fileContent = {};
      if (fs.existsSync(outputFilePath)) {
        fileContent = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
      }

      fileContent[originalText] = translatedText;

      fs.writeFileSync(outputFilePath, JSON.stringify(fileContent, null, 2), 'utf8');
    }
  }

  console.log(`Translations written to ${outputDir}`);
}

// Async translation logic
async function translateTexts(textsByFile = {}, languages = []) {
  const entries = Object.entries(textsByFile);
  const result = {};

  for (const [file, texts] of entries) {
    for (const text of texts) {
      if (result[text]) continue;

      for (const lang of languages) {
        const { text: translatedText } = await translate(text, { to: lang });
        if (!result[text]) result[text] = {};
        result[text][lang] = translatedText;
      }
    }
  }

  return result;
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

async function main() {
  const argv = yargs
    .option('projectPath', {
      alias: 'p',
      describe: 'Path to the project directory to scan',
      type: 'string',
      demandOption: true,
    })
    .option('outputDir', {
      alias: 'o',
      describe: 'Directory to save the translated files',
      type: 'string',
      demandOption: true,
    })
    .option('languages', {
      alias: 'l',
      describe: 'List of languages to translate to (comma-separated)',
      type: 'string',
      demandOption: true,
    })
    .help()
    .argv;

  const projectPath = argv.projectPath;
  const outputDir = argv.outputDir;
  const languages = argv.languages.split(',');

  console.log(`Scanning project: ${projectPath}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Languages: ${languages.join(', ')}`);

  const i18nStrings = extractI18nFromProject(projectPath);

  if (Object.keys(i18nStrings).length === 0) {
    console.log('No i18n strings found.');
    return;
  }

  console.log('Extracted i18n strings:', i18nStrings);

  try {
    const translations = await translateTexts(i18nStrings, languages);
    writeTranslatedFiles(translations, outputDir);
  } catch (error) {
    console.error('Error during translation:', error);
  }
}

main();
