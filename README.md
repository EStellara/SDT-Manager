# SDT Manager

Stellar Dialog Tree Manager is a mini project designed to explore and compare different LLM agentic code offerings available through Github Copilot.

## What is a Dialog Manager?

Nearly all games with dialog utilize an external manager to create and update character dialog independent of game files. Writes and artists are not familiar with code to have a completely in-code solution, as a result, a visual tree manager provides a user friendly option. These conversations or trees - given the many branching paths players can take - are then compiled down to an importable file. During gameplay, the file is parsed into code objects ensuring users get an ideal experience while maintaining a necessary decoupling of systems. 

> **Why this use case?**
> This use case is simple enough for a small web app project, while niche enough to have a limited set of example to reference. This makes it an ideal option for testing the creativity and process approach of each LLM.

## Project Specifics

Each LLM would need to attempt to build an application with a set of features. Once core features for a proof-of-concept are built, I'd decide to keep working and build a full prototype or discard the project. Each feature would be granularly introduced the same way I'd scope and introduce it to set of developers. I outlined initial tech stack details - ReactTS, Vite, ShadCN/MaterialUI - but additional libraries would need to be selected by the LLM. A successful project would be completed such that a game developer could test and provide feedback. This feedback would be used to evaluate what an MVP might look like for a product.

### LLMs Evaluated

All LLMs were used in "Agent" mode from Github Copilot within VS Code.
- **GPT-4.1**
- **Claude 4 Sonnet**

## Tests

### Core Features

- **Scenes** - Dialog would be saved on the scene level such that a single scene contains a set of trees.
- **Characters** - The NPC speaking on each piece of dialog.
- **Tree Nodes** - Each node is a different item in dialog tree
  - **Dialog Node** - A character saying something
  - **Player Choice** - A player picks between several options directing the flow of conversation
- **Visual Tree** - The tree needed to be visualized so users could see it.

### Additional Features

- **Tree Nodes** - Each node is a different item in dialog tree
  - **Action** - An action that occurs in the world as a result
  - **Conditional Branch** - Variables and values that limit or allow access to certain dialog options
  - **End** - Ends a conversation with no further paths forward
- **Project Organization** - Allow for multiple different scenes to be managed within one project
- **Import & Export** - Scenes and Projects can be imported and exported to allow for saving
- **Tests** - Build a test suite with different unit tests to automate testing functionality as new content is introduced

### GPT

GPT started off strong and was easily able to build out a page for scenes, characters, and the tree. Originally, content was not displayed but it was enough using some simple MUI form components to establish a base. It quickly found a visual tree library and incorporated it. However, it broke down during an attempt to impose order on the components. I aimed to have a clear clean page header for navigating between the different creation areas, but GPT only built it on a per page basis. It was unable to move it to another page without creating several errors. Following this, it was unable to resolve the errors and required manual intervention. Even with that information it continued to stumble into deprecated packages.

### Claude

Claude ran heavily from the get-go and required a more granular approach to tasks. Although it does an excellent job of breaking out all of the steps needed, it did not encourage testing the build as often as it needed to. This was easily resolved by scoping each ask slightly smaller, so several natural breakpoints appeared. Unfortunately, it continually seemed to struggle with committing or pushing code. It would often mark code as successfully committed and pushed, but manual confirmation proved otherwise. For the remaining work, all version control had to be manually managed. Claude continued to write and make pull request messages available summarizing its work - speeding up the process.

After the initial core features, I quickly asked it to write test cases. Although it had easily handled deprecated packages and replaced them, the tests proved the core challenge. After an hour of sorting through issues, it concluded that one of the tests was cached incorrectly. This resolved the issue much faster than I would have and its pivots on the approach were impressive as it iterated through potential solutions. It also flew through the usage of tailwind, which I'm less familiar with, as it built components. 

### Challenge Winner

For this challenge, the winner is Claude. GPT continues to provide excellent chat support & agentic scripting for light uses cases - and is a cheaper model with the current [billing system](https://docs.github.com/en/copilot/concepts/copilot-billing/understanding-and-managing-requests-in-copilot). Overall, I prefer Claude for agentic writing. The navigational difference that Claude offered as it backtracked and worked through other possible solutions was impressive. It was able to deliver all the features over a few hours of work. I'll continue to use both offerings in both my personal and professional life as they are major accelerators.

## Tech Stack

### Core Framework
- **React 19** - Modern UI library with the latest features
- **TypeScript** - Type-safe JavaScript with strong typing
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing and navigation

### UI & Styling   
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible component library
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful & consistent icon library
- **Class Variance Authority** - Component variant management
- **Tailwind Merge** - Utility for merging Tailwind classes
- **Tailwind CSS Animate** - Animation utilities

### State Management & Data Flow
- **React Context** - Built-in state management for dialog projects
- **React Flow (XYFlow)** - Interactive node-based diagrams for dialog trees

### File Processing & Utilities
- **JSZip** - ZIP file creation and extraction
- **UUID** - Unique identifier generation

### Development & Testing
- **Vitest** - Fast unit test framework
- **Testing Library** - React component testing utilities
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **JSDOM** - DOM implementation for testing


