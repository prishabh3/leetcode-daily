int next_count = (labels[v] == labels[u]) ? count + 1 : 1;

                // Check if the state satisfies the constraint (<= k consecutive characters)
                if (next_count <= k) {
                    if (d + w < dist[v][next_count]) {
                        dist[v][next_count] = d + w;
                        pq.push({dist[v][next_count], v, next_count});
                    }
                }
            }
        }

        return -1;
    }
};