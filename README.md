# 🌀 Silly Sort

**Silly Sort** is a chaotic split-screen coding game where logic meets nonsense.

You are given a randomly generated *absurd sorting rule* (e.g. “Communist Sort”, “Stalin Sort”, “Gaslight Sort”) and must implement it in Python. Your solution runs safely in the browser using **Pyodide**, and the system validates whether your output matches the bizarre rule.

---

## 🎮 How the Game Works

Each round:

1. You are given a **random “silly sorting algorithm”**
2. A list of 10 random numbers is generated
3. You write Python code to transform the list
4. Press **Run Code** to test your solution
5. Press **Submit** to check if you followed the rule
6. Watch your algorithm come to life in a live bar chart animation

---

## 🧠 Example Challenges

### 🟥 Stalin Sort
Remove anything that dares to break ascending order.

### 🟦 Communist Sort
Turn every number into the average of the array.

### 🟨 Gaslight Sort
The array is already sorted. Trust it. Don’t question it.

### 🟩 Ego Sort
The largest number demands attention — it must be moved to the front.

---

## 🖥️ Tech Stack

- ⚛️ React (frontend UI)
- 🎨 Tailwind CSS (styling)
- 🐍 Pyodide (Python in the browser)
- 🧩 Monaco Editor (code editor)
- 📊 Custom bar chart visualisation system
- ⚡ Vite (build tool)

---

## 🚀 Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/your-username/silly-sort.git
cd silly-sort

cd frontend
npm install

npm run dev
```

Then open:

http://localhost:5173

## 🧩 Adding New “Silly Sorts”

All challenges are defined in:

frontend/src/utils/sillySorts.ts

### Each sort is defined as:

export type SillySort = {
  name: string
  description: string
  validator: (input: number[], output: number[]) => boolean
}
Example:
{
  name: "Communist Sort",
  description: "Every number becomes the average of the array.",
  validator: (input, output) => {
    const avg = input.reduce((a, b) => a + b, 0) / input.length
    return output.every(v => v === avg)
  }
}
## 🧪 Validator System

Each challenge is validated using pure logic functions:

input → original array
output → user’s transformed array

### Helpers included:

isSortedAsc() → checks ordering
multisetEqual() → checks same elements
average() → calculates mean
mode() → finds most common value
🎯 Core Features
🎲 Random procedural challenge generation
🧠 Creative “fake sorting algorithm” system
🐍 In-browser Python execution (Pyodide sandbox)
📊 Animated bar chart visualisation
⏱️ Timed rounds + scoring system
🔥 Streak multiplier system
🌙 Dark mode support
🧩 Extensible challenge framework
💡 Design Philosophy

## This project is intentionally designed to:

Encourage creative problem solving
Break traditional expectations of “sorting algorithms”
Turn coding into a game-like experience
Reward interpretation, not just correctness
🔧 Project Structure
frontend/
 ├── src/
 │   ├── components/     # UI components (BarChart, Editor, etc.)
 │   ├── pages/          # Game page logic
 │   ├── utils/          # Sorting logic + Pyodide runner
 │   └── styles/         # Global styles
🧠 Future Ideas
Boss levels (“Bureaucracy Sort”, “Quantum Sort”)
Multiplayer challenge mode
Shareable daily puzzles
Custom rule creator
Replay system for solutions
Community submitted “silly sorts”
📜 License

MIT — feel free to remix, extend, and create your own absurd sorting universe.

🌀 Enjoy the chaos

Remember:

If it compiles, it probably works.
If it works, it’s probably wrong.
If it’s wrong, it’s probably a Silly Sort.


