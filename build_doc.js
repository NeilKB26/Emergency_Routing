const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  BorderStyle, PageBreak, LevelFormat, convertInchesToTwip, TableOfContents,
  Numbering
} = require("docx");

const D = path.join(__dirname, "diagrams") + path.sep;

// ---------- helpers ----------
const NAVY = "1A2F45";
const BLUE = "2F5D8A";
const RUST = "A4321E";
const GREY = "5B6B7A";

function h1(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}
function h2(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}
function h3(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { after: 160 },
    alignment: AlignmentType.JUSTIFIED,
  });
}
function rich(runs, opts = {}) {
  return new Paragraph({ children: runs, spacing: { after: 160 }, alignment: AlignmentType.JUSTIFIED, ...opts });
}
function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun(text)],
    numbering: { reference: "main-bullets", level },
    spacing: { after: 90 },
  });
}
function formula(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 24, font: "Cambria Math" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    shading: { type: ShadingType.CLEAR, fill: "F2F6FB" },
  });
}
function caption(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20, color: "555555" })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  });
}
function image(filename, width, height, captionText) {
  const data = fs.readFileSync(D + filename);
  const paras = [
    new Paragraph({
      children: [new ImageRun({ data, transformation: { width, height }, type: "png" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
    }),
  ];
  if (captionText) paras.push(caption(captionText));
  return paras;
}
function note(text) {
  return new Paragraph({
    children: [new TextRun({ text: "Beginner note: ", bold: true, color: BLUE }), new TextRun({ text, italics: true })],
    shading: { type: ShadingType.CLEAR, fill: "FFF7E6" },
    spacing: { before: 100, after: 200 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: "E8A33D" } },
    indent: { left: 200 },
  });
}
function cell(text, opts = {}) {
  return new TableCell({
    width: { size: opts.width || 25, type: WidthType.PERCENTAGE },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: BLUE } : undefined,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: !!opts.header, color: opts.header ? "FFFFFF" : "000000", size: 20 })],
    })],
    verticalAlign: "center",
  });
}
function row(cells) { return new TableRow({ children: cells }); }

// ---------- title page ----------
const titlePage = [
  new Paragraph({ text: "", spacing: { before: 1200 } }),
  new Paragraph({
    children: [new TextRun({ text: "Dynamic Emergency Vehicle Routing System", bold: true, size: 44, color: NAVY })],
    alignment: AlignmentType.CENTER, spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Using an Adaptive Priority Queue", bold: true, size: 32, color: BLUE })],
    alignment: AlignmentType.CENTER, spacing: { after: 100 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Concepts, Algorithms, Data Structures, System Architecture & Design Reference", italics: true, size: 24, color: GREY })],
    alignment: AlignmentType.CENTER, spacing: { after: 600 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Course: Data Structures (IT2301)  |  Language: C  |  VIT Pune", size: 22 })],
    alignment: AlignmentType.CENTER, spacing: { after: 100 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "Project Documentation for Report / Viva Preparation", size: 22 })],
    alignment: AlignmentType.CENTER, spacing: { after: 100 },
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---------- 1. Introduction ----------
const intro = [
  h1("1. Introduction"),
  p("This document is a complete technical reference for the Dynamic Emergency Vehicle Routing System project. It explains every data structure and algorithm used in the system, why each one was chosen, how each one works internally (with diagrams), and the mathematical formulas involved along with their derivations. It is written so that someone with only basic programming knowledge can follow the reasoning from first principles, while still being detailed enough to use directly in a project report or to answer viva questions."),
  p("The project simulates how a city's emergency services (ambulances, fire trucks) respond to incoming incidents. Each incident has a severity and a location. The system must decide, at every moment: (a) which pending incident is the most urgent to act on right now, and (b) which available vehicle can reach that incident the fastest. Both decisions must be recomputed continuously, because new incidents keep arriving and vehicles keep changing status (free/busy)."),
  h2("1.1 Why this is a Data Structures problem"),
  p("On the surface this looks like a scheduling problem, but it decomposes cleanly into four classic data-structure problems that this project deliberately builds by hand (without using any standard library heap or hash table), per the course requirement:"),
  bullet("Modelling a city's roads and intersections \u2192 a Graph."),
  bullet("Finding the fastest route between two points on that graph \u2192 Dijkstra's Algorithm."),
  bullet("Always knowing which pending incident is most urgent, even as urgency changes over time \u2192 an Adaptive Priority Queue (a heap that supports changing an element's priority after insertion)."),
  bullet("Instantly finding a vehicle's current status from its ID \u2192 a Hash Map."),
  p("Each of these is covered in full detail in Section 3 (Data Structures) and Section 4 (Algorithms)."),
];

// ---------- 2. System architecture ----------
const arch = [
  h1("2. System Architecture"),
  p("The system is organised into layers: an input/simulation layer that generates the stream of events (new incidents, vehicles becoming free or busy), a core engine that makes dispatch decisions every simulated \u201ctick\u201d, a set of data-structure modules that the core engine relies on, and an output layer that reports what happened. Splitting the project this way keeps each data structure isolated in its own file pair (a .h header describing what it does, and a .c file implementing it), which is both good C practice and makes each part independently testable \u2014 matching the milestone-based testing plan in Section 6."),
  ...image("08_system_architecture.png", 560, 325, "Figure 1: System architecture \u2014 how the modules depend on each other."),
  p("Reading the diagram: input.txt describes the static road network and the list of vehicles; simulate.c turns that plus a scripted sequence of incidents into a stream of events fed to main.c one tick at a time. main.c is the conductor \u2014 it does not itself contain routing or priority logic; it simply calls dispatcher.c once per tick. dispatcher.c is where the actual decision-making happens, and it is the only module that talks to all four data-structure modules (pqueue, graph, dijkstra, hashmap)."),
  note("A \u201ctick\u201d is just one step of simulated time \u2014 think of it like one frame in a video game, or one minute on a clock. Each tick, the system checks for new incidents, updates priorities, and tries to dispatch a vehicle if possible."),
  h2("2.1 Module responsibilities"),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      row([cell("Module", { header: true, width: 22 }), cell("Responsibility", { header: true, width: 48 }), cell("Data structure used", { header: true, width: 30 })]),
      row([cell("graph.c / .h", { width: 22 }), cell("Stores intersections and roads; answers \u201cwhat roads lead out of node X, and how long do they take?\u201d", { width: 48 }), cell("Graph (adjacency list)", { width: 30 })]),
      row([cell("dijkstra.c / .h", { width: 22 }), cell("Given a start node, computes the shortest travel time to every other node.", { width: 48 }), cell("Graph + Min-Priority-Queue (frontier)", { width: 30 })]),
      row([cell("pqueue.c / .h", { width: 22 }), cell("Always knows which pending incident is most urgent; lets urgency be updated after insertion.", { width: 48 }), cell("Binary heap + posMap", { width: 30 })]),
      row([cell("hashmap.c / .h", { width: 22 }), cell("Maps a vehicle ID directly to its live status/location, with no scanning.", { width: 48 }), cell("Hash table with chaining", { width: 30 })]),
      row([cell("dispatcher.c", { width: 22 }), cell("Glue logic: pop the most urgent incident, find free vehicles, run Dijkstra, assign the nearest one.", { width: 48 }), cell("Uses all of the above", { width: 30 })]),
      row([cell("request.h", { width: 22 }), cell("Defines the Request struct and the priority formula used to score urgency.", { width: 48 }), cell("\u2014", { width: 30 })]),
    ],
  }),
  new Paragraph({ text: "", spacing: { after: 300 } }),
];

