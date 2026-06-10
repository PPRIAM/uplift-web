import os
import sys
import json
import argparse

INDEX_PATH = r"d:\SkillsLib\.agent\skills\better-ui\resources\index.json"
WORKSPACE_DIR = r"d:\SkillsLib"

def main():
    parser = argparse.ArgumentParser(description="Query the premium Uiverse Galaxy offline UI component library.")
    parser.add_argument("--query", "-q", type=str, default="", help="Keywords to search in component tags, names, or creators.")
    parser.add_argument("--category", "-c", type=str, default="", help="Category folder filter (e.g., Buttons, Cards, loaders, Inputs, Toggle-switches).")
    parser.add_argument("--type", "-t", type=str, choices=["css", "tailwind"], help="Style type filter (Vanilla CSS vs Tailwind CSS).")
    parser.add_argument("--author", "-a", type=str, default="", help="Filter by component author/creator name.")
    parser.add_argument("--limit", "-l", type=int, default=15, help="Maximum number of results to display (default: 15).")
    
    args = parser.parse_args()
    
    if not os.path.exists(INDEX_PATH):
        print(f"Error: Component index not found at {INDEX_PATH}.")
        print("Please build the index first by running: python index_galaxy.py")
        sys.exit(1)
        
    try:
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            components = json.load(f)
    except Exception as e:
        print(f"Error loading index: {e}")
        sys.exit(1)
        
    # Perform filtering
    results = []
    query_words = [w.lower() for w in args.query.split()]
    
    for c in components:
        # 1. Category filter
        if args.category and args.category.lower() not in c["category"].lower():
            continue
            
        # 2. Style type filter
        if args.type:
            is_tw = "tailwind" in c["style_type"].lower()
            if args.type == "tailwind" and not is_tw:
                continue
            if args.type == "css" and is_tw:
                continue
                
        # 3. Author filter
        if args.author and args.author.lower() not in c["author"].lower():
            continue
            
        # 4. Search query keywords matching
        if query_words:
            filename_lower = c["filename"].lower()
            author_lower = c["author"].lower()
            tags_lower = [t.lower() for t in c["tags"]]
            category_lower = c["category"].lower()
            
            # Count matching keywords
            match_count = 0
            for word in query_words:
                if (word in filename_lower or 
                    word in author_lower or 
                    word in category_lower or 
                    any(word in t for t in tags_lower)):
                    match_count += 1
            
            if match_count == 0:
                continue
                
            # Store relevance score
            c["_score"] = match_count
        else:
            c["_score"] = 0
            
        results.append(c)
        
    # Sort results: highly relevant first, then smaller files first (smaller are easier to integrate)
    if query_words:
        results.sort(key=lambda x: (-x["_score"], x["size_bytes"]))
    else:
        results.sort(key=lambda x: x["size_bytes"])
        
    total_found = len(results)
    displayed_results = results[:args.limit]
    
    # Print beautiful tabular output
    if not displayed_results:
        print("\n=== No UI Components Found matching your criteria ===")
        print("Try using a broader query or removing filters.")
        return
        
    print(f"\nFound {total_found} premium UI components. Displaying top {len(displayed_results)}:\n")
    print(f"{'#':<3} | {'Category':<15} | {'Author':<18} | {'Style':<12} | {'Component Name / Path'}")
    print("-" * 100)
    
    for idx, c in enumerate(displayed_results, 1):
        clean_name = c["filename"].replace(".html", "")
        # Shorten author if too long
        author = c["author"]
        if len(author) > 18:
            author = author[:15] + "..."
            
        print(f"{idx:<3} | {c['category']:<15} | {author:<18} | {c['style_type']:<12} | {c['path']}")
        if c["tags"]:
            # Display truncated list of tags
            tags_str = ", ".join(c["tags"][:6])
            if len(c["tags"]) > 6:
                tags_str += "..."
            print(f"    Tags: {tags_str}")
            
    print("-" * 100)
    print("\n[INFO] Actionable next step:")
    print("To view and use a component's code, copy its absolute path:")
    print("Example: view_file on absolute path: d:\\SkillsLib\\[path]")
    print(f"Total library size: {len(components)} offline components.")

if __name__ == "__main__":
    main()
