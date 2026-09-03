#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include "graph.h"

typedef struct {
    int* dist;     // dist[v] = shortest distance from source to v
    int* prev;     // prev[v] = predecessor of v on shortest path (-1 if none)
    int numNodes;
} DijkstraResult;

DijkstraResult* dijkstra(const Graph* g, int source);
void printPath(const DijkstraResult* res, int dest);
void freeDijkstraResult(DijkstraResult* res);

#endif
