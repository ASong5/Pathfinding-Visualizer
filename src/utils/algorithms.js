import { ALGOS } from "../Grid";

const isVisited = (visited, neighbour) => {
  for (let i = 0; i < visited.length; i++) {
    if (visited[i].toString() === neighbour.toString()) {
      return true;
    }
  }
  return false;
};

const getNeighbours = (node, gridSize) => {
  let neighbours = [];
  if (node[1] + 1 < gridSize) neighbours.push([node[0], node[1] + 1]);
  if (node[0] - 1 >= 0) neighbours.push([node[0] - 1, node[1]]);
  if (node[0] + 1 < gridSize) neighbours.push([node[0] + 1, node[1]]);
  if (node[1] - 1 >= 0) neighbours.push([node[0], node[1] - 1]);

  return neighbours;
};

export const runAlgo = (algo, grid, gridSize, startNode, endNode, visited) => {
  let result = {};

  switch (algo) {
    case ALGOS.bfs:
      result = execBFS(grid, gridSize, startNode, endNode, visited);
      break;
    case ALGOS.dfs:
      result = execDFS(grid, gridSize, startNode, endNode, visited);
      break;
    default:
      result.visited = visited;
      result.success = false;
  }
  return result;
};

const execBFS = (grid, gridLength, startNode, endNode, visited) => {
  let queue = [];

  visited.push(startNode);
  queue.push(startNode);

  while (queue.length > 0) {
    let currNode = queue.shift();
    if (currNode[0] === endNode[0] && currNode[1] === endNode[1]) return true;

    let neighbours = getNeighbours(currNode, gridLength);

    neighbours.forEach((neighbour) => {
      if (
        !isVisited(visited, neighbour) &&
        !grid[neighbour[0]][neighbour[1]].isWall
      ) {
        queue.push(neighbour);
        visited.push(neighbour);
        grid[neighbour[0]][neighbour[1]].parent = currNode;
      }
    });
  }
  return false;
};

const execDFS = (grid, gridLength, startNode, endNode, visited) => {
  if (startNode[0] === endNode[0] && startNode[1] === endNode[1]) {
    return true;
  }

  visited.push(startNode);

  let neighbours = getNeighbours(startNode, gridLength);

  for (let neighbour of neighbours) {
    if (
      !isVisited(visited, neighbour) &&
      !grid[neighbour[0]][neighbour[1]].isWall
    ) {
      if (execDFS(grid, gridLength, neighbour, endNode, visited)) {
        return true;
      }
    }
  }
  return false;
};
