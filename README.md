# DFA Simulator

An interactive web-based simulator for Deterministic Finite Automata (DFA). This project allows users to visualize, create, and test finite automata with an intuitive graphical interface.

🔗 **Live Demo**: [https://dfa-simulator67.netlify.app/](https://dfa-simulator67.netlify.app/)

## Features

- **Visual DFA Editor**: Create and edit DFA diagrams with an interactive node-and-edge interface
- **State Management**: Add, remove, and configure states with support for final states
- **Transition Definition**: Create transitions between states with labeled inputs
- **Self-Loop Support**: Handle self-referencing transitions on individual states
- **Simulation Mode**: Test your DFA by providing input strings and stepping through execution
- **Context Menu**: Right-click menus for quick actions on nodes and edges
- **Responsive Design**: Clean, user-friendly interface built with React

## Tech Stack

- **Frontend Framework**: React 19.2.3
- **Graph Visualization**: @xyflow/react 12.10.0
- **Routing**: React Router DOM 6.30.2
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Testing**: React Testing Library 16.3.1

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dfa-simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

### Building for Production

Create an optimized production build:
```bash
npm run build
```

## Project Structure

```
dfa-simulator/
├── src/
│   ├── App.js              # Main app component with routing
│   ├── App.css             # Application styles
│   ├── Simulator.js        # Core DFA simulator component
│   ├── LandingPage.js      # Welcome/landing page
│   ├── CircularNode.js     # Custom node component for states
│   ├── SelfLoopEdge.js     # Custom edge component for self-loops
│   ├── AdjustableBezierEdge.js # Custom edge component for transitions
│   ├── ContextMenu.js      # Right-click context menu
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static files
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── package.json            # Project dependencies and scripts
└── README.md              # This file
```

## Usage

1. **Start on Landing Page**: The application opens with a welcome page introducing the DFA simulator
2. **Access Simulator**: Click to navigate to the simulator interface
3. **Create States**: Click in the canvas to add new states (nodes)
4. **Mark Final States**: Double-click a state to mark it as a final/accepting state
5. **Add Transitions**: Click and drag from one state to another to create transitions, or to itself for self-loops
6. **Label Transitions**: Input the symbol for each transition
7. **Test Your DFA**: Switch to simulation mode and provide input strings to verify your automaton

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (irreversible)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for improvements.

## License

This project is open source and available under the MIT License.

## Notes

- Self-loop transitions are rendered with special curvature to avoid overlapping with the state
- The simulator uses @xyflow/react for robust graph handling and visualization
- All transitions can be labeled with alphabet symbols
