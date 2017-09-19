import AdoptionPage from "./view/adoption-page.jsx"
let start = function(config, imports){

    return {
        topNav : {"path" : "/adoptions", "label" : "Adopt", "page":AdoptionPage}
    }
}

export  {start};

