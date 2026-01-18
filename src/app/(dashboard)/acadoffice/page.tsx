'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const masterPrompt = `Below is a **clean, complete, FINAL MASTER PROMPT**, rewritten **from absolute scratch**, that correctly models **students, sections, lecturers, rooms, capacities, labs, multiple UGs, and student-level conflicts**.
This is the **authoritative version** — no missing pieces, no assumptions.

You can **copy–paste this exactly** to rebuild the system end-to-end.

---

# ✅ MASTER PROMPT

## Real-Time University Timetable Generator (From Scratch)

---

## 🎯 SYSTEM OBJECTIVE

Design and implement a **real-time, automated university timetable generation system** that produces **conflict-free and optimized academic timetables** for all students, lecturers, and rooms simultaneously.

The system must reflect **real university behavior**, where:

* Students may belong to **different sections for different subjects**
* Lecturers may teach **multiple subjects and multiple sections**
* Multiple UG programs and branches coexist
* Rooms and labs have **different capacities and durations**
* **No conflicts are allowed at the student level**

The solution must scale, be realistic, and generate feasible timetables within acceptable computation time.

---

## 👥 USER ROLES

### 1️⃣ Academic Office (Admin)

* Enters all academic data
* Defines constraints
* Triggers timetable generation
* Publishes final timetable

### 2️⃣ Lecturer / Professor

* Defines availability
* Views assigned timetable

### 3️⃣ Student

* Views personal timetable only

---

## 🧠 STEP 1: WEB INPUT DATA COLLECTION

### 🎓 A. Academic Structure

1. Undergraduate Programs (UGs)

   * UG ID (e.g., BTech)
   * Branches (CSE, ECE, etc.)
   * Semesters

2. Subjects
   For each subject:

   * Subject ID
   * Subject name
   * UG + branch + semester mapping
   * Theory / Lab
   * Weekly required hours
   * Session duration (1h / 2h / 3h)
   * Multiple sections allowed

3. Sections

   * Section ID
   * Subject ID
   * Student capacity (derived from enrollment)

---

### 🧑‍🎓 B. Student Data (CRITICAL)

For each student:

* Student ID
* UG, branch, semester
* **Enrollment list**

Each enrollment:

\`\`\`
⟨Student, Subject, Section⟩
\`\`\`

📌 A student may belong to **different sections for different subjects**.

---

### 👨‍🏫 C. Lecturer Data

For each lecturer:

* Lecturer ID
* Subjects they can teach (multiple)
* Sections they handle
* Available time slots
* Max hours per day
* Max hours per week

---

### 🏫 D. Rooms & Labs

For each room:

* Room ID
* Room type (Classroom / Lab)
* Seating capacity (varies per room)
* Available time slots
* Supported session durations

---

### ⏰ E. Time Slots

* Day
* Start time
* Duration
* Slot index
* Continuity information (for labs)

---

## 🧠 STEP 2: DATA NORMALIZATION

Transform inputs into core entities:

* Student
* Subject
* Section
* Lecturer
* Room
* TimeSlot
* StudentEnrollment
* TeachingAssignment

---

## 🔑 TeachingAssignment (CORE ENTITY)

Each teaching responsibility is modeled independently:

\`\`\`
⟨Lecturer, Subject, Section, WeeklyHours, SessionDuration⟩
\`\`\`

A lecturer teaching 3 subjects = 3 assignments.

---

## 🧬 STEP 3: SCHEDULING MODEL

The system schedules **sessions**, not subjects or students directly.

Each scheduled session (gene):

\`\`\`
⟨TeachingAssignment, TimeSlotBlock, Room⟩
\`\`\`

Each chromosome = **complete university timetable**.

---

## 🚀 STEP 4: INITIAL POPULATION (HEURISTIC)

Generate semi-valid timetables using:

1. Schedule labs before theory
2. Schedule longer sessions first
3. Schedule larger sections first
4. Assign lecturers only within availability
5. Assign rooms only if:

   * Room type matches
   * Room capacity ≥ enrolled students
   * Room available for full duration
6. Avoid obvious clashes during generation

---

## ❗ STEP 5: HARD CONSTRAINTS (ABSOLUTE)

If **any hard constraint fails → timetable is INVALID**.

### 🚫 Student-Level Constraints (MOST IMPORTANT)

* **No student may attend two sessions whose time slots overlap**,
  even if they belong to different sections, subjects, or lecturers.

---

### 🚫 Section Constraints

* A section cannot have overlapping sessions

---

### 🚫 Lecturer Constraints

* A lecturer cannot teach two sessions at the same time
* Lecturer must be qualified for the subject
* Availability must be respected
* Daily and weekly workload limits must be enforced

---

### 🚫 Room Constraints

* A room cannot host two sessions at the same time
* Room capacity ≥ number of enrolled students
* Room type must match session type
* Room must be free for full session duration

---

### 🚫 Academic Constraints

* All required weekly sessions must be scheduled
* Lab sessions must occupy **continuous time slots**

---

## 🌟 STEP 6: SOFT CONSTRAINTS (OPTIMIZATION)

Soft constraints add penalties but do not invalidate the timetable:

* Minimize student idle gaps
* Minimize lecturer idle gaps
* Balance workload across days
* Prefer same room for same subject
* Prefer optimal room size (avoid wastage)
* Avoid extreme early/late slots

Each soft constraint has a **configurable weight**.

---

## 📊 STEP 7: FITNESS FUNCTION

\`\`\`
If any hard constraint violated:
    fitness = 0
Else:
    fitness = MAX_SCORE − Σ(weight × penalty)
\`\`\`

Fitness must be:

* Deterministic
* Efficient
* Comparable

---

## 🔧 STEP 8: GENETIC OPERATIONS

### Selection

* Tournament or roulette selection

### Crossover

* Swap subject blocks or day blocks
* Preserve duration and capacity validity

### Mutation (Adaptive)

* Change time slot
* Change room (if capacity valid)
* Change lecturer (if qualified & available)

Mutation rate decreases over generations.

---

## 🛠️ STEP 9: REPAIR FUNCTION (MANDATORY)

After crossover/mutation:

* Detect conflicts
* Repair:

  * Student overlaps
  * Lecturer overlaps
  * Room overlaps
  * Capacity violations
  * Duration violations

---

## 🏆 STEP 10: ELITISM & TERMINATION

* Preserve top K timetables per generation
* Stop when:

  * Fitness stagnates
  * Threshold reached
  * Max generations reached

---

## 🔍 STEP 11: LOCAL SEARCH REFINEMENT

Optimize best timetable:

* Slot swaps
* Gap reduction
* Room reassignment for efficiency

---

## 📤 STEP 12: OUTPUT GENERATION

Generate:

1. **Student-wise timetable**
2. **Lecturer-wise timetable**
3. **Room utilization timetable**
4. **UG / Branch / Section timetables**

All outputs must be:

* Student-conflict-free
* Lecturer-conflict-free
* Capacity-valid
* Duration-correct

---

## ⚡ STEP 13: REAL-TIME OPERATION

* Academic Office triggers generation
* Algorithm runs asynchronously
* Progress feedback shown
* Final timetable published and locked

---

## ✅ FINAL GUARANTEES

* No student time conflicts (even across sections)
* No lecturer overlaps
* No room overbooking
* Capacity-aware scheduling
* Multi-UG global optimization
* Realistic university-grade timetable

---

## 🔑 ONE-LINE SUMMARY

> *A real-time, constraint-based university timetable generator that globally schedules students, lecturers, subjects, sections, and rooms while enforcing student-level conflict constraints using genetic-algorithm-driven optimization.*
`;


export default function TimetableGeneratorPromptPage() {
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Timetable Generator</CardTitle>
                <CardDescription>Master prompt for the real-time university timetable generator.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[70vh] rounded-md border p-4">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{masterPrompt}</pre>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}