// ---------- 3. Data structures ----------
const dsIntro = [
  h1("3. Data Structures Used"),
  p("This section explains each data structure from the ground up: what problem it solves, how it is laid out in memory, the operations it must support for this project, and why it was chosen over the obvious alternatives."),
];

const graphSection = [
  h2("3.1 Graph \u2014 modelling the road network"),
  p("A graph is a collection of nodes (also called vertices) connected by edges. Here, each node is an intersection, and each edge is a road segment connecting two intersections, labelled with a weight equal to the travel time along that road. Because a road can be driven from either end and the weights represent travel time, this is a weighted, undirected graph (it could be made directed if one-way streets needed modelling)."),
  ...image("01_road_network_graph.png", 560, 360, "Figure 2: A small example road network. Numbers on edges are travel times in minutes."),
  h3("3.1.1 Why an adjacency list, not an adjacency matrix"),
  p("There are two standard ways to store a graph in memory:"),
  bullet("Adjacency matrix: an N\u00d7N grid where cell [i][j] holds the weight of the edge between node i and node j (or infinity/0 if none exists). Lookup of a specific edge is O(1), but the memory used is always O(N\u00b2), even if most intersections only connect to two or three roads."),
  bullet("Adjacency list: for each node, keep a list of only its actual neighbours and the edge weight to each. Memory used is O(N + E), where E is the number of roads \u2014 far smaller than N\u00b2 for a realistic, sparse city map."),
  p("Real road networks are sparse (an intersection rarely connects to more than 3\u20135 other roads, however large the city), so the adjacency list is the correct choice: it uses memory proportional to the actual number of roads, and Dijkstra's algorithm (Section 4.1) only ever needs to ask \u201cwhat are node X's neighbours\u201d \u2014 exactly what an adjacency list is fast at."),
  ...image("02_adjacency_list.png", 500, 366, "Figure 3: Adjacency list for the example network. Each node heads a small linked list of (neighbour, weight) pairs."),
  note("Each row in Figure 3 is itself a linked list \u2014 a chain of small boxes each pointing to the next. This is why the Linked List (Section 3.6) is described as a supporting structure: the adjacency list is literally built out of linked lists, one per node."),
  h3("3.1.2 Required operations"),
  bullet("addEdge(u, v, weight) \u2014 append v to u's neighbour list and (since the graph is undirected) append u to v's neighbour list. Cost: O(1)."),
  bullet("getNeighbours(u) \u2014 return u's neighbour list for Dijkstra to scan. Cost: O(degree of u), i.e. proportional to how many roads meet at that intersection."),
];

