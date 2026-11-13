from vector_store import search_knowledge

results = search_knowledge(
    query="historic landmarks and royal architecture",
    top_k=5,
    destination="Hyderabad",
    rag_type="attraction"
)

print("\nSemantic Search Results:\n")

for result in results:
    print(
        result["record"].get("name"),
        "| Distance:",
        round(result["distance"], 4)
    )

print("\nTotal results:", len(results))