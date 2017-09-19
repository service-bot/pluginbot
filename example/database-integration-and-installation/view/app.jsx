import React from 'react';
import TopNav from "./top-nav.jsx";

export default function(props){
    return <div>
        <TopNav/>
        <br/>
        <br/>
        {props.children}
    </div>
}
