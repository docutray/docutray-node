/**
 * Example: Knowledge Bases
 *
 * Demonstrates how to manage knowledge bases, add documents,
 * perform semantic search, and trigger sync operations.
 *
 * NOTE: Running this example will consume API credits.
 *
 * Usage: npx tsx examples/knowledge-bases.ts
 */

import DocuTray from 'docutray';

const client = new DocuTray();

async function manageKnowledgeBases() {
  console.log('--- List knowledge bases ---');
  const page = await client.knowledgeBases.list({ limit: 10 });
  for (const kb of page.data) {
    console.log(`  - ${kb.name} (${kb.id}) [${kb.isActive ? 'active' : 'inactive'}]`);
  }

  console.log('\n--- Create a knowledge base ---');
  const kb = await client.knowledgeBases.create({
    name: 'Invoices KB',
    description: 'Knowledge base for invoice data',
  });
  console.log('Created:', kb.id, kb.name);

  console.log('\n--- Update the knowledge base ---');
  const updated = await client.knowledgeBases.update(kb.id, {
    description: 'Updated description for invoice data',
  });
  console.log('Updated:', updated.description);
}

async function manageDocuments(knowledgeBaseId: string) {
  const docs = client.knowledgeBases.documents(knowledgeBaseId);

  console.log('\n--- Add a document ---');
  const doc = await docs.create({
    content: { title: 'Invoice #001', amount: 250.00, vendor: 'Acme Corp' },
    metadata: { source: 'email', date: '2024-01-15' },
  });
  console.log('Created document:', doc.id);

  console.log('\n--- List documents ---');
  const page = await docs.list({ limit: 5 });
  for (const d of page.data) {
    console.log(`  - ${d.id}: ${JSON.stringify(d.content)}`);
  }

  console.log('\n--- Update document ---');
  const updatedDoc = await docs.update(doc.id, {
    content: { title: 'Invoice #001', amount: 275.00, vendor: 'Acme Corp' },
  });
  console.log('Updated:', JSON.stringify(updatedDoc.content));
}

async function searchKnowledgeBase(knowledgeBaseId: string) {
  console.log('\n--- Search knowledge base ---');
  const results = await client.knowledgeBases.search(knowledgeBaseId, {
    query: 'invoice total amount',
    limit: 5,
  });

  console.log(`Found ${results.resultsCount} result(s):`);
  for (const item of results.data) {
    console.log(`  - Score: ${item.similarity.toFixed(3)}`);
    console.log(`    Content: ${JSON.stringify(item.document.content)}`);
  }
}

async function syncKnowledgeBase(knowledgeBaseId: string) {
  console.log('\n--- Sync knowledge base ---');
  const result = await client.knowledgeBases.sync(knowledgeBaseId);
  console.log('Sync status:', result.status);
  console.log('Documents processed:', result.documentsProcessed);
}

// Uncomment the functions you want to run:
// manageKnowledgeBases();
// manageDocuments('kb_abc123');
// searchKnowledgeBase('kb_abc123');
// syncKnowledgeBase('kb_abc123');
