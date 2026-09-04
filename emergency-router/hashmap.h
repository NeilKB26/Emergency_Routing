#ifndef HASHMAP_H
#define HASHMAP_H

typedef enum { VEHICLE_FREE, VEHICLE_BUSY } VehicleStatus;
typedef enum { AMBULANCE, FIRE_TRUCK } VehicleType;

typedef struct Vehicle {
    int id;
    int location;          // Node index in graph
    VehicleStatus status;
    VehicleType type;
    int assignedRequest;   // -1 if free
    int eta;               // Ticks until free (-1 if free now)
} Vehicle;

typedef struct HMEntry {
    int key;               // Vehicle ID
    Vehicle value;
    struct HMEntry* next;  // Chaining
} HMEntry;

typedef struct {
    HMEntry** buckets;
    int numBuckets;
    int count;             // Number of stored entries
} HashMap;

HashMap* hmCreate(int numBuckets);
void hmInsert(HashMap* hm, int vehicleId, Vehicle v);
Vehicle* hmFind(HashMap* hm, int vehicleId);
void hmUpdate(HashMap* hm, int vehicleId, VehicleStatus s, int loc);
int hmGetFreeVehicles(const HashMap* hm, int* outIds, int maxOut);
void hmPrint(const HashMap* hm);
void hmFree(HashMap* hm);

#endif