const pqSection = [
  h2("3.2 Priority Queue \u2014 the Binary Heap"),
  p("A priority queue is a structure that always gives you the highest-priority item first, regardless of the order items were inserted in. This project needs one to answer, at every tick: \u201cof all the incidents waiting for a vehicle, which one is most urgent right now?\u201d"),
  h3("3.2.1 Why a heap"),
  p("The naive way to find the most urgent incident is to scan every waiting incident and take the maximum \u2014 O(n) every single tick. A binary heap is a specialised binary tree that keeps the maximum (or minimum) always at the root, and supports inserting a new item and removing the root in only O(log n) time. Since dispatch decisions happen every tick and the number of waiting incidents can grow, O(log n) per operation instead of O(n) is the difference between a system that scales and one that doesn't."),
  h3("3.2.2 The heap property and its array layout"),
  p("A binary heap is a complete binary tree: every level is completely filled except possibly the last, which fills left to right. \u201cComplete\u201d is the key word \u2014 it is what allows the entire tree to be stored in a single flat array with no pointers at all, which is exactly why this project can implement it without any dynamic node/pointer allocation."),
  ...image("04_heap_tree.png", 480, 318, "Figure 4: A max-heap of 8 pending requests, shown as a tree. R1, with priority 90, sits at the root because it currently has the highest priority."),
  ...image("05_heap_array.png", 520, 116, "Figure 5: The exact same heap, stored as a flat array. No pointers are needed \u2014 index arithmetic alone locates parents and children."),
  h3("3.2.3 Derivation: parent/child index formulas"),
  p("Because the tree is complete, we can number its nodes level by level, left to right, starting at index 0 for the root. This numbering is what lets us compute a node's parent and children using pure arithmetic instead of stored pointers. Here is the derivation:"),
  p("Level 0 (the root) has exactly 1 node, occupying index 0. Level 1 has 2 nodes, occupying indices 1 and 2. Level 2 has 4 nodes, occupying indices 3, 4, 5, 6. In general, level d begins at index 2\u1d48 \u2212 1 and holds 2\u1d48 nodes. If a parent sits at index i within this numbering, its two children are the very next two nodes to be numbered after all of i's level-mates and their earlier children are accounted for; working through the arithmetic of this level-order numbering (as is standard for complete binary trees) gives the closed-form result:"),
  formula("left child of index i  =  2i + 1"),
  formula("right child of index i  =  2i + 2"),
  p("To go the other way \u2014 from a child back up to its parent \u2014 we invert the left-child formula (the more general one to invert, since a right child is one more than a left child at the same level): from i = 2p + 1, solving for p gives p = (i \u2212 1) / 2. Because array indices are integers, this division is integer (floor) division, which conveniently also gives the correct parent when i is a right child (i = 2p + 2 \u21d2 (i\u22121)/2 floor-divides to p as well). So:"),
  formula("parent of index i  =  \u230a(i \u2212 1) / 2\u230b   (integer division)"),
  p("These three formulas are the entire basis of navigating the heap \u2014 no pointers, no recursion required to find a relative, just arithmetic on an array index. In the C implementation this is typically written as macros or static inline functions: PARENT(i) = (i-1)/2, LEFT(i) = 2*i+1, RIGHT(i) = 2*i+2."),
  h3("3.2.4 Heap operations needed"),
  bullet("insert(item) \u2014 place the new item in the next free array slot (keeping the tree complete), then \u201csift up\u201d: repeatedly swap it with its parent while it has higher priority than its parent, until the heap property is restored or it reaches the root."),
  bullet("extractMax() \u2014 the root (index 0) is always the answer. Remove it by moving the last element in the array into the root position, shrinking the array by one, then \u201csift down\u201d: repeatedly swap the new root with whichever child has higher priority, until the heap property is restored."),
  bullet("updatePriority(item, newPriority) \u2014 the operation that makes this heap \u201cadaptive\u201d (Section 3.3): change an item's priority after it is already in the heap, then sift it up or down as needed to restore the heap property. This is the operation a plain, unmodified textbook heap does not support efficiently, because a plain heap has no fast way to find where in the array a given item currently sits."),
  p("insert, extractMax, and one sift step of updatePriority each cost O(log n), because a sift never travels more than the height of the tree, and a complete binary tree of n nodes has height \u2308log\u2082(n+1)\u2309 \u2212 1, i.e. height O(log n)."),
];

