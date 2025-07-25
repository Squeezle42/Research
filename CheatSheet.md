# GitHub Copilot Agent Hash Commands Cheat Sheet

## Basic Chat Commands
- `#help` - Show available commands and help information
- `#clear` - Clear the current chat conversation
- `#reset` - Reset the chat session

## File Operations
- `#file` - Reference a specific file in your workspace
- `#selection` - Reference your current code selection
- `#editor` - Reference the currently active editor
- `#workspace` - Reference the entire workspace

## Code Analysis
- `#explain` - Explain selected code or file
- `#review` - Review code for improvements and issues
- `#optimize` - Suggest optimizations for code
- `#refactor` - Suggest refactoring improvements
- `#debug` - Help debug issues in code

## Code Generation
- `#generate` - Generate code based on description
- `#implement` - Implement a feature or function
- `#complete` - Complete partial code
- `#fix` - Fix identified issues in code

## Testing
- `#test` - Generate tests for code
- `#unittest` - Generate unit tests specifically
- `#testcase` - Create test cases
- `#mock` - Generate mock objects for testing

## Documentation
- `#doc` - Generate documentation
- `#comment` - Add comments to code
- `#readme` - Generate README files
- `#docstring` - Generate docstrings for functions

## Git and Version Control
- `#commit` - Help with commit messages
- `#diff` - Analyze git diffs
- `#merge` - Help with merge conflicts
- `#branch` - Git branch operations

## Project Management
- `#todo` - Generate TODO lists
- `#plan` - Create project plans
- `#architecture` - Design system architecture
- `#structure` - Suggest project structure

## Language Specific
- `#python` - Python-specific assistance
- `#javascript` - JavaScript-specific assistance
- `#typescript` - TypeScript-specific assistance
- `#react` - React-specific assistance
- `#node` - Node.js-specific assistance
- `#sql` - SQL-specific assistance

## AI Model Specific (Claude Sonnet 4)
- `#claude` - Specifically request Claude's analysis
- `#reasoning` - Ask for detailed reasoning
- `#analysis` - Deep analysis of code or concepts
- `#compare` - Compare different approaches
- `#best-practices` - Get best practice recommendations

## Workspace Navigation
- `#find` - Find files or code in workspace
- `#search` - Search across the workspace
- `#navigate` - Navigate to specific locations
- `#tree` - Show file tree structure

## Terminal and Commands
- `#terminal` - Execute terminal commands
- `#run` - Run code or scripts
- `#install` - Install packages or dependencies
- `#build` - Build project

## Learning and Education
- `#learn` - Learn about concepts
- `#tutorial` - Create tutorials
- `#example` - Show examples
- `#pattern` - Explain design patterns

## Productivity
- `#shortcut` - VS Code shortcuts
- `#snippet` - Code snippets
- `#template` - Generate templates
- `#boilerplate` - Generate boilerplate code

## Advanced Features
- `#context` - Manage conversation context
- `#memory` - Reference previous conversations
- `#follow-up` - Continue previous discussions
- `#chain` - Chain multiple operations

## Usage Examples
```
#file src/main.py #explain
#selection #refactor
#workspace #find "database connection"
#generate a REST API for user management
#test #file utils.py
#doc #selection
#claude #analysis of this algorithm's complexity
```

## Tips for Using with Claude Sonnet 4
1. Be specific with your requests
2. Use multiple hash commands together for complex tasks
3. Reference specific files or selections for better context
4. Ask for reasoning and analysis for deeper insights
5. Use #claude for model-specific capabilities

## Notes
- Hash commands can be combined for more specific requests
- Some commands may vary based on your VS Code extensions
- Context is important - reference files and selections when relevant
- Claude Sonnet 4 excels at complex reasoning and analysis tasks
