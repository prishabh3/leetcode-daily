// Find the common characters between the first and last string
        for (int i = 0; i < min(first.size(), last.size()); i++) {
            if (first[i] == last[i]) {
                result += first[i];
            } else {
                break;
            }
        }
        
        return result;
    }
};