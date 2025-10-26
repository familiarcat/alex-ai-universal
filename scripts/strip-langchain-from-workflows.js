#!/usr/bin/env node
/*
 * Strip all LangChain nodes from n8n workflow JSONs and replace with n8n built-ins:
 * - @n8n/n8n-nodes-langchain.textSplitter -> Function chunker
 * - @n8n/n8n-nodes-langchain.embeddingsOpenAI -> n8n-nodes-base.openAi (embeddings.create) + Set node to map data[0].embedding
 */
const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  'n8n-workflows',
  'exported-workflows',
  'local-n8n/files/exported-workflows'
];

function transform(workflow) {
  let changed = false;
  const nodes = workflow.nodes || [];
  // Map of old node id/name to new node ids for connections rewrite
  const idByName = new Map(nodes.map(n => [n.name, n.id]));

  // Replace TextSplitter
  for (const node of nodes) {
    if (node.type === '@n8n/n8n-nodes-langchain.textSplitter') {
      node.type = 'n8n-nodes-base.function';
      node.typeVersion = 2;
      const chunkSize = node.parameters?.chunkSize || 1000;
      const overlap = node.parameters?.chunkOverlap || 200;
      node.parameters = {
        functionCode: `const text = $json.content || '';\nconst chunkSize = ${chunkSize};\nconst overlap = ${overlap};\nconst results = [];\nfor (let i = 0; i < text.length; i += chunkSize - overlap) {\n  const chunk = text.slice(i, i + chunkSize);\n  results.push({ json: { ...$json, chunk, chunk_index: results.length }});\n}\nreturn results;`
      };
      changed = true;
    }
  }

  // Replace embeddingsOpenAI -> openAi embeddings + Set mapper inserted after
  const newNodes = [];
  for (const node of nodes) {
    newNodes.push(node);
    if (node.type === '@n8n/n8n-nodes-langchain.embeddingsOpenAI') {
      const model = node.parameters?.model || 'text-embedding-3-small';
      node.type = 'n8n-nodes-base.openAi';
      node.typeVersion = 4;
      node.parameters = {
        resource: 'embeddings',
        operation: 'create',
        model,
        input: '={{ $json.chunk }}'
      };
      // Insert Set node right after to map embedding
      const setId = `${node.id}-extract-embedding`;
      const setNode = {
        parameters: {
          assignments: { assignments: [ { id: 'embedding', name: 'embedding', value: '={{ $json.data[0].embedding }}', type: 'array' } ] }
        },
        id: setId,
        name: 'Extract Embedding',
        type: 'n8n-nodes-base.set',
        typeVersion: 3,
        position: [ (node.position?.[0] || 1000) + 200, node.position?.[1] || 300 ]
      };
      newNodes.push(setNode);
      // Rewire connections from this node to come from setNode instead
      const conns = workflow.connections || {};
      const name = node.name;
      const flows = conns[name]?.main || [];
      if (flows.length) {
        conns['Extract Embedding'] = { main: flows };
        conns[name] = { main: [ [ { node: 'Extract Embedding', type: 'main', index: 0 } ] ] };
      }
      workflow.connections = conns;
      changed = true;
    }
  }
  workflow.nodes = newNodes;
  return { workflow, changed };
}

function processDir(dir) {
  const abs = path.join(process.cwd(), dir);
  if (!fs.existsSync(abs)) return { changed: 0, scanned: 0 };
  const files = fs.readdirSync(abs).filter(f => f.endsWith('.json'));
  let changed = 0;
  for (const f of files) {
    const full = path.join(abs, f);
    try {
      const json = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (!JSON.stringify(json).includes('@n8n/n8n-nodes-langchain')) continue;
      const { workflow, changed: did } = transform(json);
      if (did) {
        fs.writeFileSync(full, JSON.stringify(workflow, null, 2));
        console.log(`✅ Cleaned: ${path.join(dir, f)}`);
        changed++;
      }
    } catch (e) {
      console.error(`❌ ${full}: ${e.message}`);
    }
  }
  return { changed, scanned: files.length };
}

function main() {
  let totalChanged = 0, totalScanned = 0;
  for (const d of TARGET_DIRS) {
    const { changed, scanned } = processDir(d);
    totalChanged += changed;
    totalScanned += scanned;
  }
  console.log(`\n📊 LangChain removal complete. Scanned: ${totalScanned}, Cleaned: ${totalChanged}`);
}

main();


