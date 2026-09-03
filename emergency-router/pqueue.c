#include "pqueue.h"
#include <stdio.h>
#include <stdlib.h>

#define PARENT(i) (((i) - 1) / 2)
#define LEFT(i) (2 * (i) + 1)
#define RIGHT(i) (2 * (i) + 2)

PQueue* pqCreate(int capacity, int posMapSize, int isMinHeap) {
    PQueue* pq = (PQueue*)malloc(sizeof(PQueue));
    pq->capacity = capacity;
    pq->posMapSize = posMapSize;
    pq->size = 0;
    pq->isMinHeap = isMinHeap;
    pq->heap = (PQEntry*)malloc(capacity * sizeof(PQEntry));
    pq->posMap = (int*)malloc(posMapSize * sizeof(int));
    
    for (int i = 0; i < posMapSize; i++) {
        pq->posMap[i] = -1;
    }
    return pq;
}

int pqIsEmpty(const PQueue* pq) {
    return pq->size == 0;
}

int pqContains(const PQueue* pq, int id) {
    if (id < 0 || id >= pq->posMapSize) return 0;
    return pq->posMap[id] != -1;
}

static int shouldSwap(const PQueue* pq, int a, int b) {
    if (pq->isMinHeap) {
        return pq->heap[a].priority < pq->heap[b].priority;
    } else {
        return pq->heap[a].priority > pq->heap[b].priority;
    }
}

static void heapSwap(PQueue* pq, int i, int j) {
    PQEntry temp = pq->heap[i];
    pq->heap[i] = pq->heap[j];
    pq->heap[j] = temp;
    
    pq->posMap[pq->heap[i].id] = i;
    pq->posMap[pq->heap[j].id] = j;
}

static void siftUp(PQueue* pq, int i) {
    while (i > 0 && shouldSwap(pq, i, PARENT(i))) {
        heapSwap(pq, i, PARENT(i));
        i = PARENT(i);
    }
}

static void siftDown(PQueue* pq, int i) {
    int extremeIndex = i;
    int l = LEFT(i);
    int r = RIGHT(i);
    
    if (l < pq->size && shouldSwap(pq, l, extremeIndex)) {
        extremeIndex = l;
    }
    if (r < pq->size && shouldSwap(pq, r, extremeIndex)) {
        extremeIndex = r;
    }
    if (i != extremeIndex) {
        heapSwap(pq, i, extremeIndex);
        siftDown(pq, extremeIndex);
    }
}

void pqInsert(PQueue* pq, int id, double priority) {
    if (pq->size == pq->capacity) {
        printf("PQ capacity full\n");
        return;
    }
    if (id < 0 || id >= pq->posMapSize) {
        printf("ID out of bounds for posMap\n");
        return;
    }
    if (pqContains(pq, id)) {
        pqUpdatePriority(pq, id, priority);
        return;
    }

    int i = pq->size++;
    pq->heap[i].id = id;
    pq->heap[i].priority = priority;
    pq->posMap[id] = i;

    siftUp(pq, i);
}

PQEntry pqPeek(const PQueue* pq) {
    if (pqIsEmpty(pq)) {
        PQEntry empty = {-1, 0.0};
        return empty;
    }
    return pq->heap[0];
}

PQEntry pqExtract(PQueue* pq) {
    if (pqIsEmpty(pq)) {
        PQEntry empty = {-1, 0.0};
        return empty;
    }
    if (pq->size == 1) {
        pq->size--;
        pq->posMap[pq->heap[0].id] = -1;
        return pq->heap[0];
    }
    
    PQEntry root = pq->heap[0];
    pq->posMap[root.id] = -1;
    
    pq->heap[0] = pq->heap[pq->size - 1];
    pq->posMap[pq->heap[0].id] = 0;
    pq->size--;
    
    siftDown(pq, 0);
    return root;
}

void pqUpdatePriority(PQueue* pq, int id, double newPriority) {
    if (!pqContains(pq, id)) return;
    
    int i = pq->posMap[id];
    double oldPriority = pq->heap[i].priority;
    pq->heap[i].priority = newPriority;
    
    if (pq->isMinHeap) {
        if (newPriority < oldPriority) {
            siftUp(pq, i);
        } else {
            siftDown(pq, i);
        }
    } else {
        if (newPriority > oldPriority) {
            siftUp(pq, i);
        } else {
            siftDown(pq, i);
        }
    }
}

void pqFree(PQueue* pq) {
    if (!pq) return;
    free(pq->heap);
    free(pq->posMap);
    free(pq);
}

#ifdef TEST_PQUEUE
int main() {
    printf("Testing Max-Heap (Adaptive)...\n");
    PQueue* maxPq = pqCreate(10, 100, 0);
    pqInsert(maxPq, 1, 90.0);
    pqInsert(maxPq, 3, 75.0);
    pqInsert(maxPq, 8, 20.0);
    pqInsert(maxPq, 5, 60.0);
    
    printf("Extracted: %d (expected 1)\n", pqExtract(maxPq).id);
    
    // Adaptive update
    printf("Updating ID 8 priority from 20 to 95...\n");
    pqUpdatePriority(maxPq, 8, 95.0);
    printf("Extracted: %d (expected 8)\n", pqExtract(maxPq).id);
    
    pqFree(maxPq);
    
    printf("\nTesting Min-Heap...\n");
    PQueue* minPq = pqCreate(10, 100, 1);
    pqInsert(minPq, 1, 90.0);
    pqInsert(minPq, 3, 75.0);
    pqInsert(minPq, 8, 20.0);
    pqInsert(minPq, 5, 60.0);
    
    printf("Extracted: %d (expected 8)\n", pqExtract(minPq).id);
    printf("Extracted: %d (expected 5)\n", pqExtract(minPq).id);
    
    pqFree(minPq);
    
    printf("\nPriority Queue tests passed.\n");
    return 0;
}
#endif
