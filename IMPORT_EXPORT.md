# Import/Export Documentation

## Overview

SDT-Manager now supports flexible project-level import and export functionality with individual JSON files for each dialog tree, allowing for better organization and collaboration.

## Export Options

### 1. Single File Export (Legacy)
- **Format**: Single JSON file containing entire project
- **Use Case**: Quick backups, simple sharing
- **File**: `projectname_project.json`

### 2. Structured Export (New)
- **Format**: ZIP file with organized structure
- **Use Case**: Professional workflows, version control, collaboration
- **Structure**:
  ```
  projectname_project.zip
  ├── project.json          # Project metadata
  ├── characters.json       # All character definitions
  ├── variables.json        # Project variables (if any)
  └── trees/
      ├── tree1_name.json   # Individual dialog tree files
      ├── tree2_name.json
      └── ...
  ```

### 3. Individual Tree Export
- **Format**: Single JSON file containing one dialog tree and its related characters
- **Use Case**: Sharing specific conversations, modular development
- **File**: `treename_tree.json`

## Import Options

### 1. Single File Import
- Supports both legacy project files and individual tree files
- Automatically detects file type and imports accordingly

### 2. ZIP File Import
- Imports complete structured projects
- Automatically resolves character dependencies
- Maintains project organization

### 3. Multiple File Import
- Upload multiple individual tree JSON files at once
- Automatically merges characters and avoids duplicates
- Perfect for importing from unzipped structured exports

## File Formats

### Project Metadata (`project.json`)
```json
{
  "id": "unique-project-id",
  "name": "Project Name",
  "description": "Project description",
  "version": "1.0",
  "exportedAt": "2025-05-31T...",
  "treeCount": 5,
  "characterCount": 3
}
```

### Individual Tree File (`trees/treename.json`)
```json
{
  "tree": {
    "id": "tree-id",
    "name": "Tree Name",
    "description": "Tree description",
    "nodes": [...],
    "connections": [...],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "relatedCharacters": [
    {
      "id": "char-id",
      "name": "Character Name",
      "displayName": "Display Name",
      "color": "#ff0000",
      ...
    }
  ],
  "exportedAt": "2025-05-31T...",
  "exportVersion": "1.0"
}
```

## Workflow Examples

### For Solo Development
1. Use **Structured Export** for regular backups
2. Keep project in version control as unzipped folder
3. Import using **ZIP File Import** when needed

### For Team Collaboration
1. Export individual trees using **Individual Tree Export**
2. Share specific conversations with team members
3. Use **Multiple File Import** to combine work
4. Use **Structured Export** for final project compilation

### For Asset Management
1. Maintain a library of reusable dialog trees
2. Export trees individually for the library
3. Import multiple trees when building new projects
4. Characters are automatically merged without duplicates

## Technical Notes

- All imports generate new UUIDs to prevent ID conflicts
- Character merging is based on character names
- Projects maintain backward compatibility with legacy formats
- ZIP files are created using JSZip library
- File names are sanitized to be filesystem-safe
