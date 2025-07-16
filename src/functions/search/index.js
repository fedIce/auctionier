class TrieNode {
    constructor() {
      this.children = {}; // Key: character, Value: TrieNode
      this.isEndOfWord = false;
    }
  }
  
  class Trie {
    constructor() {
      this.root = new TrieNode();
    }
  
    // Insert a word into the trie
    async insert(word) {
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
      return this.toJSON()
    }
  
    // Search for a complete word in the trie
    search(word) {
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) {
          return false;
        }
        node = node.children[char];
      }
      return node.isEndOfWord;
    }
  
    // Check if any word in the trie starts with the given prefix
    startsWith(prefix) {
      let node = this.root;
      for (const char of prefix) {
        if (!node.children[char]) {
          return false;
        }
        node = node.children[char];
      }
      return true;
    }
  
    // Get all words that start with the given prefix
    getWordsWithPrefix(prefix) {
      let node = this.root;
      const words = [];
      
      // Traverse to the end of the prefix
      for (const char of prefix) {
        if (!node.children[char]) {
          return words; // Return empty array if prefix doesn't exist
        }
        node = node.children[char];
      }
      
      // Helper function to perform DFS from current node
      const dfs = (currentNode, currentWord) => {
        if (currentNode.isEndOfWord) {
          words.push(prefix + currentWord);
        }
        
        for (const [char, childNode] of Object.entries(currentNode.children)) {
          dfs(childNode, currentWord + char);
        }
      };
      
      dfs(node, "");
      return words;
    }
  
    // Serialize the trie to a JSON string
    toJSON() {
      return JSON.stringify(this.root, (key, value) => {
        if (key === 'children') {
          return value;
        }
        return value;
      }, 2);
    }
  
    // Deserialize a JSON string to rebuild the trie
    static fromJSON(jsonString) {
        // Validate input
        if (typeof jsonString !== 'string') {
          throw new Error('Input must be a JSON string');
        }
      
        let parsedData;
        try {
          parsedData = JSON.parse(jsonString);
        } catch (e) {
          throw new Error('Invalid JSON string provided');
        }
      
        // Validate the parsed data structure
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error('Invalid trie data structure');
        }
      
        const trie = new Trie();
      
        // Recursive function to rebuild the trie structure
        const rebuild = (nodeData, parentNode) => {
          if (!nodeData.children || typeof nodeData.children !== 'object') {
            return;
          }
      
          for (const [char, childData] of Object.entries(nodeData.children)) {
            if (typeof char !== 'string' || char.length !== 1) {
              continue; // Skip invalid keys
            }
      
            const childNode = new TrieNode();
            childNode.isEndOfWord = !!childData.isEndOfWord; // Ensure boolean
            
            if (childData.children && typeof childData.children === 'object') {
              parentNode.children[char] = childNode;
              rebuild(childData, childNode);
            } else {
              // Handle leaf nodes
              childNode.children = {};
              parentNode.children[char] = childNode;
            }
          }
        };
      
        // Initialize root properties
        trie.root.isEndOfWord = !!parsedData.isEndOfWord;
        trie.root.children = {};
      
        // Start rebuilding from the root
        rebuild(parsedData, trie.root);
        return trie;
      }
  }
  
//   // Example usage:
  
//   trie.insert("apple");
//   trie.insert("app");
//   trie.insert("application");
//   trie.insert("banana");
//   trie.insert("appetizer");
//   trie.insert("apparatus");
//   trie.insert("banjo");
  
//   console.log("Words with prefix 'app':", trie.getWordsWithPrefix("apple"));
//   // Output: ["app", "apple", "appetizer", "apparatus", "application"]
  
//   console.log("Words with prefix 'ban':", trie.getWordsWithPrefix("ban"));
//   // Output: ["banana", "banjo"]
  
//   console.log("Words with prefix 'x':", trie.getWordsWithPrefix("x"));
//   // Output: [] (empty array)

export { Trie}