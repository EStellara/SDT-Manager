# Manual Testing Guide for Export/Import Functionality

## Prerequisites
- SDT Manager application is running at http://localhost:3000
- Browser with developer tools available

## Test Plan

### 1. Setup Test Data

#### Step 1.1: Create a Project
1. Open the application
2. Click "New Project" 
3. Enter name: "Export Test Project"
4. Press Enter or click Create

#### Step 1.2: Add Characters
1. In the Characters section, click the "+" button
2. Create Character 1:
   - Name: "Hero"
   - Display Name: "The Hero"
   - Color: Blue (#0000ff)
   - Role: Protagonist
3. Create Character 2:
   - Name: "Villain" 
   - Display Name: "The Villain"
   - Color: Red (#ff0000)
   - Role: Antagonist

#### Step 1.3: Create Dialog Trees
1. Click "New Tree" button
2. Create Tree 1: "Opening Dialogue"
3. Create Tree 2: "Battle Conversation"

#### Step 1.4: Add Dialog Nodes
1. Select "Opening Dialogue" tree
2. Add several nodes using the editor:
   - NPC node with Hero character
   - Player response nodes
   - NPC node with Villain character
   - Action nodes

### 2. Test Export Functionality

#### Test 2.1: Single File Export (JSON)
1. Click the Export/Import button (Package icon) in project header
2. Select "Export Project (Single File)"
3. Verify download of `export_test_project_project.json`
4. Open the file in a text editor
5. Verify it contains:
   - Project metadata (id, name, description)
   - All characters
   - All dialog trees with nodes
   - Project variables

**Expected Result**: Complete project data in a single JSON file

#### Test 2.2: Structured ZIP Export
1. Click Export/Import button
2. Select "Export Project (Structured)"
3. Verify download of `export_test_project_project.zip`
4. Extract the ZIP file
5. Verify folder structure:
   ```
   export_test_project_project/
   ├── project.json (metadata)
   ├── characters.json (all characters)
   ├── variables.json (project variables)
   └── trees/
       ├── opening_dialogue.json
       └── battle_conversation.json
   ```

**Expected Result**: Organized project structure with separate files

#### Test 2.3: Individual Tree Export
1. Select "Opening Dialogue" tree
2. Click Export/Import button
3. Select "Export Current Tree"
4. Verify download of `opening_dialogue_tree.json`
5. Open file and verify it contains:
   - Tree data (nodes, connections)
   - Related characters only (Hero, Villain if used)
   - Export metadata

**Expected Result**: Single tree with associated characters

### 3. Test Import Functionality

#### Test 3.1: Import Project from Single JSON
1. Create a new project or clear current project
2. Click Export/Import button
3. Select "Upload File" and choose the single JSON export
4. Click "Import Project"
5. Verify project is recreated with:
   - Same project name and description
   - All characters restored
   - All dialog trees restored

**Expected Result**: Complete project restoration

#### Test 3.2: Import Project from ZIP
1. Create a new project or clear current project
2. Click Export/Import button
3. Select "Upload File" and choose the ZIP export
4. Verify automatic ZIP detection and import
5. Verify project restoration with all components

**Expected Result**: Complete project restoration from structured export

#### Test 3.3: Import Individual Trees
1. Ensure you have a project loaded
2. Click Export/Import button
3. Select "Upload Multiple Tree Files"
4. Choose multiple individual tree JSON files
5. Verify trees are added to current project
6. Verify characters are merged (no duplicates)

**Expected Result**: Trees added to current project

#### Test 3.4: Import Tree via Text Area
1. Open a tree export JSON file in text editor
2. Copy the contents
3. Click Export/Import button
4. Paste JSON data in the text area
5. Click "Import Tree"
6. Verify tree is added to current project

**Expected Result**: Tree imported from pasted JSON

### 4. Error Handling Tests

#### Test 4.1: Invalid JSON
1. Try to import malformed JSON
2. Verify error message is displayed
3. Verify application doesn't crash

#### Test 4.2: Invalid File Format
1. Try to upload a non-JSON, non-ZIP file
2. Verify appropriate error handling

#### Test 4.3: Missing Required Fields
1. Create JSON with missing required fields
2. Try to import
3. Verify validation error messages

### 5. Edge Cases

#### Test 5.1: Empty Project Export
1. Create empty project (no trees, no characters)
2. Test all export formats
3. Verify exports work and can be reimported

#### Test 5.2: Large Project
1. Create project with many trees and characters
2. Test export/import performance
3. Verify data integrity

#### Test 5.3: Special Characters
1. Use Unicode characters in names
2. Test export/import with special characters
3. Verify character encoding is preserved

## Success Criteria

✅ All export formats generate valid files
✅ All import methods successfully restore data
✅ Character associations are maintained
✅ No data loss during export/import cycle
✅ Error handling provides clear feedback
✅ File naming conventions are followed
✅ ZIP structure is organized and logical

## Reporting Issues

Document any issues found with:
- Steps to reproduce
- Expected vs actual behavior
- Browser and version
- Error messages or console logs
- Screenshots if applicable

## Post-Testing

After successful testing:
1. Document any edge cases discovered
2. Update IMPORT_EXPORT.md if needed
3. Consider additional automated tests
4. Performance optimizations if needed
