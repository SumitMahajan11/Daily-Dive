# Known Issues

Agent-selected smoke test, not an accuracy measure

Companion notes and observed extraction anomalies from `reports/smoke_run_1.txt` (smoke test run on 8 primary openly licensed lecture documents in `D:\DailyDive-SmokeTest`).

These are recorded strictly as observed factual behaviors on novel, unseen public course materials without altering extractor rules or thresholds.

## Observed Extraction Anomalies by Document

### 1. `mit14_01scf11_lec01.pdf` (Economics: Principles of Microeconomics)
- **Conversational sentence fragments extracted as titles from lecture transcript**:
  - Example title: `"Because economists think that these all come"`
  - Example title: `"We're Going to Develop the Consumer"`
  - Example title: `"Poor Who Would Get the Kidney If It Went"`
  - Example title: `"That's Right. There Could, but Let's Leave"`
- **Title starting with lowercase letter**:
  - Example title: `"come to taste later. OK?"`

### 2. `mit18_05_s22_lec01.pdf` (Statistics: Introduction to Probability and Statistics)
- **Math font symbol encoding artifacts causing provenance violations (5 violations)**:
  - Example title: `"Permutations of ≡¥æÿ from a set of ≡¥æ¢"`
  - Example title: `"Combinations of ≡¥æÿ from a set of ≡¥æ¢"`
- **Course administration & low-salience slide titles**:
  - Example title: `"Welcome"`
  - Example title: `"Websites"`
  - Example title: `"For Next Time"`
  - Example title: `"Lining things up. How many ways can you do"`

### 3. `mit18_05_s22_class01-prep-a.pdf` (Statistics: Reading Prep)
- **Author/Institution headers captured as section titles**:
  - Example title: `"Jeremy Orloff and Jonathan Bloom"`
  - Example title: `"MIT OpenCourseWare"`

### 4. `mit6_006s20_lec1.pdf` (Algorithms: Introduction to Algorithms)
- **Code implementation line extracted as heading**:
  - Example title: `"1 Def Birthday_match(students)"`
- **Institution header extracted as title**:
  - Example title: `"Massachusetts Institute of Technology"`

### 5. `mit7_91js14_lecture1.pdf` (Biology: Computational and Systems Biology, Lecture 1)
- **Overlength raw DNA sequence strings (>80 characters) extracted as titles (2 occurrences)**:
  - Example title: `"Atgccgatcgtacgacacatatcgtcatcgtactgactgtctagtctaaacacatccatcgtactgactgcatcgatccatt"` (85 chars)
  - Example title: `"Atgccgatcgtacgacacatatcgtcatcgtactgactgtctagtctaaacacatccatcgtactgactgcatcgatccat"` (82 chars)
- **Slide disclaimer text extracted as title**:
  - Example title: `"Photograph of Eric Davidson removed due to copyright restrictions"`
- **Provenance violations on font-encoded characters (4 violations)**:
  - Example title: `"Idea ΓÇô Use DNA Sequencing to Measure Diverse"`

### 6. `mit7_91js14_lecture2.pdf` (Biology: Computational and Systems Biology, Lecture 2)
- **Fallback untitled slide title emitted**:
  - Example title: `"Untitled slide 15"`
- **Logistics header extracted as title**:
  - Example title: `"For Those Reg’d for Grad Versions of Course"`
- **Provenance violation (1 violation)**:
  - Example title: `"‘Next Generation’ Sequencing Technologies"`

### 7. `mit8_04s16_lecnotes1.pdf` (Physics: Quantum Physics I)
- **Generic figure captions and author names extracted as titles**:
  - Example title: `"Figure"`
  - Example title: `"B. Zwiebach"`
- **Equation fragments and inline math lines extracted as titles**:
  - Example title: `"ˆ where the Hamiltonian (or energy operator)"`
  - Example title: `". Verify that (1.7) satisfies the conditions"`
  - Example title: `"Equation (3.6) is another example"`

### 8. `mit9_00scf11_lec01.pdf` (Psychology: Introduction to Psychology)
- **High frequency of fallback "Untitled slide" titles (8 occurrences)**:
  - Example titles: `"Untitled slide 18"`, `"Untitled slide 21"`, `"Untitled slide 27"`, `"Untitled slide 46"`, `"Untitled slide 47"`, `"Untitled slide 50"`, `"Untitled slide 52"`, `"Untitled slide 53"`
- **Truncated / incomplete slide phrases (8 provenance violations)**:
  - Example title: `"Finished Files ARE the RE"`
  - Example title: `"In the Picture Was There"`
  - Example title: `"Mispredicting Affective"`
