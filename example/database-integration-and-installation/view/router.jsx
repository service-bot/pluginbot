import React from 'react';
import {render} from 'react-dom';
import { Router, Route } from 'react-router';
import consume from "../pluginbot-react/src/consume";
import Home from "./home.jsx"
import {TopNavigation} from "./top-nav.jsx";
import createBrowserHistory from 'history/createBrowserHistory'

const history = createBrowserHistory()



let AppRouter = function(props){
return <Router history={history}>
    <div>
        <TopNavigation/>
        <Route name="Home" path="/" component={Home}/>
        {props.services.topNav && props.services.topNav.map(entry => <Route name={entry.label} path={entry.path} component={entry.page}/>)}
    </div>
</Router>
}
export default consume("topNav")(AppRouter)