/**
 * n8n to Mermaid Converter
 * 
 * Converts n8n workflow JSON to Mermaid diagram format
 * 
 * Reviewed by: Commander Data (Technical) & Lt. Uhura (Integration)
 */

class N8NToMermaidConverter {
  constructor() {
    this.nodeIdMap = new Map();
    this.nodeCounter = 0;
  }

  /**
   * Convert n8n workflow to Mermaid diagram
   */
  convert(workflow) {
    if (!workflow || !workflow.nodes) {
      throw new Error('Invalid n8n workflow: missing nodes');
    }

    this.nodeIdMap.clear();
    this.nodeCounter = 0;

    // Generate Mermaid diagram
    let mermaid = 'graph TD\n';
    
    // Add nodes
    const nodes = this.processNodes(workflow.nodes);
    mermaid += nodes;

    // Add connections
    const connections = this.processConnections(workflow.connections, workflow.nodes);
    mermaid += connections;

    // Add styling
    mermaid += this.addStyling(workflow.nodes);

    return mermaid.trim();
  }

  /**
   * Process nodes and generate Mermaid node definitions
   */
  processNodes(nodes) {
    let result = '';
    
    nodes.forEach(node => {
      const mermaidId = this.getMermaidId(node);
      const nodeLabel = this.getNodeLabel(node);
      const { openShape, closeShape } = this.getNodeShape(node);
      
      result += `    ${mermaidId}${openShape}${nodeLabel}${closeShape}\n`;
    });

    return result;
  }

  /**
   * Get Mermaid-compatible ID for node
   */
  getMermaidId(node) {
    if (this.nodeIdMap.has(node.id)) {
      return this.nodeIdMap.get(node.id);
    }

    // Generate clean ID (Mermaid doesn't like special chars)
    const cleanName = node.name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 20) || `Node${this.nodeCounter++}`;
    
    const mermaidId = cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
    this.nodeIdMap.set(node.id, mermaidId);
    
    return mermaidId;
  }

  /**
   * Get node label for Mermaid (escaped and formatted)
   */
  getNodeLabel(node) {
    // Escape special characters for Mermaid
    const label = node.name
      .replace(/"/g, '&quot;')
      .replace(/\n/g, ' ')
      .trim();
    
    return label;
  }

  /**
   * Get Mermaid shape based on node type
   * Returns {openShape, closeShape} for proper syntax
   */
  getNodeShape(node) {
    const type = node.type || '';
    const label = this.getNodeLabel(node);
    
    // Trigger nodes (start) - Circle: ((("Label"))
    if (type.includes('trigger') || type.includes('webhook') || type.includes('cron')) {
      return { openShape: '((("', closeShape: '"))' };
    }
    
    // Condition/IF nodes - Diamond: {"Label"}
    if (type.includes('if') || type.includes('switch') || type.includes('condition')) {
      return { openShape: '{"', closeShape: '}"' };
    }
    
    // Error handling - Hexagon: >"Label"<
    if (type.includes('error') || type.includes('catch')) {
      return { openShape: '>"', closeShape: '"<' };
    }
    
    // Default: rectangle - ["Label"]
    return { openShape: '["', closeShape: '"]' };
  }

  /**
   * Process connections and generate Mermaid edges
   */
  processConnections(connections, nodes) {
    if (!connections) return '';
    
    let result = '\n';
    const nodeNameToId = new Map();
    
    // Create reverse map: node name -> node id -> mermaid id
    nodes.forEach(node => {
      nodeNameToId.set(node.name, node.id);
    });

    // Process each node's connections
    Object.entries(connections).forEach(([nodeName, connectionData]) => {
      const sourceNodeId = nodeNameToId.get(nodeName);
      if (!sourceNodeId) return;

      const sourceMermaidId = this.nodeIdMap.get(sourceNodeId);
      if (!sourceMermaidId) return;

      // Process main connections
      if (connectionData.main) {
        connectionData.main.forEach((outputArray, outputIndex) => {
          outputArray.forEach(connection => {
            const targetNodeId = nodeNameToId.get(connection.node);
            if (!targetNodeId) return;

            const targetMermaidId = this.nodeIdMap.get(targetNodeId);
            if (!targetMermaidId) return;

            // Determine edge style
            let edge = ' --> ';
            
            // Check if this is a conditional branch
            if (connection.type === 'main' && outputArray.length > 1) {
              // Multiple outputs = conditional
              const condition = this.getConditionLabel(nodeName, outputIndex);
              edge = ` -->|${condition}| `;
            }

            result += `    ${sourceMermaidId}${edge}${targetMermaidId}\n`;
          });
        });
      }

      // Process error connections
      if (connectionData.error) {
        connectionData.error.forEach(errorArray => {
          errorArray.forEach(connection => {
            const targetNodeId = nodeNameToId.get(connection.node);
            if (!targetNodeId) return;

            const targetMermaidId = this.nodeIdMap.get(targetNodeId);
            if (!targetMermaidId) return;

            result += `    ${sourceMermaidId} -.->|error| ${targetMermaidId}\n`;
          });
        });
      }
    });

    return result;
  }

  /**
   * Get condition label for edge
   */
  getConditionLabel(nodeName, outputIndex) {
    const labels = ['Yes', 'No', 'True', 'False', 'Success', 'Error'];
    return labels[outputIndex] || `Output ${outputIndex + 1}`;
  }

  /**
   * Add styling based on node types
   */
  addStyling(nodes) {
    let styling = '\n';
    
    // Group nodes by type for styling
    const triggerNodes = [];
    const actionNodes = [];
    const conditionNodes = [];
    const errorNodes = [];

    nodes.forEach(node => {
      const mermaidId = this.nodeIdMap.get(node.id);
      if (!mermaidId) return;

      const type = node.type || '';
      
      if (type.includes('trigger') || type.includes('webhook')) {
        triggerNodes.push(mermaidId);
      } else if (type.includes('if') || type.includes('switch') || type.includes('condition')) {
        conditionNodes.push(mermaidId);
      } else if (type.includes('error') || type.includes('catch')) {
        errorNodes.push(mermaidId);
      } else {
        actionNodes.push(mermaidId);
      }
    });

    // Add class definitions
    if (triggerNodes.length > 0) {
      styling += `    classDef trigger fill:#4caf50,stroke:#2e7d32,color:#fff\n`;
      styling += `    class ${triggerNodes.join(',')} trigger\n`;
    }

    if (actionNodes.length > 0) {
      styling += `    classDef action fill:#2196f3,stroke:#1565c0,color:#fff\n`;
      styling += `    class ${actionNodes.join(',')} action\n`;
    }

    if (conditionNodes.length > 0) {
      styling += `    classDef condition fill:#ff9800,stroke:#e65100,color:#fff\n`;
      styling += `    class ${conditionNodes.join(',')} condition\n`;
    }

    if (errorNodes.length > 0) {
      styling += `    classDef error fill:#f44336,stroke:#c62828,color:#fff\n`;
      styling += `    class ${errorNodes.join(',')} error\n`;
    }

    return styling;
  }
}

module.exports = N8NToMermaidConverter;

