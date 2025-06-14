# Open Existing Project Feature

## Overview

The SDT Manager now supports opening and importing existing dialog tree projects through a user-friendly file picker interface. This feature allows you to load previously exported projects and continue working on them seamlessly.

## Supported File Formats

### 1. JSON Project Files (.json)
- **Single Project Files**: Complete projects exported as a single JSON file
- **Individual Tree Files**: Exported dialog trees with associated characters
- **Legacy Format Support**: Backward compatible with older export formats

### 2. ZIP Project Files (.zip)
- **Structured Project Archives**: Organized project exports with separate files for:
  - Project metadata (`project.json`)
  - Character definitions (`characters.json`) 
  - Project variables (`variables.json`)
  - Individual dialog trees (`trees/*.json`)

## How to Use

### From the Home Page

1. **Click "Browse Files"** in the "Open Existing Project" card
2. **Select your project file** from the file picker dialog
3. **Wait for import** - the system will automatically detect the file type
4. **Review any errors** if the import fails, with helpful error messages
5. **Navigate to editor** - successful imports redirect you to the project editor

### Supported Operations

- **Automatic Format Detection**: No need to specify file type
- **Character Merging**: Duplicate characters are automatically handled
- **ID Conflict Resolution**: New UUIDs are generated to prevent conflicts
- **Validation**: Comprehensive validation ensures project integrity
- **Error Handling**: Clear error messages help resolve import issues

## Error Handling

The import system provides detailed error messages for common issues:

- **Invalid file format**: "Invalid project format - missing required fields"
- **Corrupted ZIP files**: "Invalid project zip: missing project.json"
- **Malformed JSON**: Parse errors with specific line information
- **Missing data**: Validation errors for incomplete projects

## Testing

A sample project file is provided at `sample-project.json` for testing the import functionality. This file contains:

- **3 Characters**: Hero, Merchant, and Guard with full profiles
- **2 Dialog Trees**: Opening conversation and merchant dialog
- **Project Variables**: Game state variables like gold and reputation
- **Complex Branching**: Multiple choice options and character interactions

## Technical Details

The import system uses:

- **JSZip**: For handling ZIP file extraction and processing
- **React Context**: Integration with the existing project management system
- **UUID Generation**: Ensuring unique identifiers for all imported entities
- **TypeScript Validation**: Strong typing ensures data integrity

## File Picker Implementation

The file picker is implemented using native browser APIs:

```typescript
// Opens a file picker dialog
const file = await openFilePicker(".json,.zip");

// Automatically detects and imports the project
const project = await importProject(file);

// Loads into the application context
dispatch({ type: "LOAD_PROJECT", payload: project });
```

## Future Enhancements

Planned improvements include:

- **Recent Projects Persistence**: Save and load recently opened projects
- **Drag & Drop Support**: Drag files directly onto the interface
- **Batch Import**: Import multiple tree files simultaneously
- **Import Preview**: Preview project contents before importing
- **Cloud Storage Integration**: Support for cloud-based project storage
