<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=30&duration=3000&pause=1000&color=7F77DD&center=true&vCenter=true&width=700&lines=Question+Bank+Management+System;DSA-Driven+%7C+Java+%7C+File+Storage" alt="Typing SVG" />

<br/>

<!-- Logo SVG inline badge -->
<svg viewBox="0 0 72 72" width="90" height="90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7f77dd"/>
      <stop offset="100%" stop-color="#1d9e75"/>
    </linearGradient>
  </defs>
  <path d="M8 20C8 20 8 54 8 56C8 58 10 58 12 58L36 54L36 20C36 20 24 16 12 18C10 18 8 18 8 20Z" fill="url(#g1)" opacity="0.9"/>
  <path d="M64 20C64 20 64 54 64 56C64 58 62 58 60 58L36 54L36 20C36 20 48 16 60 18C62 18 64 18 64 20Z" fill="url(#g1)" opacity="0.6"/>
  <circle cx="52" cy="46" r="8.5" stroke="white" stroke-width="2" fill="rgba(11,16,32,0.7)"/>
  <circle cx="52" cy="46" r="5" fill="none" stroke="#1d9e75" stroke-width="2"/>
  <line x1="58.5" y1="52.5" x2="63" y2="57" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
</svg>

# 📚 Question Bank Management System
### *A DSA-Driven Java Console Application with HTML5 Frontend*

