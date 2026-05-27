const tools = [
    {
        type : 'function',
        function : {
            name : 'Get_Weather',
            discription : 'this function return real time weather details',
            parameters : {
                type : 'object',
                required : ['params'],
                properties : {
                    city : {
                        type : 'string',
                        description : 'city name required',
                    }
                }
            }
        }
    },
    {
        type : 'function',
        function : {
            name : 'Get_Goldprice',
            discription : 'this function return real time gold price details',
            parameters : {
                type : 'object',
                required : ['params'],
                properties : {
                    city : {
                        type : 'string',
                        description : 'country name required',
                    }
                }
            }
        }
    }
];

export default tools;