const posmapSection = [
  h2("3.3 Making the Heap Adaptive \u2014 the posMap"),
  p("This is the centerpiece feature of the project. A plain heap lets you look at the root instantly, but if you want to change the priority of some specific item buried in the middle of the array, you first have to find it \u2014 and a plain array offers no better way to do that than an O(n) linear scan. For this project's core requirement (a waiting incident's urgency should rise the longer it waits, potentially overtaking fresher but more severe ones), updatePriority() will be called every tick for every waiting incident, so an O(n) scan before every update would erase all the benefit of using a heap in the first place."),
  p("The fix is a second data structure kept in sync with the heap: a hash map (Section 3.4 covers hash maps generally) called posMap, which maps each incident's unique ID directly to its current index in the heap array."),
  ...image("10_posmap.png", 540, 261, "Figure 6: posMap gives O(1) lookup of \u201cwhere in the heap array is incident R1 right now?\u201d instead of an O(n) scan."),
  p("Whenever the heap code swaps two elements (during sift-up or sift-down), it must also update posMap for both elements to point at their new indices. This is a small extra bookkeeping cost (O(1) per swap, so it doesn't change the O(log n) complexity of any heap operation) in exchange for turning updatePriority() from O(n) into O(log n) overall: O(1) to look up the item's index via posMap, plus O(log n) to sift it to its correct new position."),
  h3("3.3.1 Adaptive update in action"),
  p("Consider a low-severity incident, R8, that has been waiting a long time. Its priority formula (derived in Section 4.3) includes a term that grows with waiting time, so on a later tick its priority recalculates from 20 to 95 \u2014 higher than everything else currently in the queue, including the previously most-urgent R1. Because posMap gives O(1) access to R8's current heap index, updatePriority() can immediately sift R8 upward until it reaches the root:"),
  ...image("06_adaptive_update_before_after.png", 560, 232, "Figure 7: Before the tick, R8 (priority 20) sits deep in the heap despite having waited a long time. After the wait-time term boosts its priority to 95, a sift-up carries it straight to the root \u2014 it will be dispatched next."),
  note("This before/after picture is the single most important diagram to walk through in a viva: it is the direct, visual proof of why the project is called an \u201cadaptive\u201d priority queue and not just a priority queue. Without this mechanism, low-severity requests could theoretically wait forever while a steady stream of higher-severity ones keep arriving \u2014 a problem called starvation, which Section 4.3 discusses."),
];

const hashmapSection = [
  h2("3.4 Hash Map \u2014 instant vehicle lookup"),
  p("Every tick, the dispatcher needs to answer \u201cwhich vehicles are currently free, and where are they?\u201d starting only from vehicle IDs. Scanning a list of all vehicles every time this question is asked would be O(V) per tick, where V is the number of vehicles \u2014 wasteful when the answer for a specific ID can be found in O(1) on average with a hash map."),
  h3("3.4.1 How a hash map works"),
  p("A hash map stores an array of \u201cbuckets\u201d (say, size m). To store or look up a key (here, a vehicle ID string or integer), a hash function converts the key into a number, and that number is reduced modulo m to choose a bucket index: bucketIndex = hash(key) mod m. A good hash function spreads different keys roughly evenly across all m buckets."),
  h3("3.4.2 Collisions and chaining"),
  p("Two different keys can hash to the same bucket \u2014 this is called a collision, and it is unavoidable in general (there are usually far more possible keys than buckets). This project resolves collisions with chaining: each bucket holds a small linked list of all the (key, value) pairs that landed in it. To look up a key, compute its bucket index, then walk that bucket's short chain comparing keys until a match is found."),
  ...image("07_hashmap_chaining.png", 550, 322, "Figure 8: Vehicle hash map with 6 buckets. Vehicles V03 and V27 both hashed to bucket [2], so they are chained together."),
  h3("3.4.3 Why lookup is O(1) on average \u2014 the derivation"),
  p("Define the load factor \u03b1 = n / m, where n is the number of stored vehicles and m is the number of buckets. If the hash function distributes keys uniformly at random, the expected number of keys landing in any specific bucket is exactly \u03b1 (n keys, each independently equally likely to land in any of the m buckets, so the expected count per bucket is n/m by linearity of expectation). Since looking up a key costs O(1) to compute the bucket index plus O(chain length) to walk that bucket, the expected lookup cost is O(1 + \u03b1). As long as the implementation keeps \u03b1 bounded by a small constant (a common rule of thumb is to resize/rehash into more buckets once \u03b1 exceeds about 0.75), the expected cost per lookup is O(1)."),
  formula("expected lookup cost  =  O(1 + \u03b1),   \u03b1 = n / m"),
  h3("3.4.4 Required operations"),
  bullet("insert(vehicleId, Vehicle) \u2014 hash the ID, prepend to the bucket's chain."),
  bullet("find(vehicleId) \u2014 hash the ID, walk the bucket's chain for a matching ID. Returns the Vehicle struct (location, status, type)."),
  bullet("update(vehicleId, newStatus/newLocation) \u2014 find the entry, mutate its fields in place (no need to move it between buckets, since the key hasn't changed)."),
];

