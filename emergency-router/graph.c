#include "graph.h"
#include <stdio.h>
#include <stdlib.h>

Graph* createGraph(int numNodes) {
    Graph* g = (Graph*)malloc(sizeof(Graph));
    g->numNodes = numNodes;
    g->adjLists = (AdjNode**)malloc(numNodes * sizeof(AdjNode*));
    for (int i = 0; i < numNodes; i++) {
        g->adjLists[i] = NULL;
    }
    return g;
}

static AdjNode* createNode(int dest, int weight) {
    AdjNode* newNode = (AdjNode*)malloc(sizeof(AdjNode));
    newNode->dest = dest;
    newNode->weight = weight;
    newNode->next = NULL;
    return newNode;
}

void addEdge(Graph* g, int src, int dest, int weight) {
    // Add edge from src to dest
    AdjNode* newNode = createNode(dest, weight);
    newNode->next = g->adjLists[src];
    g->adjLists[src] = newNode;

    // Add edge from dest to src (undirected)
    newNode = createNode(src, weight);
    newNode->next = g->adjLists[dest];
    g->adjLists[dest] = newNode;
}

void printGraph(const Graph* g) {
    for (int v = 0; v < g->numNodes; v++) {
        AdjNode* temp = g->adjLists[v];
        printf("Node %d: ", v);
        while (temp) {
            printf("-> [%d, %d] ", temp->dest, temp->weight);
            temp = temp->next;
        }
        printf("\n");
    }
}

void freeGraph(Graph* g) {
    if (!g) return;
    for (int i = 0; i < g->numNodes; i++) {
        AdjNode* temp = g->adjLists[i];
        while (temp) {
            AdjNode* next = temp->next;
            free(temp);
            temp = next;
        }
    }
    free(g->adjLists);
    free(g);
}

#ifdef TEST_GRAPH
int main() {
    // Test based on the 7-node example (A=0, B=1, C=2, D=3, E=4, F=5, G=6)
    Graph* g = createGraph(7);
    addEdge(g, 0, 1, 4); // A-B
    addEdge(g, 0, 2, 2); // A-C
    addEdge(g, 1, 3, 5); // B-D
    addEdge(g, 2, 1, 1); // C-B
    addEdge(g, 2, 3, 8); // C-D
    addEdge(g, 2, 4, 10);// C-E
    addEdge(g, 3, 4, 2); // D-E
    addEdge(g, 3, 5, 6); // D-F
    addEdge(g, 4, 5, 3); // E-F
    addEdge(g, 4, 6, 1); // E-G
    addEdge(g, 6, 5, 4); // G-F

    printf("Adjacency List of the Graph:\n");
    printGraph(g);
    freeGraph(g);
    
    printf("\nGraph test passed (visual verification required).\n");
    return 0;
}
#endif
