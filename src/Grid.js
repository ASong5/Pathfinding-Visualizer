import React, { useReducer, Button } from 'react';
import { Node } from './Node';

function reducer(state, action) {
    switch (action.type) {
        case "resize_rows": {
            return {
                ...state,
                num_rows: action.num_rows,
            };
        }
        case "resize_cols": {
            return {
                ...state,
                num_cols: action.num_cols,
            };
        }
        case "set_mouse_up_down": {
            return {
                ...state,
                is_mouse_down: !state.is_mouse_down
            };
        }
        default:
            return state;
    }
}

const initialState = {
    num_rows: 30,
    num_cols: 50,
    is_mouse_down: false,
};

export function Grid() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const grid = [];
    for (let i = 0; i < state.num_rows; i++) {
        const row = []
        for (let j = 0; j < state.num_cols; j++) {
            if (i === state.num_rows / 2 && j === 0)
                row.push(<Node key={`${i}-${j}`} startNode={true} endNode={false} is_mouse_down={state.is_mouse_down}/>);
            else if (i === state.num_rows / 2 && j === state.num_cols - 1)
                row.push(<Node key={`${i}-${j}`} startNode={false} endNode={true} is_mouse_down={state.is_mouse_down}/>);
            else
                row.push(<Node key={`${i}-${j}`} startNode={false} endNode={false} is_mouse_down={state.is_mouse_down}/>);
        }
        grid.push(row);
    }

    function handleOnMouseDown() {
        dispatch({ type: "set_mouse_up_down" });
    }
    function handleOnMouseUp() {
        dispatch({ type: "set_mouse_up_down" });
    }
    function clearGrid(){
        // todo
    }

    return (
        <div
            className="grid-container"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                userSelect: "none"
            }}
            onMouseDown={handleOnMouseDown}
            onMouseUp={handleOnMouseUp}
        >
            <div
                className="grid"
                style={{
                    border: "1px solid black",
                    display: "grid",
                    gridTemplateColumns: `repeat(${state.num_cols}, 1fr)`,
                    gridTemplateRows: `repeat(${state.num_rows}, 1fr)`,
                    width: `calc(75vw)`,
                    height: `calc(75vh)`,
                }}

            >
                {grid}
            </div>
            <button onClick={clearGrid}>Clear Grid</button>
        </div>
    );
}