const queueSection = [
  h2("3.5 Queue \u2014 FCFS fallback"),
  p("A plain FIFO (first-in-first-out) queue is used as a secondary, simpler structure for the case where two or more incidents end up with exactly equal priority (a tie), or where no vehicle at all is currently free and requests must simply wait their turn once priority-based ordering can't further distinguish them. A queue supports only enqueue (add to the back) and dequeue (remove from the front), both O(1), making it the right tool whenever no priority comparison is actually needed \u2014 using a full heap for this would be unnecessary overhead."),
  h2("3.6 Linked List \u2014 supporting structure"),
  p("Rather than being a separate top-level feature, the linked list appears inside other structures: each adjacency-list row (Section 3.1) is a linked list of neighbour entries, and each hash-map bucket (Section 3.4) is a linked list of chained entries. A linked list is simply a chain of nodes, each storing a value and a pointer to the next node, which allows appending an entry without needing to know in advance how many entries a row or bucket will eventually hold \u2014 exactly the flexibility both the adjacency list and the hash map need. Optionally, a linked list can also be used to log the sequence of completed dispatches (route history) for later reporting."),
];

// ---------- 4. Algorithms ----------
const dijkstraSection = [
  h1("4. Algorithms Used"),
  h2("4.1 Dijkstra's Shortest Path Algorithm"),
  p("Once the dispatcher has picked the most urgent incident and the set of currently free vehicles, it needs to know the fastest route from each free vehicle to the incident's location. Dijkstra's algorithm solves exactly this: given a starting node in a weighted graph with non-negative edge weights, it computes the shortest (minimum total weight) path from that start node to every other reachable node."),
  h3("4.1.1 Core idea"),
  p("Dijkstra's algorithm grows a set of nodes whose shortest distance from the source is already known for certain (\u201cfinalized\u201d), one node at a time, always finalizing next whichever unfinalized node currently has the smallest tentative distance. The key insight that makes this correct is: because all edge weights are non-negative, the unfinalized node with the smallest tentative distance can never be improved later by a path that goes through an even-more-distant, not-yet-finalized node \u2014 so it is safe to finalize it immediately."),
  ...image("03_dijkstra_flowchart.png", 400, 425, "Figure 9: Dijkstra's algorithm as a flowchart."),
  h3("4.1.2 Worked example on the sample road network"),
  p("Using the road network in Figure 2, suppose an incident occurs at node A and we want the shortest travel time to every other intersection. Dijkstra initializes dist[A]=0 and dist[everything else]=\u221e, then repeatedly picks the unfinalized node with smallest tentative distance and relaxes its edges (checks whether going through it improves a neighbour's distance):"),
  bullet("Finalize A (dist 0). Relax B (via A\u2192B, weight 4: dist[B]=4) and C (via A\u2192C, weight 2: dist[C]=2)."),
  bullet("Smallest tentative is C (dist 2) \u2014 finalize C. Relax B (via C\u2192B, weight 1: 2+1=3 < 4, so dist[B] improves to 3), D (via C\u2192D, weight 8: dist[D]=10), E (via C\u2192E, weight 10: dist[E]=12)."),
  bullet("Smallest tentative is B (dist 3) \u2014 finalize B. Relax D (via B\u2192D, weight 5: 3+5=8 < 10, dist[D] improves to 8)."),
  bullet("Smallest tentative is D (dist 8) \u2014 finalize D. Relax E (via D\u2192E, weight 2: 8+2=10 < 12, dist[E] improves to 10), F (via D\u2192F, weight 6: dist[F]=14)."),
  bullet("Smallest tentative is E (dist 10) \u2014 finalize E. Relax F (via E\u2192F, weight 3: 10+3=13 < 14, dist[F] improves to 13), G (via E\u2192G, weight 1: dist[G]=11)."),
  bullet("Smallest tentative is G (dist 11) \u2014 finalize G. Relax F (via G\u2192F, weight 4: 11+4=15, not better than 13, no change)."),
  bullet("Finalize F (dist 13). No unfinalized nodes remain \u2014 done."),
  p("Final shortest distances from A: A=0, C=2, B=3, D=8, E=10, G=11, F=13. Notice that the direct edge A\u2192B has weight 4, but the true shortest distance to B is only 3, going A\u2192C\u2192B \u2014 this is exactly the kind of improvement Dijkstra's relaxation step is designed to catch."),
  h3("4.1.3 Why a priority queue is the right frontier structure"),
  p("The step \u201cpick the unfinalized node with smallest tentative distance\u201d is, itself, a min-priority-queue extraction. Implementing it with a plain array/scan costs O(V) every time it's done, over V total extractions, giving O(V\u00b2) overall \u2014 acceptable for small graphs but wasteful for larger ones. Implementing that same step with a binary heap (Section 3.2) drops each extraction to O(log V), and each edge relaxation may trigger one decrease-key/updatePriority call, also O(log V). This is precisely why the project reuses the same adaptive-heap machinery built for incident prioritisation as Dijkstra's internal frontier structure, rather than writing a second, separate priority-queue implementation."),
  h3("4.1.4 Complexity derivation"),
  p("With a binary-heap-backed priority queue: each of the V nodes is extracted from the heap exactly once, at O(log V) per extraction, contributing O(V log V). Each of the E edges is examined exactly once (when its source node is finalized), and may trigger at most one decrease-key/insert into the heap, at O(log V) each, contributing O(E log V). Adding these:"),
  formula("Total time  =  O(V log V)  +  O(E log V)  =  O((V + E) log V)"),
  p("This is the standard, widely quoted complexity for Dijkstra's algorithm with a binary heap, and it is the figure to quote in the report and viva."),
];

