
from app import retrieve_knowledge

test_questions = [
    "Suggest historic attractions with royal architecture in Hyderabad",
    "Where can I find a comfortable place to stay in Hyderabad?",
    "What traditional local dishes should I try in Hyderabad?"
]

for question in test_questions:

    print("\n" + "=" * 60)
    print("QUESTION:", question)

    records, destination, intent, method = retrieve_knowledge(
        question,
        history=[]
    )

    print("Destination:", destination)
    print("Intent:", intent)
    print("Retrieval method:", method)
    print("Records retrieved:", len(records))

    print("\nRetrieved records:")

    for record in records:
        print(
            record.get("name"),
            "|",
            record.get("ragType")
        )
