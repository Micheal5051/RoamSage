
import json
import hashlib
import re
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "knowledge_data.json"
DB_DIR = BASE_DIR / "chroma_db"

COLLECTION_NAME = "travel_explorer_knowledge"
BATCH_SIZE = 50

embedding_function = DefaultEmbeddingFunction()


def load_knowledge():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Knowledge file not found: {DATA_FILE}")

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        records = json.load(file)

    if not isinstance(records, list):
        raise ValueError("knowledge_data.json must contain a list.")

    return records


def make_record_id(record):
    record_type = record.get("ragType", "unknown")

    original_id = record.get("id") or record.get("name")

    if not original_id:
        raise ValueError(f"Record has no id or name: {record}")

    slug = re.sub(
        r"[^a-zA-Z0-9]+",
        "_",
        str(original_id).lower()
    ).strip("_")

    return f"{record_type}_{slug}"


def extract_text(record):
    excluded_fields = {
        "id",
        "image",
        "gallery",
        "latitude",
        "longitude",
        "location",
        "sourceFile",
        "ragType"
    }

    parts = []

    def process(value, field_name=""):
        if isinstance(value, dict):
            for key, item in value.items():
                if key not in excluded_fields:
                    process(item, key)

        elif isinstance(value, list):
            for item in value:
                process(item, field_name)

        elif value is not None:
            text = str(value).strip()

            if text:
                if field_name:
                    parts.append(f"{field_name}: {text}")
                else:
                    parts.append(text)

    process(record)

    return "\n".join(parts)


def prepare_record(record):
    record_id = make_record_id(record)
    document = extract_text(record)

    if not document.strip():
        raise ValueError(f"Empty document for record: {record_id}")

    record_json = json.dumps(
        record,
        ensure_ascii=False
    )

    content_hash = hashlib.sha256(
        record_json.encode("utf-8")
    ).hexdigest()

    metadata = {
        "name": str(record.get("name", "Unknown")),
        "ragType": str(record.get("ragType", "unknown")),
        "destination": str(
            record.get("destination")
            or record.get("name", "Unknown")
        ),
        "sourceFile": str(record.get("sourceFile", "unknown")),
        "record_json": record_json,
        "content_hash": content_hash
    }

    if record.get("category") is not None:
        metadata["category"] = str(record["category"])

    return record_id, document, metadata


def get_collection():
    client = chromadb.PersistentClient(
        path=str(DB_DIR)
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_function,
        metadata={"hnsw:space": "cosine"}
    )

    return collection


def build_vector_store():
    print("Loading Travel Explorer knowledge data...")

    records = load_knowledge()

    print(f"Loaded {len(records)} records.")

    collection = get_collection()

    prepared_records = [
        prepare_record(record)
        for record in records
    ]

    current_ids = {
        record_id
        for record_id, _, _ in prepared_records
    }

    if len(current_ids) != len(prepared_records):
        raise ValueError(
            "Duplicate record IDs detected. "
            "Please check knowledge_data.json."
        )

    existing = collection.get(
        include=["metadatas"]
    )

    existing_metadata = dict(
        zip(
            existing["ids"],
            existing["metadatas"] or []
        )
    )

    existing_ids = set(existing["ids"])

    # Remove records that no longer exist in the JSON file.
    stale_ids = existing_ids - current_ids

    if stale_ids:
        collection.delete(ids=list(stale_ids))
        print(f"Removed stale records: {len(stale_ids)}")

    # Only embed new or modified records.
    records_to_update = []

    for record_id, document, metadata in prepared_records:
        old_metadata = existing_metadata.get(record_id)

        if (
            old_metadata is None
            or old_metadata.get("content_hash")
            != metadata["content_hash"]
        ):
            records_to_update.append(
                (record_id, document, metadata)
            )

    print(f"New or changed records: {len(records_to_update)}")

    for start in range(0, len(records_to_update), BATCH_SIZE):
        batch = records_to_update[
            start:start + BATCH_SIZE
        ]

        collection.upsert(
            ids=[item[0] for item in batch],
            documents=[item[1] for item in batch],
            metadatas=[item[2] for item in batch]
        )

        print(
            f"Indexed {min(start + BATCH_SIZE, len(records_to_update))}"
            f"/{len(records_to_update)}"
        )

    print("\nVector database build completed!")
    print("Collection:", COLLECTION_NAME)
    print("Total records:", collection.count())
    print("Database location:", DB_DIR)

    return collection


def search_knowledge(
    query,
    top_k=5,
    destination=None,
    rag_type=None
):
    collection = get_collection()

    total_records = collection.count()

    if total_records == 0:
        return []

    filters = []

    if destination:
        filters.append({
            "destination": {
                "$eq": destination
            }
        })

    if rag_type:
        filters.append({
            "ragType": {
                "$eq": rag_type
            }
        })

    where = None

    if len(filters) == 1:
        where = filters[0]

    elif len(filters) > 1:
        where = {
            "$and": filters
        }

    results = collection.query(
        query_texts=[query],
        n_results=min(top_k, total_records),
        where=where,
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    matches = []

    for i, metadata in enumerate(results["metadatas"][0]):
        original_record = json.loads(
            metadata["record_json"]
        )

        matches.append({
            "record": original_record,
            "document": results["documents"][0][i],
            "distance": results["distances"][0][i]
        })

    return matches


if __name__ == "__main__":
    build_vector_store()
