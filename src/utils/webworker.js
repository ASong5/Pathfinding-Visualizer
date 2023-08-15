import { runAlgo } from "./algorithms";

onmessage = (e) => {
  const { algo, grid, gridSize, startNode, endNode } = e.data;

  const result = runAlgo(algo, grid, gridSize, startNode, endNode);

  postMessage(result);
};