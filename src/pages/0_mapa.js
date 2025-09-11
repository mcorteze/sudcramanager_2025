import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Datos de ejemplo (puedes reemplazarlo por tu API o JSON)
export const demoData = {
  nodes: [
    { id: "ana", name: "Ana", group: "Familia A" },
    { id: "luis", name: "Luis", group: "Familia A" },
    { id: "mario", name: "Mario", group: "Familia B" },
    { id: "sofia", name: "Sofía", group: "Familia B" },
    { id: "elena", name: "Elena", group: "Corte" },
    { id: "duque", name: "El Duque", group: "Corte" },
    { id: "mercader", name: "Mercader", group: "Ciudad" },
  ],
  links: [
    { source: "ana", target: "luis", label: "hermanos" },
    { source: "ana", target: "mario", label: "amistad" },
    { source: "luis", target: "sofia", label: "romance" },
    { source: "mario", target: "sofia", label: "primos" },
    { source: "elena", target: "duque", label: "consejera" },
    { source: "duque", target: "mercader", label: "negocios" },
    { source: "elena", target: "ana", label: "mentora" },
  ],
};

const PALETTE = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6", "#06b6d4", "#f97316", "#10b981", "#f43f5e", "#64748b"];

function colorForGroup(group, idxFallback) {
  if (!group) return PALETTE[idxFallback % PALETTE.length];
  const n = typeof group === "number" ? group : group.toString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
}

export default function PersonajesGraph({ data, width, height }) {
  const fgRef = useRef();
  const wrapperRef = useRef(null);

  const [hoverNode, setHoverNode] = useState(null);
  const [hoverLink, setHoverLink] = useState(null);
  const highlightNodes = useMemo(() => new Set(), []);
  const highlightLinks = useMemo(() => new Set(), []);

  if (hoverNode) {
    highlightNodes.add(hoverNode.id);
    data.links.forEach((l) => {
      if (l.source.id === hoverNode.id) highlightNodes.add(l.target.id);
      if (l.target.id === hoverNode.id) highlightNodes.add(l.source.id);
    });
  }
  if (hoverLink) {
    highlightLinks.add(hoverLink);
    highlightNodes.add(hoverLink.source.id);
    highlightNodes.add(hoverLink.target.id);
  }

  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.name || node.id;
    const isHighlighted = highlightNodes.has(node.id);
    const radius = isHighlighted ? 8 : 5;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = colorForGroup(node.group, node.index || 0);
    ctx.fill();

    if (hoverNode?.id === node.id) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#111827";
      ctx.stroke();
    }

    const fontSize = 12 / Math.sqrt(globalScale);
    ctx.font = `${fontSize}px Inter, system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#111827";
    ctx.fillText(label, node.x, node.y + radius + 2);
  };

  return (
    <div className="w-full h-full" ref={wrapperRef}>
      <ForceGraph2D
        ref={fgRef}
        width={width || 600}
        height={height || 400}
        graphData={data}
        backgroundColor="#fff"
        nodeCanvasObject={nodeCanvasObject}
        linkColor={(link) => (highlightLinks.has(link) ? "#111827" : "#CBD5E1")}
        linkWidth={(link) => (highlightLinks.has(link) ? 2 : 1)}
        onNodeHover={(node) => setHoverNode(node || null)}
        onLinkHover={(link) => setHoverLink(link || null)}
      />
    </div>
  );
}
