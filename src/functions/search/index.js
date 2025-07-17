class TrieNode {
    constructor() {
      this.children = {}; // Key: character, Value: TrieNode
      this.isEndOfWord = false;
      this.insertCount = 0; // New property to track insertion attempts
    }
  }
  
  class Trie {
    constructor() {
      this.root = new TrieNode();
      this.totalInsertAttempts = 0; // Track total insertion attempts
    }
  
    // Insert a word into the trie and count attempts
    async insert(word) {
      this.totalInsertAttempts++;
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
      node.insertCount++; // Increment count for this specific word
      return this.toJSON()
    }
  
    // Get the insertion attempt count for a specific word
    getInsertCount(word) {
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) {
          return 0; // Word doesn't exist, so count is 0
        }
        node = node.children[char];
      }
      return node.isEndOfWord ? node.insertCount : 0;
    }
  
    // Get total insertion attempts across all words
    getTotalInsertAttempts() {
      return this.totalInsertAttempts;
    }
  
    // (Keep all other existing methods: search, startsWith, getWordsWithPrefix, etc.)
  
    // Update toJSON to include the new counts
    toJSON() {
      return JSON.stringify({
        root: this.root,
        totalInsertAttempts: this.totalInsertAttempts
      }, (key, value) => {
        if (key === 'children') {
          return value;
        }
        return value;
      }, 2);
    }
  
    // Update fromJSON to handle the new counts
    static fromJSON(jsonString) {
      const data = JSON.parse(jsonString);
      const trie = new Trie();
      
      // Rebuild the trie structure (similar to previous implementation)
      const rebuild = (nodeData, parentNode) => {
        for (const [char, childData] of Object.entries(nodeData.children)) {
          const childNode = new TrieNode();
          childNode.isEndOfWord = childData.isEndOfWord;
          childNode.insertCount = childData.insertCount || 0;
          parentNode.children[char] = childNode;
          rebuild(childData, childNode);
        }
      };
      
      trie.root = data.root ? data.root : new TrieNode();
      trie.totalInsertAttempts = data.totalInsertAttempts || 0;
      rebuild(trie.root, trie.root);
      return trie;
    }
    
     // Returns words with given prefix sorted by insertCount (descending)
    getWordsByInsertCount(prefix, order='asc') {
      let node = this.root;
      const results = [];
      
      // Traverse to the end of the prefix
      for (const char of prefix) {
        if (!node.children[char]) {
          return []; // Prefix doesn't exist
        }
        node = node.children[char];
      }
      
      // Perform DFS to collect all words with this prefix
      const dfs = (currentNode, currentSuffix) => {
        if (currentNode.isEndOfWord) {
          results.push({
            word: prefix + currentSuffix,
            count: currentNode.insertCount
          });
        }
        
        for (const [char, childNode] of Object.entries(currentNode.children)) {
          dfs(childNode, currentSuffix + char);
        }
      };
      
      dfs(node, "");
      
      // Sort by insertCount (descending) and then alphabetically (ascending)
      return results.sort((a, b) => {
        if(order === 'asc'){
            if (b.count !== a.count) {
              return b.count - a.count; // Higher counts first
            }
        }else{
            if (b.count !== a.count) {
                return a.count - b.count; // Lower counts first
              }
        }
        return a.word.localeCompare(b.word); // Alphabetical if counts equal
      }).map(item => item.word); // Return just the words
    }
  
  }
  
  // Example usage:
//   const trie = new Trie();
//   trie.insert("apple");
//   trie.insert("apple");
//   trie.insert("banana");
//   trie.insert("apple");
  
//   trie.insert("apple");
//   trie.insert("apple");
//   trie.insert("apple"); // 3x
//   trie.insert("app");
//   trie.insert("app");   // 2x
//   trie.insert("banana");
//   trie.insert("banana"); // 2x
//   trie.insert("application"); // 1x
  
//   console.log("Insert count for 'apple':", trie.getInsertCount("apple")); // 3
//   console.log("Insert count for 'banana':", trie.getInsertCount("banana")); // 1
//   console.log("Insert count for 'orange':", trie.getInsertCount("orange")); // 0
//   console.log("Total insert attempts:", trie.getTotalInsertAttempts()); // 4
  
//   // Serialization/deserialization maintains the counts
//   const json = trie.toJSON();
//   const newTrie = Trie.fromJSON(json);
//   console.log("After deserialization - insert count for 'apple':", 
//     newTrie.getInsertCount("apple")); // 3
  
//   console.log("Words prefixed with 'app' sorted by frequency:");
//   console.log(trie.getWordsByInsertCount("app"));
//   // Output: ["apple", "app", "application"] 
//   // (apple:3, app:2, application:1)
  
//   console.log("Words prefixed with 'b' sorted by frequency:");
//   console.log(trie.getWordsByInsertCount("b"));

export { Trie}