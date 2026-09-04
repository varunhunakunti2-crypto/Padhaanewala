\echo '1. CONFIRM EXTENSION IS ACTIVE'
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

\echo '2. CONFIRM VECTOR TYPE WORKS'
SELECT '[1,2,3]'::vector;

\echo '3. CONFIRM document_embeddings TABLE EXISTS WITH CORRECT SHAPE'
\d document_embeddings

\echo '4. CONFIRM VECTOR INDEX EXISTS AND IS THE RIGHT TYPE'
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'document_embeddings';

\echo '6. CONFIRM SEED DATA LOADED'
SELECT count(*), embedding_model FROM document_embeddings GROUP BY embedding_model;
SELECT source_table, source_id, chunk_index FROM document_embeddings LIMIT 5;

\echo '7. CONFIRM SIMILARITY SEARCH WORKS (EXPLAIN ANALYZE)'
EXPLAIN ANALYZE
SELECT id FROM document_embeddings ORDER BY embedding <-> (SELECT array_fill(0.1, ARRAY[1536])::vector) LIMIT 5;
