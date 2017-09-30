import React from 'react';
import { Link } from 'react-router-dom'
import consume from "../pluginbot-react/src/consume";


const MenuItem = function(props){
    return(<li>
        <Link to={props.path}>{props.label}</Link>
    </li>)
}

let TopNavigation = function(props){
    let menuItems = props.services.topNav ? props.services.topNav.map(nav => {
        return <MenuItem {...nav}/>
    }) : [];
    return <div>
        <ul>
        {menuItems}
    </ul>
    </div>
}

TopNavigation = consume("topNav")(TopNavigation);


export {TopNavigation, MenuItem}