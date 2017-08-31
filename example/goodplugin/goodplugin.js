module.exports = {
    start : function (config, imports) {
        const reducer = function (state, action) {
            switch (action.type) {
                case "HELLO" :
                    let actionStuff = action.actionStuff;
                    return {...state, actionStuff};
                default:
                    return state;
            }
        };

        let exports = {"hello": "test", "goodpluginthing": 1};

        const sagas = [];

        function action1(actionStuff) {
            return {type: "HELLO", actionStuff}
        }

        function action2(actionStuff, goodStuff) {
            return {type: "HELLO2", actionStuff, goodStuff};
        }


        const actions = [action1, action2];


        return {
                reducer,
                sagas,
                actions,
        }

    },
    install : function(imports){
    },
    uninstall : function(config, imports){
    }
}