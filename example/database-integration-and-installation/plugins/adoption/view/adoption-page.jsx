import React from 'react';
import consume from "pluginbot-react/src/consume"

let adoptionPage = function(props){
    if(props.services.animal){
        return <ul>{props.services.animal.map(animal => <li>{animal.name}<br/>{animal.breed}<br/>{animal.species}</li>)}</ul>
    }else{
        return <div>No animals to adopt</div>
    }
}


export default consume("animal")(adoptionPage)