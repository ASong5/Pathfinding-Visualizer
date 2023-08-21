import { ALGOS } from "../Grid";
import { MinPriorityQueue } from "@datastructures-js/priority-queue";

const DIRECTIONS = [
  [0, 1],
  [-1, 0],
  [1, 0],
  [0, -1],
];

const heuristic = (node, endNode) => {
  // heuristic uses manhattan distance
  let dx = Math.abs(node[0] - endNode[0]);
  let dy = Math.abs(node[1] - endNode[1]);

  return dx + dy;
};

const isVisited = (visited, neighbour) => {
  for (let i = 0; i < visited.length; i++) {
    if (visited[i][0] === neighbour[0] && visited[i][1] === neighbour[1]) {
      return true;
    }
  }
  return false;
};

const getNeighbours = (grid, node, gridSize, unvisited = []) => {
  const [row, col] = node;
  const neighbours = [];

  for (const [dRow, dCol] of DIRECTIONS) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (
      newRow >= 0 &&
      newRow < gridSize &&
      newCol >= 0 &&
      newCol < gridSize &&
      !isVisited(unvisited, [newRow, newCol]) &&
      !grid[newRow][newCol].isWall
    ) {
      neighbours.push([newRow, newCol]);
    }
  }

  return neighbours;
};

export const runAlgo = (algo, grid, gridSize, startNode, endNode) => {
  let result = {};

  switch (algo) {
    case ALGOS.bfs:
      result = execBFS(grid, gridSize, startNode, endNode);
      break;
    case ALGOS.dfs:
      let path = [];
      result = execDFS(grid, gridSize, startNode, endNode, path);
      result.shortestPath = path;
      break;
    case ALGOS.dijkstra:
      result = execDijkstras(grid, gridSize, startNode, endNode);
      break;
    case ALGOS.aStar:
      result = execAStar(grid, gridSize, startNode, endNode);
      break;
    default:
      result.success = false;
  }
  return result;
};

const execBFS = (grid, gridLength, startNode, endNode) => {
  let queue = [];
  let visited = [];

  visited.push(startNode);
  queue.push(startNode);

  while (queue.length > 0) {
    let currNode = queue.shift();
    // extract the shortest path
    if (currNode[0] === endNode[0] && currNode[1] === endNode[1]) {
      let path = [];
      let currentNode = endNode;
      while (
        currentNode[0] !== startNode[0] ||
        currentNode[1] !== startNode[1]
      ) {
        path.unshift(currentNode);
        currentNode = grid[currentNode[0]][currentNode[1]].parent;
        if (!currentNode) break;
      }
      return { success: true, visited: visited, shortestPath: path };
    }

    let neighbours = getNeighbours(grid, currNode, gridLength);

    neighbours.forEach((neighbour) => {
      if (!isVisited(visited, neighbour)) {
        queue.push(neighbour);
        visited.push(neighbour);
        grid[neighbour[0]][neighbour[1]].parent = currNode;
      }
    });
  }
  return { success: false };
};

const execDFS = (grid, gridLength, startNode, endNode, visited) => {
  let stack = [];

  stack.push(startNode);

  while (stack.length > 0) {
    let currentNode = stack.pop();

    if (currentNode[0] === endNode[0] && currentNode[1] === endNode[1]) {
      return { success: true };
    }

    if (!isVisited(visited, currentNode)) {
      visited.push(currentNode);
      let neighbours = getNeighbours(grid, currentNode, gridLength);
      stack.push(...neighbours);
    }
  }

  return { success: false };
};

const execDijkstras = (grid, gridLength, startNode, endNode) => {
  let nodeMap = {};
  let visited = [];
  let gScore = {};
  let unvisited = new MinPriorityQueue((node) => gScore[node] || Infinity);
  unvisited.push(startNode);
  gScore[startNode] = 0;

  while (!unvisited.isEmpty()) {
    let currNode = unvisited.pop();
    if (!isVisited(visited, currNode)) visited.push(currNode);
    if (currNode[0] === endNode[0] && currNode[1] === endNode[1]) {
      let path = [];
      let nodeInPath = endNode;

      while (nodeInPath[0] !== startNode[0] || nodeInPath[1] !== startNode[1]) {
        path.push(nodeInPath);
        nodeInPath = nodeMap[nodeInPath];
      }
      return { success: true, visited: visited, shortestPath: path.reverse() };
    }
    let neighbours = getNeighbours(grid, currNode, gridLength, visited);
    for (const neighbour of neighbours) {
      let newGScore = gScore[currNode] + grid[neighbour[0]][neighbour[1]].weight;
      if (!gScore.hasOwnProperty(neighbour) || newGScore < gScore[neighbour]) {
        nodeMap[neighbour] = currNode;
        gScore[neighbour] = newGScore;
        unvisited.push(neighbour);
      }
    }
  }

  return { success: false };
};


const execAStar = (grid, gridLength, startNode, endNode) => {
  let unvisitedQueue = new MinPriorityQueue(
    (node) => fScore[node]
  );
  unvisitedQueue.push(startNode);
  let visited = [];
  let nodeMap = {};
  let gScore = {};
  let fScore = {};

  gScore[startNode] = 0;
  fScore[startNode] = heuristic(startNode, endNode);

  while (!unvisitedQueue.isEmpty()) {
    let currNode = unvisitedQueue.pop();
    if (!isVisited(visited, currNode)) visited.push(currNode);
    if (currNode[0] === endNode[0] && currNode[1] === endNode[1]) {
      let path = [];
      let nodeInPath = endNode;

      while (nodeInPath[0] !== startNode[0] || nodeInPath[1] !== startNode[1]) {
        path.push(nodeInPath);
        nodeInPath = nodeMap[nodeInPath];
      }
      return { success: true, visited: visited, shortestPath: path.reverse() };
    }
    let neighbours = getNeighbours(grid, currNode, gridLength);
    for (const neighbour of neighbours) {
      let tentativeGScore =
        gScore[currNode] + grid[neighbour[0]][neighbour[1]].weight;
      if (!gScore.hasOwnProperty(neighbour)) gScore[neighbour] = Infinity;
      if (tentativeGScore < gScore[neighbour]) {
        nodeMap[neighbour] = currNode;
        gScore[neighbour] = tentativeGScore;
        fScore[neighbour] = tentativeGScore + heuristic(neighbour, endNode);

        let found = unvisitedQueue
          .toArray()
          .some((node) => node[0] === neighbour[0] && node[1] === neighbour[1]);

        if (!found) {
          unvisitedQueue.push(neighbour);
        }
      }
    }
  }
  return { success: false };
};