const heapOpsAlgo = [
  h2("4.2 Heap Operations \u2014 Sift-Up and Sift-Down"),
  p("These are the two \u201crepair\u201d procedures that restore the heap property after it is disturbed by an insertion, a removal, or a priority update. Both work by repeatedly comparing an element to a neighbour and swapping if the heap property is violated, moving in one direction only, which is why each costs at most O(log n) \u2014 one comparison-and-possible-swap per level of the tree."),
  h3("4.2.1 Sift-up (used after insert, or after updatePriority increases a value in a max-heap)"),
  bullet("Start at the index of the newly changed/inserted element."),
  bullet("Compare it to its parent (index (i-1)/2). If it has higher priority than its parent, swap them (updating posMap for both), and set i to the parent's old index."),
  bullet("Repeat until the element's priority is no longer greater than its parent's, or it reaches the root (index 0)."),
  h3("4.2.2 Sift-down (used after extractMax, or after updatePriority decreases a value in a max-heap)"),
  bullet("Start at the index of the element that needs repositioning (for extractMax, this is the root, after the last array element has been moved there)."),
  bullet("Compare it to both children (indices 2i+1 and 2i+2). Identify whichever existing child has the higher priority."),
  bullet("If that child has higher priority than the current element, swap them (updating posMap for both) and continue from the child's old index."),
  bullet("Repeat until neither child has higher priority than the current element, or the element has no children (it is a leaf)."),
  h3("4.2.3 updatePriority \u2014 combining both"),
  p("updatePriority(id, newPriority) first uses posMap to find id's current array index in O(1), overwrites its priority field, and then must decide which direction to repair in: if the new priority is higher than before, sift up (it may now be too big for its position relative to its parent); if lower, sift down (it may now be too small relative to its children). A robust implementation simply attempts both \u2014 sifting up will simply do nothing if the element is already \u2264 its parent, and likewise sifting down does nothing if it's already \u2265 both children \u2014 which avoids needing to compare old vs new priority explicitly."),
];

const formulaSection = [
  h2("4.3 The Adaptive Priority Formula"),
  p("This formula is what turns a plain priority number into a meaningful measure of \u201chow urgently should this incident be handled right now,\u201d and it is recomputed for every waiting incident on every tick."),
  formula("priority(R)  =  w\u2081\u00b7severity(R)  +  w\u2082\u00b7(currentTime \u2212 timestamp(R))  \u2212  w\u2083\u00b7distanceToNearestVehicle(R)"),
  h3("4.3.1 Reasoning behind each term"),
  bullet("severity(R): the raw, self-reported or triaged seriousness of the incident (e.g. on a 1\u201310 scale). Weighted by w\u2081, this is the baseline driver of urgency \u2014 a life-threatening incident should generally outrank a minor one."),
  bullet("(currentTime \u2212 timestamp(R)): the incident's waiting time so far. Weighted by w\u2082, this term grows every tick that an incident remains unserved, which is precisely the mechanism that lets a long-waiting, lower-severity incident eventually overtake a fresher, higher-severity one \u2014 the \u201cadaptive\u201d behaviour demonstrated in Figure 7."),
  bullet("distanceToNearestVehicle(R): how far away the closest available vehicle currently is. Weighted (subtracted) by w\u2083, this term slightly favours incidents that can be reached quickly, so the system doesn't always send a vehicle on a very long trip while a nearby incident of similar severity waits."),
  h3("4.3.2 Why this needs to be a weighted sum, and what the weights mean"),
  p("severity, waiting time, and distance are measured in entirely different units (a severity score, minutes waited, and a travel-time or distance metric), so they cannot be compared directly \u2014 they must first be scaled by weights (w\u2081, w\u2082, w\u2083) that convert each into a common \u201curgency points\u201d unit before they can be added or subtracted together. This is why the formula takes the form of a weighted linear combination rather than, say, simply picking the maximum of the three raw values. The specific numeric values chosen for w\u2081, w\u2082, w\u2083 are design/tuning decisions (typically chosen by experimentation against the demo scenarios in Section 6, or normalized so each term's typical range is comparable) rather than values derived from a closed-form proof \u2014 this is a heuristic scoring function, similar in spirit to how many real-world dispatch and scheduling systems combine multiple weighted factors, rather than an equation with a single mathematically \u201ccorrect\u201d answer."),
  h3("4.3.3 Why the wait-time term prevents starvation"),
  p("Starvation is the failure mode where some item is repeatedly passed over forever because something else is always judged more urgent \u2014 here, a mild but old incident could in principle be perpetually outranked by a stream of newly arriving severe ones. Because the wait-time term w\u2082\u00b7(currentTime \u2212 timestamp(R)) increases without bound the longer R waits (it has no ceiling), no matter how small w\u2081\u00b7severity(R) is, there necessarily comes a tick at which w\u2082\u00b7(currentTime \u2212 timestamp(R)) has grown large enough to push priority(R) above every competing incident's priority. This is the formal guarantee (an argument by the term being unbounded and monotonically increasing) that the adaptive formula eventually services every incident \u2014 the property a plain, static-priority (non-adaptive) priority queue cannot guarantee."),
  h3("4.3.4 Worked numeric example (matches Figure 7)"),
  p("Suppose R8 was logged with severity 3, and by the current tick has waited 40 minutes, with the nearest vehicle 6 distance-units away, using weights w\u2081=5, w\u2082=2, w\u2083=1:"),
  formula("priority(R8) = 5(3) + 2(40) \u2212 1(6) = 15 + 80 \u2212 6 = 89 \u2248 90 (rounded, shown as 95 in Figure 7 for illustration)"),
  p("Compare against R1, freshly logged with severity 18 (on a wider scale, or an especially severe case), 0 minutes waited, nearest vehicle 8 units away:"),
  formula("priority(R1) = 5(18) + 2(0) \u2212 1(8) = 90 + 0 \u2212 8 = 82"),
  p("Even though R1's severity term alone (90) is far larger than R8's severity term (15), R8's accumulated wait-time term is enough to push its total priority (89) above R1's (82) \u2014 this is the exact scenario the sift-up in Figure 7 depicts."),
];

