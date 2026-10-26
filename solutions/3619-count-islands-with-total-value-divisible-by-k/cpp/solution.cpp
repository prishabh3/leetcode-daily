}
                        }
                    }

                    // Check if the island's total value is divisible by k
                    if (islandSum % k == 0) {
                        divisibleIslandsCount++;
                    }
                }
            }
        }

        return divisibleIslandsCount;
    }
};