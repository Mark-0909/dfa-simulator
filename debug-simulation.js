const edges = [
    { source: 'q0', target: 'q1', label: 'a' },
    { source: 'q0', target: 'q2', label: 'b' }
];

const startState = 'q0';
const acceptingStates = new Set(['q1', 'q2']);
const testString = 'aa';

function testDFA() {
    if (!startState) return '⚠️ Set a start state first.';
    let current = startState;
    const input = testString.trim();

    for (let char of input) {
        console.log(`Current: ${current}, Char: ${char}`);
        const edge = edges.find(e =>
            e.source === current && e.label.split(',').map(s => s.trim()).includes(char)
        );
        if (!edge) {
            return `❌ Rejected at ${current}: No transition for '${char}'`;
        }
        current = edge.target;
        console.log(`  -> Transitioned to ${current}`);
    }

    if (acceptingStates.has(current)) return `✅ Accepted! Ended in ${current}`;
    else return `❌ Rejected: Ended in non-final state ${current}`;
}

console.log(testDFA());