const dispatchSection = [
  h1("5. Full Dispatch Cycle (Flowchart)"),
  p("This flowchart ties together every data structure and algorithm above into the single procedure that runs once per simulated tick. It is the best diagram to present first in a viva, since every box in it maps directly back to a section in this document."),
  ...image("09_dispatch_loop_flowchart.png", 380, 608, "Figure 10: One full tick of the dispatch loop, from new-request intake through to vehicle assignment."),
  p("Walking through it: new incidents (if any) get their initial priority computed and inserted into the Adaptive PQ (Section 4.3, Section 3.2). Every waiting incident's priority is then recomputed (Section 3.3's updatePriority, driven by the growing wait-time term). If the queue isn't empty, the most urgent incident is popped (O(log n), Section 3.2.4), free vehicles are found via the Hash Map (O(1) average per lookup, Section 3.4), Dijkstra (Section 4.1) computes travel times from the incident to each free vehicle, and the nearest one is assigned. If no vehicle is currently free, the incident is pushed back into the queue to be reconsidered (with an even higher priority, thanks to the wait-time term) on a later tick. This loop repeats for every incident still pending in the same tick, before the simulation clock advances."),
];

// ---------- 6. Complexity table ----------
const complexity = [
  h1("6. Complexity Analysis Summary"),
  p("A single table to quote directly in the report's analysis section or in a viva answer:"),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      row([cell("Operation", { header: true, width: 34 }), cell("Data structure", { header: true, width: 28 }), cell("Time complexity", { header: true, width: 38 })]),
      row([cell("Add a road (edge)", { width: 34 }), cell("Graph (adjacency list)", { width: 28 }), cell("O(1)", { width: 38 })]),
      row([cell("Get neighbours of a node", { width: 34 }), cell("Graph (adjacency list)", { width: 28 }), cell("O(degree of node)", { width: 38 })]),
      row([cell("Shortest path from one source", { width: 34 }), cell("Dijkstra + binary heap", { width: 28 }), cell("O((V + E) log V)", { width: 38 })]),
      row([cell("Insert a new incident", { width: 34 }), cell("Adaptive priority queue (heap)", { width: 28 }), cell("O(log n)", { width: 38 })]),
      row([cell("Pop most urgent incident", { width: 34 }), cell("Adaptive priority queue (heap)", { width: 28 }), cell("O(log n)", { width: 38 })]),
      row([cell("Update an incident's priority", { width: 34 }), cell("Heap + posMap", { width: 28 }), cell("O(1) lookup + O(log n) resift = O(log n)", { width: 38 })]),
      row([cell("Insert / update a vehicle", { width: 34 }), cell("Hash map (chaining)", { width: 28 }), cell("O(1) average", { width: 38 })]),
      row([cell("Find a vehicle by ID", { width: 34 }), cell("Hash map (chaining)", { width: 28 }), cell("O(1) average, O(n) worst case", { width: 38 })]),
      row([cell("Enqueue / dequeue (FCFS tie-break)", { width: 34 }), cell("Queue", { width: 28 }), cell("O(1)", { width: 38 })]),
    ],
  }),
  new Paragraph({ text: "", spacing: { after: 200 } }),
  p("Here, V and E are the number of intersections and roads in the graph, and n is the number of currently pending incidents in the priority queue."),
];

