let run = function*(config, provide){
    let cats = [
        {name: "Whiskers", species: "Cat", breed : "Longhair"},
        {name: "PooMaker", species: "Cat", breed : "Cheetah"},
        {name: "Mr. Bogglesworth", species: "Cat", breed : "Main Coon"}]
    yield provide( {
        animal : cats
    });
}

export {run};