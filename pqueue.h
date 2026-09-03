#ifndef PQUEUE_H
#define PQUEUE_H

typedef struct {
    int id;             // Incident ID or node ID
    double priority;    // Priority score (higher = more urgent for max, lower = closer for min)
} PQEntry;

typedef struct {
    PQEntry* heap;      // Dynamic array of entries
    int* posMap;        // posMap[id] = index in heap[] (-1 if absent)
    int size;           // Current number of entries
    int capacity;       // Allocated capacity of heap[]
    int posMapSize;     // Allocated size of posMap[]
    int isMinHeap;      // 0 = max-heap, 1 = min-heap
} PQueue;

PQueue* pqCreate(int capacity, int posMapSize, int isMinHeap);
void pqInsert(PQueue* pq, int id, double priority);
PQEntry pqExtract(PQueue* pq);
PQEntry pqPeek(const PQueue* pq);
void pqUpdatePriority(PQueue* pq, int id, double newPriority);
int pqContains(const PQueue* pq, int id);
int pqIsEmpty(const PQueue* pq);
void pqFree(PQueue* pq);

#endif
