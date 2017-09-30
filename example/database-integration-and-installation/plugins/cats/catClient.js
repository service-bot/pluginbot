import CatPage from "./view/catPage";
let run = function*(config, provide){
    console.log("IMA CAT!!!!!!");
    let cats = [
        {name: "Whiskers", species: "Cat", breed : "Longhair"},
        {name: "PooMake23r", species: "Cat", breed : "Cheetah"},
        {name: "Mr. Bogglesworth", species: "Cat", breed : "Main Coon"}]
    yield provide( {
        animal : cats,
        topNav :  {"path" : "/cat", "label" : "Cat!", "page": CatPage}
    });
}

export {run};