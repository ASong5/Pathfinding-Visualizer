import React, { useReducer } from 'react';

const initialState = {
    fill_colour: "white",
    visited: 0,
    is_start: false,
    is_end: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "set_start": {
            return {
                ...state,
                is_start: true,
                fill_colour: "green",
            };
        }
        case "set_end": {
            return {
                ...state,
                is_end: true,
                fill_colour: "red",
            };
        }
        case "set_wall": {
            return {
                ...state,
                fill_colour: state.fill_colour === "white" ? "grey" : "white",
            };
        }
        case "reset_node": {
            return {
                ...state,
                fill_colour: "white"
            };
        }
        default:
            return state;
    }
}

export function Node({ startNode, endNode, is_mouse_down }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    if (startNode && !state.is_start) {
        dispatch({ type: "set_start" });
    } else if (endNode && !state.is_end) {
        dispatch({ type: "set_end" });
    }

    function handleOnMouseEnter() {
        if (is_mouse_down && (!state.is_start && !state.is_end)) {
            dispatch({ type: "set_wall" }); // Change cell color while dragging
        }
    }

    function handleOnMouseDown(){
        if(!state.is_start && !state.is_end){
            dispatch({ type: "set_wall" });
        }
    }

    function resetNode(){
        dispatch({type: "reset_node"});
    }

    return (
        <div
            className="node"
            style={{
                border: "1px solid black",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                position: "relative",
                backgroundColor: `${state.fill_colour}`,
            }}
            onMouseEnter={handleOnMouseEnter}
            onMouseDown={handleOnMouseDown}
        ></div>
    );
}
