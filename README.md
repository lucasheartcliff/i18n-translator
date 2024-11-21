# i18n-translator

This project is a CLI tool designed to extract `i18n` text strings from JavaScript/TypeScript projects, translate them into multiple languages using Google Translate, and save the translations to JSON files.

## Features

- Scans `.js`, `.jsx`, `.ts`, and `.tsx` files in a project directory.
- Extracts text inside `i18n("...")` calls using regex.
- Translates extracted strings to multiple specified languages.
- Saves translations in organized JSON files for each language.

## Usage

Run the script using Node.js:

```bash
node index.js --projectPath <path-to-project> --outputDir <output-dir> --languages <lang-list>
```

### Command-Line Arguments

- `--projectPath` or `-p` (required): Path to the project directory to scan.
- `--outputDir` or `-o` (required): Directory to save the translation files.
- `--languages` or `-l` (required): Comma-separated list of target languages (e.g., `en,pt,es,jp`).

### Example

```bash
node index.js --projectPath ./src --outputDir ./translations --languages en,pt,es,jp
```

### Output

The script will create a directory structure like this:

```plaintext
translations/
  en.json
  pt.json
  es.json
  jp.json
```

Each file will contain key-value pairs of original strings and their translations, e.g.:

**`en.json`**
```json
{
  "Hello, world!": "Hello, world!",
  "Goodbye!": "Goodbye!"
}
```

## Requirements

- Internet access for Google Translate API.

## Dependencies

- [`yargs`](https://www.npmjs.com/package/yargs): For parsing command-line arguments.
- [`@vitalets/google-translate-api`](https://www.npmjs.com/package/@vitalets/google-translate-api): For translations.

## Troubleshooting

- Ensure the `projectPath` exists and contains `.js`, `.jsx`, `.ts`, or `.tsx` files with `i18n("...")` calls.
- Verify internet connectivity for Google Translate API.
- Use `--languages` to specify valid language codes (e.g., `en` for English, `pt` for Portuguese).

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for improvements.