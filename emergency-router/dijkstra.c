#include "dijkstra.h"
#include "pqueue.h"
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

DijkstraResult* dijkstra(const Graph* g, int source) {
    int n = g->numNodes;
    DijkstraResult* res = (DijkstraResult*)malloc(sizeof(DijkstraResult));
    res->numNodes = n;
    res->dist = (int*)malloc(n * sizeof(int));
    res->prev = (int*)malloc(n * sizeof(int));

    for (int i = 0; i < n; i++) {
        res->dist[i] = INT_MAX;
        res->prev[i] = -1;
    }

    res->dist[source] = 0;
    
    // capacity n, posMap size n, isMinHeap = 1
    PQueue* pq = pqCreate(n, n, 1);
    
    // Initialize PQ with all nodes
    for (int i = 0; i < n; i++) {
        pqInsert(pq, i, res->dist[i]);
    }

    while (!pqIsEmpty(pq)) {
        PQEntry minNode = pqExtract(pq);
        int u = minNode.id;
        
        // If dist is INT_MAX, we can't reach any more nodes
        if (res->dist[u] == INT_MAX) {
            break;
        }
        
        AdjNode* temp = g->adjLists[u];
        while (temp) {
            int v = temp->dest;
            int weight = temp->weight;
            
            if (res->dist[u] + weight < res->dist[v]) {
                res->dist[v] = res->dist[u] + weight;
                res->prev[v] = u;
                // Decrease priority (distance) in the min-heap
                pqUpdatePriority(pq, v, res->dist[v]);
            }
            temp = temp->next;
        }
    }
    
    pqFree(pq);
    return res;
}

void printPath(const DijkstraResult* res, int dest) {
    if (res->prev[dest] != -1) {
        printPath(res, res->prev[dest]);
    }
    printf("%d ", dest);
}

void freeDijkstraResult(DijkstraResult* res) {
    if (!res) return;
    free(res->dist);
    free(res->prev);
    free(res);
}

#ifdef TEST_DIJKSTRA
int main() {
    // Recreate the 7-node example
    Graph* g = createGraph(7);
    addEdge(g, 0, 1, 4);
    addEdge(g, 0, 2, 2);
    addEdge(g, 1, 3, 5);
    addEdge(g, 2, 1, 1);
    addEdge(g, 2, 3, 8);
    addEdge(g, 2, 4, 10);
    addEdge(g, 3, 4, 2);
    addEdge(g, 3, 5, 6);
    addEdge(g, 4, 5, 3);
    addEdge(g, 4, 6, 1);
    addEdge(g, 6, 5, 4);

    DijkstraResult* res = dijkstra(g, 0); // Source = 0
    
    printf("Shortest distances from node 0:\n");
    for (int i = 0; i < g->numNodes; i++) {
        printf("Node %d: dist %d, path: ", i, res->dist[i]);
        printPath(res, i);
        printf("\n");
    }
    
    freeDijkstraResult(res);
    freeGraph(g);
    
    printf("\nDijkstra tests passed.\n");
    return 0;
}
#endif
