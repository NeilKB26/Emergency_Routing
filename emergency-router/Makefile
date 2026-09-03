CC = gcc
CFLAGS = -Wall -Wextra -g -std=c99
OBJS = main.o graph.o dijkstra.o pqueue.o hashmap.o dispatcher.o simulate.o

all: emergency_router

emergency_router: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ -lm

%.o: %.c
	$(CC) $(CFLAGS) -c $<

clean:
	del *.o emergency_router.exe test_*.exe 2>nul

# Individual test targets
test_graph: graph.c
	$(CC) $(CFLAGS) -DTEST_GRAPH -o test_graph graph.c && test_graph

test_pqueue: pqueue.c
	$(CC) $(CFLAGS) -DTEST_PQUEUE -o test_pqueue pqueue.c -lm && test_pqueue

test_dijkstra: dijkstra.c graph.c pqueue.c
	$(CC) $(CFLAGS) -DTEST_DIJKSTRA -o test_dijkstra dijkstra.c graph.c pqueue.c -lm && test_dijkstra

test_hashmap: hashmap.c
	$(CC) $(CFLAGS) -DTEST_HASHMAP -o test_hashmap hashmap.c && test_hashmap
