import os
import re
import json

GALAXY_DIR = r"d:\SkillsLib\galaxy"
INDEX_PATH = r"d:\SkillsLib\.agent\skills\better-ui\resources\index.json"

def build_index():
    print(f"Scanning Galaxy repository in {GALAXY_DIR}...")
    
    if not os.path.exists(GALAXY_DIR):
        print(f"Error: Galaxy directory not found at {GALAXY_DIR}")
        return
        
    components = []
    
    # Standard subdirectories in galaxy
    categories = [d for d in os.listdir(GALAXY_DIR) if os.path.isdir(os.path.join(GALAXY_DIR, d)) and not d.startswith(".")]
    
    # Pattern to extract Uiverse comment block metadata
    # e.g., /* From Uiverse.io by Author - Tags: tag1, tag2 */
    uiverse_pattern = re.compile(r'From\s+Uiverse\.io\s+by\s+([^\*]+)', re.IGNORECASE)
    
    for category in categories:
        category_path = os.path.join(GALAXY_DIR, category)
        print(f"Processing category: {category}...")
        
        files = [f for f in os.listdir(category_path) if f.endswith(".html")]
        for file in files:
            file_path = os.path.join(category_path, file)
            size_bytes = os.path.getsize(file_path)
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                print(f"Failed to read {file}: {e}")
                continue
                
            # Default fallbacks
            author = file.split("_")[0] if "_" in file else "Unknown"
            tags = []
            
            # Match metadata comment
            match = uiverse_pattern.search(content)
            if match:
                raw_str = match.group(1).strip()
                if "tags:" in raw_str.lower():
                    parts = re.split(r'-\s*tags\s*:\s*', raw_str, flags=re.IGNORECASE)
                    author_val = parts[0].strip()
                    if author_val:
                        author = author_val
                    tags_str = parts[1].strip()
                    # Remove trailing comment characters if any
                    tags_str = re.sub(r'\s*\*/.*$', '', tags_str)
                    tags = [t.strip().lower() for t in tags_str.split(",") if t.strip()]
                else:
                    # Clean trailing comment mark
                    author_val = re.sub(r'\s*\*/.*$', '', raw_str).strip()
                    if author_val:
                        author = author_val
            
            # Simple heuristic for styling technology
            has_style_block = "<style" in content.lower()
            is_tailwind = "tailwind" in content.lower() or "tailwind" in tags or (not has_style_block and "class=" in content)
            style_type = "Tailwind CSS" if is_tailwind else "Vanilla CSS"
            
            components.append({
                "category": category,
                "filename": file,
                "path": os.path.relpath(file_path, r"d:\SkillsLib"), # Workspace relative path
                "author": author,
                "tags": tags,
                "style_type": style_type,
                "size_bytes": size_bytes
            })
            
    # Create output directories if they don't exist
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(components, f, indent=2, ensure_ascii=False)
        
    print(f"Index successfully built! Saved {len(components)} components to {INDEX_PATH}")

if __name__ == "__main__":
    build_index()
