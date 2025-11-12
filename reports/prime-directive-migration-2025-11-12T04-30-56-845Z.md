# Prime Directive Migration Summary

- Started: 2025-11-12T04:30:51.748Z
- Finished: 2025-11-12T04:30:56.845Z
- Duration: 5.10s

## Steps
- **archive_legacy_tables**: ok
- **apply_schema**: ok
- **merge_legacy_memories**: skipped
  ```
Legacy table present but empty. Dropped archive tables.
  ```
- **vector_contract_test**: ok
  ```
🧠 Inserting test memory fragment into Supabase...
   ✔ Memory inserted with id f54f655d-d82b-443c-a127-bc86e413232b
🔍 Performing semantic similarity query...
   ✔ Retrieved 1 memories (top result similarity 1.000)
📄 Report saved to reports/supabase-vector-contract-2025-11-12T04-30-56-836Z.json
  ```
