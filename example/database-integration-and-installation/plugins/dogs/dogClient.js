let run = function*(config, provide){

    let dogs = [
        {name: "Humphrey", species: "Dog", breed : "Poodle"},
        {name: "Brandon", species: "Dog", breed : "Pug"},
        {name: "Banjo", species: "Dog", breed : "Corgi"}]
    yield provide({
        animal : dogs
    });
}

export {run};
