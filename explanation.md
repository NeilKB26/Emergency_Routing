# Codebase Explanation: Dynamic Emergency Vehicle Routing System

This document provides a comprehensive walkthrough of the entire code stack we built for the Dynamic Emergency Vehicle Routing System. We wrote all data structures from scratch in C to ensure we fully understand their inner workings. Below, we break down what each module does, how the code operates, the inputs we give it, and the outputs it generates.

## 1. Graph Module (`graph.h`, `graph.c`)

### What it does
We use this module to model the city's road network. We chose to implement it as an **Adjacency List** rather than a matrix because real-world road networks are sparse (most intersections only connect to 3 or 4 others). 

### How the code works
- **Structs**: We created an `AdjNode` to hold the destination intersection and the travel time (weight). The `Graph` struct holds an array of linked-list heads.
- **Functions**: `addEdge(src, dest, weight)` creates an `AdjNode` and adds it to the linked list for the `src` intersection. Because roads are two-way, it also adds it to the `dest` list. 

### Input / Output
- **Input**: We give it the number of intersections and a list of road connections with their travel times.
- **Output**: The network is mapped in memory. If we call `printGraph()`, it outputs each intersection and its direct neighbors, proving the network is wired correctly.

## 2. Priority Queue Module (`pqueue.h`, `pqueue.c`)

### What it does
We built a Binary Heap to manage our queue. It operates as a Min-Heap when we need shortest paths (Dijkstra) and as a Max-Heap when we need to decide which emergency request is most urgent. We added an "Adaptive" feature (`posMap`) so we can change the priority of an item *after* it's already in the queue.

### How the code works
- **Structs**: `PQEntry` holds an ID and a priority score. `PQueue` holds a dynamic array for the heap and a `posMap` array.
- **The Magic of posMap**: Normally, updating a heap item's priority takes O(N) time because you have to search for it. We use `posMap` to instantly know an item's exact array index. When an item swaps places (`siftUp` or `siftDown`), we update `posMap`. 
- **Functions**: `pqInsert` adds to the end and `siftUp`. `pqUpdatePriority` looks up the index via `posMap`, changes the value, and sifts up or down to fix the tree.

### Input / Output
- **Input**: We push incidents into the queue with an initial urgency score. 
- **Output**: `pqExtract()` always pops off the highest priority incident. If an incident waits too long, we call `pqUpdatePriority()` to bump its score, and it visually jumps to the front of the output stream.

## 3. Dijkstra's Algorithm (`dijkstra.h`, `dijkstra.c`)

### What it does
We use this to calculate the absolute fastest route from an incident location to every available vehicle in the city.

### How the code works
- **Structs**: `DijkstraResult` contains a `dist` array (shortest times) and a `prev` array (the path we took).
- **Algorithm**: We set the starting node's distance to 0 and all others to infinity. We push all nodes into our Min-Heap (`PQueue`). We loop through: pop the closest node, look at its neighbors, and if taking this road is faster than our previous best time, we update `dist` and use `pqUpdatePriority` to push the neighbor higher in the queue.

### Input / Output
- **Input**: The road network (`Graph`) and the starting intersection.
- **Output**: The arrays telling us the shortest time to every intersection. Using the `prev` array, we can print out the exact path (e.g., `0 -> 2 -> 1 -> 3`).

## 4. Hash Map Module (`hashmap.h`, `hashmap.c`)

### What it does
We use a Hash Map to look up vehicle statuses instantly. Instead of scanning through a list of vehicles every time we need to check if an ambulance is free, we jump straight to it.

### How the code works
- **Structs**: `Vehicle` holds the ID, location, type, and status. `HashMap` uses an array of buckets, resolving collisions via Linked List chaining (`HMEntry`).
- **Functions**: `hmInsert` uses the modulo operator (`id % numBuckets`) to assign a vehicle to a bucket. `hmFind` computes the bucket and quickly scans the short chain for the vehicle. `hmGetFreeVehicles` scans all buckets to compile a list of currently available vehicles for the dispatcher.

### Input / Output
- **Input**: Vehicle structs containing their live status (FREE or BUSY) and current location.
- **Output**: Instantly returns a pointer to the vehicle, allowing us to update its status or location in O(1) time.

*(Note: We will add explanations for Request, Dispatcher, and Simulation as we build them!)*
