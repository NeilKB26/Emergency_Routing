#ifndef GRAPH_H
#define GRAPH_H

typedef struct AdjNode {
    int dest;           // Destination node index
    int weight;         // Travel time (edge weight)
    struct AdjNode* next;
} AdjNode;

typedef struct Graph {
    int numNodes;
    AdjNode** adjLists;  // Array of linked-list heads, one per node
} Graph;

Graph* createGraph(int numNodes);
void addEdge(Graph* g, int src, int dest, int weight);
void printGraph(const Graph* g);
void freeGraph(Graph* g);

#endif
