import AdoptionPage from "./view/adoption-page.jsx"
let run = function*(config, provide){
    console.log("PROVDIN!");
    yield provide( {
        topNav : {"path" : "/adoptions", "label" : "Adopt", "page":AdoptionPage}
    })
}

export  {run};

