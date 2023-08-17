import { ALGOS } from "../Grid";

const DIRECTIONS = [
  [0, 1],
  [-1, 0],
  [1, 0],
  [0, -1],
];

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

const findNodeWithSmallestDistance = (nodeMap, visited) => {
  let smallestDistance = Infinity;
  let smallestNode = null;

  for (const [key, value] of nodeMap) {
    if (
      value.distance < smallestDistance &&
      !isVisited(visited, JSON.parse(key))
    ) {
      smallestDistance = value.distance;
      smallestNode = key;
    }
  }

  return smallestNode;
};

const getNeighbourDistances = (grid, neighbours) => {
  let neighbourDistances = new Map();
  neighbours.forEach((neighbour) => {
    neighbourDistances.set(
      JSON.stringify(neighbour),
      grid[neighbour[0]][neighbour[1]].weight
    );
  });
  return neighbourDistances;
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
  let nodeMap = new Map();
  let visited = [];
  let unvisited = [];

  for (let row = 0; row < gridLength; row++) {
    for (let col = 0; col < gridLength; col++) {
      if (!grid[row][col].isWall) {
        unvisited.push([row, col]);
        nodeMap.set(JSON.stringify([row, col]), {
          distance: Infinity,
          prev: null,
        });
      }
    }
  }

  let currNode = startNode;
  nodeMap.set(JSON.stringify(currNode), { distance: 0, prev: null });

  while (unvisited.length !== 0) {
    let neighbourDistances = getNeighbourDistances(
      grid,
      getNeighbours(grid, currNode, gridLength, visited)
    );
    // update neighbour's shortest distance in nodeMap
    for (const [key, val] of neighbourDistances) {
      let oldNodeDistance = nodeMap.get(key).distance;
      let newNodeDistance =
        val + nodeMap.get(JSON.stringify(currNode)).distance;
      if (newNodeDistance <= oldNodeDistance) {
        nodeMap.set(key, {
          distance: newNodeDistance,
          prev: currNode,
        });
      }
    }

    visited.push(currNode);
    if (currNode[0] === endNode[0] && currNode[1] === endNode[1]) {
      let path = [];
      let nodeInPath = endNode;
      while (nodeInPath[0] !== startNode[0] || nodeInPath[1] !== startNode[1]) {
        path.push(nodeInPath);
        nodeInPath = nodeMap.get(JSON.stringify(nodeInPath)).prev;
      }
      return { success: true, visited: visited, shortestPath: path.reverse() };
    }
    unvisited.splice(
      unvisited.findIndex(
        (node) => node[0] === currNode[0] && node[1] === currNode[1]
      ),
      1
    );
    currNode = JSON.parse(findNodeWithSmallestDistance(nodeMap, visited));
  }

  return { success: false };
};
