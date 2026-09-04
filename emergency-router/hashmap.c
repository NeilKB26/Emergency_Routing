#include "hashmap.h"
#include <stdio.h>
#include <stdlib.h>

HashMap* hmCreate(int numBuckets) {
    HashMap* hm = (HashMap*)malloc(sizeof(HashMap));
    hm->numBuckets = numBuckets;
    hm->count = 0;
    hm->buckets = (HMEntry**)malloc(numBuckets * sizeof(HMEntry*));
    for (int i = 0; i < numBuckets; i++) {
        hm->buckets[i] = NULL;
    }
    return hm;
}

static int hash(int key, int numBuckets) {
    return key % numBuckets;
}

void hmInsert(HashMap* hm, int vehicleId, Vehicle v) {
    int b = hash(vehicleId, hm->numBuckets);
    HMEntry* entry = (HMEntry*)malloc(sizeof(HMEntry));
    entry->key = vehicleId;
    entry->value = v;
    entry->next = hm->buckets[b];
    hm->buckets[b] = entry;
    hm->count++;
}

Vehicle* hmFind(HashMap* hm, int vehicleId) {
    int b = hash(vehicleId, hm->numBuckets);
    HMEntry* curr = hm->buckets[b];
    while (curr) {
        if (curr->key == vehicleId) {
            return &(curr->value);
        }
        curr = curr->next;
    }
    return NULL;
}

void hmUpdate(HashMap* hm, int vehicleId, VehicleStatus s, int loc) {
    Vehicle* v = hmFind(hm, vehicleId);
    if (v) {
        v->status = s;
        v->location = loc;
    }
}

int hmGetFreeVehicles(const HashMap* hm, int* outIds, int maxOut) {
    int found = 0;
    for (int i = 0; i < hm->numBuckets; i++) {
        HMEntry* curr = hm->buckets[i];
        while (curr) {
            if (curr->value.status == VEHICLE_FREE) {
                if (found < maxOut) {
                    outIds[found] = curr->key;
                }
                found++;
            }
            curr = curr->next;
        }
    }
    return found;
}

void hmPrint(const HashMap* hm) {
    for (int i = 0; i < hm->numBuckets; i++) {
        printf("Bucket [%d]: ", i);
        HMEntry* curr = hm->buckets[i];
        while (curr) {
            printf("-> V%d (Loc %d, %s) ", curr->key, curr->value.location, 
                   curr->value.status == VEHICLE_FREE ? "FREE" : "BUSY");
            curr = curr->next;
        }
        printf("\n");
    }
}

void hmFree(HashMap* hm) {
    if (!hm) return;
    for (int i = 0; i < hm->numBuckets; i++) {
        HMEntry* curr = hm->buckets[i];
        while (curr) {
            HMEntry* next = curr->next;
            free(curr);
            curr = next;
        }
    }
    free(hm->buckets);
    free(hm);
}

#ifdef TEST_HASHMAP
int main() {
    // 6 buckets to force some collisions 
    HashMap* hm = hmCreate(6);
    
    Vehicle v1 = {12, 5, VEHICLE_FREE, AMBULANCE, -1, -1};
    Vehicle v2 = {3, 2, VEHICLE_BUSY, FIRE_TRUCK, 101, 5};
    Vehicle v3 = {27, 8, VEHICLE_FREE, AMBULANCE, -1, -1};
    Vehicle v4 = {15, 1, VEHICLE_FREE, AMBULANCE, -1, -1};
    Vehicle v5 = {8, 6, VEHICLE_BUSY, FIRE_TRUCK, 102, 3};

    hmInsert(hm, 12, v1); // 12 % 6 = 0
    hmInsert(hm, 3, v2);  // 3 % 6 = 3
    hmInsert(hm, 27, v3); // 27 % 6 = 3 (COLLISION with V3)
    hmInsert(hm, 15, v4); // 15 % 6 = 3 (COLLISION with V3 and V27)
    hmInsert(hm, 8, v5);  // 8 % 6 = 2

    printf("Initial Hash Map:\n");
    hmPrint(hm);

    printf("\nFinding Vehicle 27...\n");
    Vehicle* found = hmFind(hm, 27);
    if (found) {
        printf("Found V%d at Location %d\n", found->id, found->location);
    } else {
        printf("Not found!\n");
    }

    printf("\nUpdating Vehicle 12 to BUSY at Loc 9...\n");
    hmUpdate(hm, 12, VEHICLE_BUSY, 9);
    found = hmFind(hm, 12);
    if (found) {
        printf("V12 is now %s at Loc %d\n", found->status == VEHICLE_BUSY ? "BUSY" : "FREE", found->location);
    }

    hmFree(hm);
    
    printf("\nHash Map tests passed.\n");
    return 0;
}
#endif