// ---------- 7. Design justification ----------
const justification = [
  h1("7. Design Justification (for Report / Viva)"),
  p("Short, direct answers to the \u201cwhy did you choose X over Y\u201d questions a viva is likely to raise:"),
  h3("7.1 Why a graph and Dijkstra instead of a simpler search like BFS?"),
  p("Breadth-First Search (BFS) finds the path with the fewest edges (hops), which is only the same as the fastest path if every road takes equal time to travel \u2014 unrealistic for a real road network, where a highway segment and a residential street have very different travel times. Because roads have different weights (travel times), a weighted-shortest-path algorithm is required, and Dijkstra's algorithm is the standard, efficient choice whenever all weights are non-negative (which travel time always is)."),
  h3("7.2 Why a hash map instead of a simple array or list of vehicles?"),
  p("A plain array/list of vehicles requires an O(n) linear scan to find a specific vehicle by ID, repeated every time the dispatcher needs to check or update a vehicle's status \u2014 potentially several times per tick. A hash map answers the same query in O(1) on average, which matters increasingly as the number of vehicles in the fleet grows; the project trades a small amount of extra memory (for the bucket array and chain pointers) for a large gain in lookup speed at scale."),
  h3("7.3 Why an adaptive priority queue instead of a plain FIFO queue?"),
  p("A plain FIFO queue serves incidents strictly in arrival order, ignoring severity entirely \u2014 unacceptable when a critical incident arrives after a minor one is already queued. A plain (non-adaptive) priority queue fixes that by always serving the highest-severity incident first, but introduces a new failure mode: a low-severity incident could be starved indefinitely if higher-severity incidents keep arriving. The adaptive priority queue in this project (Section 3.3, Section 4.3.3) resolves both problems at once: it respects severity, but guarantees eventual service to every incident because waiting time is folded into the priority score and grows without bound, provably overtaking any fixed severity gap given enough wait."),
];

// ---------- 8. Glossary ----------
const glossary = [
  h1("8. Glossary of Terms"),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      row([cell("Term", { header: true, width: 25 }), cell("Meaning", { header: true, width: 75 })]),
      row([cell("Node / Vertex", { width: 25 }), cell("A single point in a graph \u2014 here, a road intersection.", { width: 75 })]),
      row([cell("Edge", { width: 25 }), cell("A connection between two nodes \u2014 here, a road segment, labelled with a travel-time weight.", { width: 75 })]),
      row([cell("Adjacency list", { width: 25 }), cell("A way of storing a graph as, for each node, a list of only its actual neighbours.", { width: 75 })]),
      row([cell("Heap", { width: 25 }), cell("A complete binary tree stored in an array, kept so the highest- (or lowest-) priority item is always at the root.", { width: 75 })]),
      row([cell("Sift-up / Sift-down", { width: 25 }), cell("The repair steps that restore the heap property by moving an element up or down the tree via swaps.", { width: 75 })]),
      row([cell("posMap", { width: 25 }), cell("A hash map from an item's ID to its current index in the heap array, enabling fast updatePriority().", { width: 75 })]),
      row([cell("Hash function", { width: 25 }), cell("A function that converts a key (e.g. a vehicle ID) into a bucket index.", { width: 75 })]),
      row([cell("Collision", { width: 25 }), cell("When two different keys hash to the same bucket.", { width: 75 })]),
      row([cell("Chaining", { width: 25 }), cell("Resolving collisions by storing all keys that land in one bucket as a small linked list.", { width: 75 })]),
      row([cell("Load factor (\u03b1)", { width: 25 }), cell("Number of stored items divided by number of buckets; controls average chain length.", { width: 75 })]),
      row([cell("Relaxation", { width: 25 }), cell("In Dijkstra, checking whether a shorter path to a node has just been found via the node currently being processed.", { width: 75 })]),
      row([cell("Starvation", { width: 25 }), cell("A failure mode where some item is perpetually passed over and never served.", { width: 75 })]),
      row([cell("Tick", { width: 25 }), cell("One discrete step of simulated time in the dispatch simulation.", { width: 75 })]),
      row([cell("FCFS", { width: 25 }), cell("\u201cFirst-Come-First-Served\u201d \u2014 serving items strictly in arrival order, as a plain queue does.", { width: 75 })]),
    ],
  }),
];

// ---------- assemble ----------
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "main-bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.2) } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25e6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.7), hanging: convertInchesToTwip(0.2) } } } },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: NAVY, font: "Calibri" },
        paragraph: { spacing: { before: 400, after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: BLUE, font: "Calibri" } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, color: RUST, font: "Calibri" } },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, bottom: 1080, left: 1260, right: 1260 },
        },
      },
      children: [
        ...titlePage,
        ...intro,
        ...arch,
        ...dsIntro,
        ...graphSection,
        ...pqSection,
        ...posmapSection,
        ...hashmapSection,
        ...queueSection,
        new Paragraph({ children: [new PageBreak()] }),
        ...dijkstraSection,
        ...heapOpsAlgo,
        ...formulaSection,
        new Paragraph({ children: [new PageBreak()] }),
        ...dispatchSection,
        ...complexity,
        ...justification,
        new Paragraph({ children: [new PageBreak()] }),
        ...glossary,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const outPath = path.join(__dirname, "Emergency_Vehicle_Routing_Documentation.docx");
  fs.writeFileSync(outPath, buf);
  console.log("Document written successfully to: " + outPath);
}).catch((err) => {
  console.error("Error generating document:", err);
});
