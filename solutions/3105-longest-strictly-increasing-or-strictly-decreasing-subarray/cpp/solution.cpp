inc_len++;
                dec_len = 1;
            } else if (nums[i] < nums[i - 1]) {
                dec_len++;
                inc_len = 1;
            } else {
                inc_len = 1;
                dec_len = 1;
            }
            
            max_len = max({max_len, inc_len, dec_len});
        }
        
        return max_len;
    }
};