<br/>

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-Ready-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![DSA](https://img.shields.io/badge/DSA-6_Algorithms-7F77DD?style=for-the-badge)
![License](https://img.shields.io/badge/License-Academic-green?style=for-the-badge)

<br/>

> **DSA-3 (25CS2103E) Course Project** — A fully functional question bank system that demonstrates 6 string-matching DSA algorithms, 0/1 Knapsack DP paper generation, file-based persistence, and role-based access control — all without a database or external frameworks.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [DSA Algorithms Implemented](#-dsa-algorithms-implemented)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Login Credentials](#-login-credentials)
- [Menu Guide](#-menu-guide)
- [Frontend (HTML5 UI)](#-frontend-html5-ui)
- [Data File Formats](#-data-file-formats)
- [Team](#-team)

---

## 🌟 Overview

The **Question Bank Management System (QBMS)** is a two-part project:

| Part | Technology | Purpose |
|------|-----------|---------|
| **Java Console App** | Pure Java 17 · No frameworks | Backend — CRUD, search, paper generation, auth |
| **HTML5 Frontend** | HTML · CSS · Vanilla JS | Browser UI — glassmorphism design, all features |

**Key design principles:**
- ✅ **No database** — flat-file storage (`data/*.txt`) with `|`-delimited records
- ✅ **No external libraries** — custom `CustomArrayList<T>` replaces `java.util.ArrayList`
- ✅ **No Spring/Maven/Gradle** — compile with a single `javac` command
- ✅ **No server needed** — HTML frontend runs by double-clicking `index.html`

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🔐 **Role-Based Auth** | Admin and Faculty roles; file-based login against `users.txt` |
| ➕ **Add Question** | Auto-generates sequential IDs (Q001, Q002…); persisted immediately |
| 👁 **View All Questions** | Paginated list with subject, unit, difficulty, CO, marks |
| ✏️ **Update Question** | In-place edit with field-by-field prompting |
| 🗑 **Delete Question** | Confirmed delete; file rewritten atomically |
| 🔍 **Search** | 6 interchangeable DSA algorithms (see below) |
| ⚡ **Generate Paper** | 0/1 Knapsack DP — selects optimal question set by marks budget |
| 📊 **Usage History** | Tracks every question's appearance in papers; sorted by frequency |
| 👥 **User Management** | Admin-only: add Faculty/Admin accounts |

### Frontend-Only Extras
| Feature | Description |
|---------|-------------|
| 🏎 **Algorithm Benchmark** | Runs all 6 algorithms simultaneously; side-by-side timing comparison |
| ⬇ **Export Paper** | Downloads generated paper as a formatted `.txt` file |
| 🌙 **Dark/Light Theme** | One-click toggle with CSS variable system |
| 📈 **Live Stats Dashboard** | Real-time question count, subject count, papers generated, usage records |
| 🔎 **Filter Questions** | Filter by subject, difficulty, keyword simultaneously |

---

## 📁 Project Structure

```
QBMS-Frontend/
│
├── 📁 QBMS-Frontend/               ← Open in any browser (no server needed)
│   └── index.html                  ← Full glassmorphism UI (63 KB, self-contained)
│
└── 📁 QuestionBankManagementSystem/ ← Open in VS Code → Ctrl+Shift+B to build
    │
    ├── 📁 .vscode/
    │   ├── tasks.json              ← Ctrl+Shift+B → compile all Java files
    │   └── launch.json             ← F5 → run with Java debugger
    │
    ├── 📁 data/                    ← Auto-created on first run
    │   ├── questions.txt           ← 16 pre-seeded questions (pipe-delimited)
    │   ├── users.txt               ← admin + faculty1 accounts
    │   ├── usage_history.txt       ← appended on every paper generation
    │   └── generated_papers.txt    ← one line per generated paper
    │
    ├── 📁 out/                     ← Compiled .class files (pre-built)
    │
    └── 📁 src/
        ├── Main.java               ← Entry point; wires all layers
        │
        ├── 📁 algorithms/          ← ★ All DSA implementations
        │   ├── NaiveMatcher.java
        │   ├── KMPMatcher.java
        │   ├── ZMatcher.java
        │   ├── RabinKarpMatcher.java
        │   ├── AhoCorasick.java
        │   └── EditDistanceMatcher.java
        │
        ├── 📁 model/               ← Plain data objects (POJOs)
        │   ├── Question.java
        │   ├── User.java
        │   ├── Paper.java
        │   ├── SearchResult.java
        │   └── UsageRecord.java
        │
        ├── 📁 services/            ← Business logic layer
        │   ├── AuthService.java
        │   ├── QuestionManager.java
        │   ├── SearchEngine.java   ← Unified interface over all 6 algorithms
        │   ├── PaperGenerator.java ← 0/1 Knapsack DP + Merge Sort
        │   └── UsageTracker.java
        │
        ├── 📁 storage/             ← File I/O layer
        │   ├── QuestionFileHandler.java
        │   ├── UserFileHandler.java
        │   ├── PaperFileHandler.java
        │   └── UsageFileHandler.java
        │
        ├── 📁 structures/          ← Custom DSA data structure
        │   └── CustomArrayList.java ← Hand-built dynamic array; no java.util
        │
        └── 📁 ui/                  ← Console interaction layer
            ├── ConsoleUI.java      ← Menu loop; delegates to services
            ├── Menu.java           ← All menu text; no business logic
            └── InputValidator.java ← Input parsing; never crashes on bad input
```

---

## 🧠 DSA Algorithms Implemented

### 🔍 String Search Algorithms

All six algorithms are fully implemented from scratch in `src/algorithms/`. Each tracks its own **comparison counter** and **execution time** so the system can report performance statistics after every search.

---

#### 1. Naive (Brute Force) — `NaiveMatcher.java`

```
Complexity: O(n · m)   where n = text length, m = pattern length
```

**How it works:**  
For every starting position `i` in the text, try to match all `m` characters of the pattern. On mismatch, slide to `i+1` and restart. No preprocessing required.

```
Text:    a b c d a b c a b c d
Pattern:         a b c d
         slide →→→→→→→→ match!
```

**Use case:** Baseline for performance comparison. Simple to understand.

---

#### 2. KMP — Knuth-Morris-Pratt — `KMPMatcher.java`

```
Complexity: O(n + m)
Preprocessing: O(m)  (builds failure function)
```

**How it works:**  
Pre-build a **failure function** (partial match table) that tells us: *"when a mismatch occurs at position j in the pattern, how far back do we need to go?"* — instead of restarting from scratch, we jump to `fail[j-1]`, guaranteeing we never re-examine a character.

```
Pattern:  a b c a b d
fail[]:   0 0 0 1 2 0

On mismatch at j=5: jump to j=fail[4]=2 (not back to 0)
```

**Use case:** Best choice for single-keyword search in large text.

---

#### 3. Z-Function — `ZMatcher.java`

```
Complexity: O(n + m)
```

**How it works:**  
Concatenate `pattern + "$" + text` into a single string `S`. Compute the **Z-array**: `Z[i]` = length of the longest substring starting at `S[i]` that is also a prefix of `S`. A match occurs wherever `Z[i] == m`.

```
S = "abc$xabcyz"
Z = [ 0, 0, 0, 0, 0, 3, 0, 0, 0, 0 ]
                      ↑ match! (Z[5] == 3 == len("abc"))
```

**Use case:** Elegant alternative to KMP; same linear complexity.

---

#### 4. Rabin-Karp — Rolling Hash — `RabinKarpMatcher.java`

```
Average Complexity: O(n + m)
Worst Case: O(n · m)  (hash collisions)
Hash Base: 31    Modulus: 1,000,000,007
```

**How it works:**  
Hash the pattern. Slide a window of the same length across the text, **updating the hash in O(1)** by subtracting the leaving character and adding the entering one (rolling hash). On hash match, do a character-by-character verification to handle collisions.

```
Window hash = (hash × BASE + new_char - old_char × BASE^m) mod MOD
```

**Use case:** Excellent when searching for multiple patterns simultaneously (extend to multi-pattern easily).

---

#### 5. Aho-Corasick — Multi-Keyword Automaton — `AhoCorasick.java`

```
Build Time: O(Σ|patterns|)
Search Time: O(n + total_matches)
Space: O(26 × number_of_trie_nodes)
```

**How it works:**  
1. **Build a Trie** from all input keywords.
2. **Compute failure links** via BFS — like KMP's failure function but on a Trie. Each node gets a link to the longest proper suffix that is also a valid Trie prefix.
3. **Scan text once** — follow `goto` or `failure` transitions at each character; all matching patterns are found simultaneously.

```
Keywords: {"he", "she", "his", "hers"}
         Trie built → BFS failure links computed
         Text "ushers" → finds "she", "he", "hers" in one pass
```

**Use case:** Multi-keyword search. In QBMS, used when the user enters space-separated keywords — all are found in a single scan of each question.

---

#### 6. Fuzzy Search — Edit Distance (Levenshtein DP) — `EditDistanceMatcher.java`

```
Complexity: O(m · n)  where m, n are string lengths
Space: O(n)  (optimized single rolling row)
```

**How it works:**  
Classic **Levenshtein DP**:  
`dp[i][j]` = minimum number of insertions, deletions, or substitutions to transform `a[0..i-1]` into `b[0..j-1]`.

For typo-tolerant search, the query is compared against **each individual word** in the question text. A match is declared if the minimum edit distance across all words is ≤ threshold (default = 2).

```
Query: "schedulng"   Word: "scheduling"
Edit distance = 1   (one missing 'i')  →  MATCH ✓

Query: "stck"        Word: "stack"  
Edit distance = 1   (one missing 'a') →  MATCH ✓
```

**Use case:** Typo-tolerant and spelling-mistake-resilient search.

---

### 📄 Paper Generation — 0/1 Knapsack DP (`PaperGenerator.java`)

```
Algorithm: 0/1 Knapsack Dynamic Programming
Time: O(n · W)   where n = questions, W = target marks
Space: O(n · W)  for the choice table (backtracking)
```

**How it works:**

1. **Filter** questions by subject (if specified).
2. **Sort** by usage count ascending using **Merge Sort** `O(n log n)` — questions used less frequently get priority.
3. **Run 0/1 Knapsack DP** where:
   - Items = questions
   - Weight = marks per question
   - Capacity = target total marks
   - Objective = maximise number of questions fitting within the marks budget
4. **Backtrack** through the DP table to recover the exact selected set.
5. **Greedy fill-up** if DP couldn't fill the exact count due to constraint conflicts.
6. **Record usage** — every selected question gets a `UsageRecord` appended to `usage_history.txt`.

```
Target: 40 marks, 5 questions
Pool (sorted by usage): Q003(5), Q010(5), Q011(5), Q001(10), Q006(10), Q008(10)...

DP finds: Q003 + Q010 + Q011 + Q001 + Q006 = 35 marks (best feasible fit)
```

---

### 🗂 Custom Data Structure — `CustomArrayList<T>`

```
get / set:  O(1)
add:        O(1) amortized  (doubles capacity when full)
remove:     O(n)
contains:   O(n)
```

A hand-built **generic dynamic array** that replaces `java.util.ArrayList` throughout the entire codebase. Used in:
- All service layers (question list, user list, paper list)
- All search results (matched IDs, keyword hits)
- Aho-Corasick Trie node storage

---

## 🏛 Architecture

```
┌─────────────────────────────────────────────────┐
│                  USER INTERFACE                  │
│  ConsoleUI.java  ←→  Menu.java  ←→  InputValidator│
└────────────────────────┬────────────────────────┘
                         │ calls
┌────────────────────────▼────────────────────────┐
│                  SERVICE LAYER                   │
│  AuthService  │  QuestionManager  │  SearchEngine│
│  PaperGenerator              │  UsageTracker     │
└──────┬────────────────────────────────┬──────────┘
       │ uses                           │ uses
┌──────▼────────┐           ┌───────────▼──────────┐
│  ALGORITHMS   │           │   STORAGE LAYER       │
│  NaiveMatcher │           │  QuestionFileHandler  │
│  KMPMatcher   │           │  UserFileHandler      │
│  ZMatcher     │           │  PaperFileHandler     │
│  RabinKarp    │           │  UsageFileHandler     │
│  AhoCorasick  │           └───────────┬───────────┘
│  EditDistance │                       │ reads/writes
└──────┬────────┘           ┌───────────▼───────────┐
       │ uses               │     DATA FILES         │
┌──────▼────────┐           │  data/questions.txt    │
│  STRUCTURES   │           │  data/users.txt        │
│  CustomArray  │           │  data/usage_history.txt│
│  List<T>      │           │  data/generated_papers │
└───────────────┘           └────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Java JDK 17+** (download from [adoptium.net](https://adoptium.net))
- **VS Code** with [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)

### Option 1 — VS Code (Recommended)

```bash
# 1. Open the backend folder in VS Code
#    File → Open Folder → QuestionBankManagementSystem

# 2. Compile  (Ctrl+Shift+B → "QBMS: Compile")
#    Or in the terminal:
javac -d out -sourcepath src (Get-ChildItem -Recurse src -Filter "*.java" | % FullName)

# 3. Run
java -cp out Main
```

### Option 2 — Command Prompt / PowerShell

```powershell
cd QuestionBankManagementSystem

# Compile all Java files recursively
javac -d out -sourcepath src (Get-ChildItem -Recurse src -Filter "*.java" | ForEach-Object { $_.FullName })

# Run
java -cp out Main
```

### Option 3 — Bash / Linux / macOS

```bash
cd QuestionBankManagementSystem
javac -d out -sourcepath src $(find src -name "*.java")
java -cp out Main
```

### Browser Frontend
```
Double-click:  QBMS-Frontend/index.html
```
Works in Chrome, Firefox, Edge, Safari — no server, no install.

---

## 🔑 Login Credentials

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `admin123` | ADMIN | All features + user management |
| `faculty1` | `faculty123` | FACULTY | All features except user management |

> Accounts are stored in `data/users.txt`. New accounts can be added from Option 8 (Admin only).

---

## 📋 Menu Guide

```
╔══════════════════════════════════════════════════╗
║     QUESTION BANK MANAGEMENT SYSTEM  v3.0       ║
║     DSA-Driven Engine · File Storage · Java      ║
╚══════════════════════════════════════════════════╝

  Logged in as: admin (ADMIN)
  ─────────────────────────────────────────────
  1. Add Question
  2. View All Questions
  3. Update Question
  4. Delete Question
  ─────────────────────────────────────────────
  5. Search Questions         [KMP / Z / RK / AC / Fuzzy]
  6. Generate Question Paper  [0/1 Knapsack DP]
  7. View Usage History       [Sorted by count]
  ─────────────────────────────────────────────
  8. Add User Account         [Admin only]
  9. Logout
  0. Exit
```

### Search Sub-Menu
```
  1. Naive (Brute Force)       O(n·m)
  2. KMP (Knuth-Morris-Pratt)  O(n+m)
  3. Z-Function                O(n+m)
  4. Rabin-Karp (Rolling Hash) O(n+m) avg
  5. Aho-Corasick (Multi-KW)   O(n+Σ|patterns|)
  6. Fuzzy / Edit Distance     O(n·m) Levenshtein
```

Each search returns:
- Matching questions with full details
- Total character comparisons made
- Execution time in milliseconds
- Big-O complexity of the chosen algorithm

---

## 🌐 Frontend (HTML5 UI)

The `QBMS-Frontend/index.html` is a **single-file, self-contained web app** (~64 KB) with:

### Tabs
| Tab | Contents |
|-----|----------|
| 📋 **Questions** | Filterable table of all questions; Edit ✏️ and Delete 🗑 buttons |
| 🔍 **Search** | Algorithm chip selector → search → live stats (time, comparisons, matches) |
| ⚡ **Generate Paper** | Subject filter + count + marks → Knapsack DP → visual result with distribution charts |
| 📈 **Usage History** | Table sorted by usage count with inline bar charts |
| ➕ **Add Question** | Form with auto-ID assignment |
| 🏎 **Benchmark** | Single query → all 6 algorithms run simultaneously → timing comparison cards |
| 👥 **Users** | Admin-only: add new accounts; view current users |

### Design System
- **Glassmorphism** cards with `backdrop-filter: blur(24px)`
- **Animated gradient blobs** background
- **CSS custom properties** for instant dark/light theme switching
- **Micro-animations** on card entry (`rise` keyframe)
- **Responsive grid** — 4-column stats → 2-column on mobile

---

## 💾 Data File Formats

All files use `|` as delimiter. Any `|` inside field values is escaped as `\p`.

### `data/questions.txt`
```
ID|Subject|Unit|Difficulty|CO|Marks|QuestionText|Tags
Q001|Data Structures|Unit 3|Medium|CO3|10|Explain the working of a stack...|stack array
```

### `data/users.txt`
```
ID|Username|Password|Role
U001|admin|admin123|ADMIN
U002|faculty1|faculty123|FACULTY
```

### `data/generated_papers.txt`
```
PaperID|Date|Subject|TotalMarks|QuestionID1,QuestionID2,...
P001|2026-09-21|Data Structures|35|Q003,Q001,Q008,Q012
```

### `data/usage_history.txt`
```
QuestionID|PaperID|Date|User|UsageCount
Q001|P001|2026-09-21|admin|1
```

---

## 📊 Algorithm Complexity Summary

| Algorithm | Preprocessing | Search | Space | Best For |
|-----------|--------------|--------|-------|----------|
| **Naive** | O(1) | O(n·m) | O(1) | Short texts, baseline |
| **KMP** | O(m) | O(n) | O(m) | Single keyword, large text |
| **Z-Function** | O(n+m) | O(n+m) | O(n+m) | Pattern matching |
| **Rabin-Karp** | O(m) | O(n) avg | O(1) | Multiple patterns |
| **Aho-Corasick** | O(Σ\|p\|) | O(n) | O(26·nodes) | Multi-keyword |
| **Fuzzy / Edit Distance** | O(1) | O(n·m) | O(n) | Typo tolerance |
| **0/1 Knapsack** | — | O(n·W) | O(n·W) | Paper generation |
| **Merge Sort** | — | O(n log n) | O(n) | Sorting by usage |
| **CustomArrayList** | — | O(1) get, O(n) search | O(n) | All collections |

---

## 🧩 What Was Implemented (Phase-by-Phase)

### Phase 1 — Foundation
- Project skeleton: `model/`, `storage/`, `structures/`, `data/`
- All model POJOs: `Question`, `User`, `Paper`, `SearchResult`, `UsageRecord`
- File handlers with auto-create, malformed-line skipping, `|`-escaped records
- `CustomArrayList<T>` with O(1) get, amortized O(1) add, O(n) remove

### Phase 2 — Console UI & CRUD
- Login gate + file-based auth (`AuthService`)
- Numbered menu loop (`ConsoleUI`, `Menu`)
- Full CRUD via `QuestionManager`: Add, View All, Update, Delete
- `InputValidator` — never crashes on bad input; reprompts always

### Phase 3 — Complete DSA Engine *(Phase 3 delivered in full)*
- **6 search algorithms** in `src/algorithms/`
- `SearchEngine` service: unified interface, comparison counter, wall-clock timing
- `PaperGenerator`: 0/1 Knapsack DP + Merge Sort usage-aware prioritisation
- `UsageTracker`: per-question aggregated count, sorted leaderboard, raw log
- All previously stubbed menu options (5, 6, 7, 8) fully implemented
- Pre-seeded `data/questions.txt` (16 questions) and `data/users.txt`
- VS Code `tasks.json` + `launch.json` for one-click build/run
- **HTML5 frontend** with glassmorphism UI, SVG logo, benchmark tab, export

---

## 👨‍💻 Team

| Member | Role |
|--------|------|
| **AdvaithJawaji** | Lead Developer |

---

## 📄 License

This project is submitted as an academic project for **DSA-3 (25CS2103E)**. All source code is original.

---

<div align="center">

**Built with ❤️ using Java · No frameworks · No databases · Pure DSA**

*"The best way to learn an algorithm is to implement it yourself."*

</div>
