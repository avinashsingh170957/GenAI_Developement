const Ai_tools = [
{
    type : 'function',
    function : {
        name : 'Add_Expence',
        description : 'This use to add expence in expence data.',
        parameters : {
            type : 'object',
            required : [
                'params'
            ],
            properties : {
                name : {
                    type : 'string',
                    description : 'expence name'
                },
                expenceamount : {
                    type  : 'string',
                    description : 'expence amount'
                }
            }
        }
    },
    function : {
        name : 'Get_Expence',
        description : 'This use to expence data between two dates.',
        parameters : {
            type : 'object',
            required : [
                'params'
            ],
            properties : {
                from : {
                    type : 'string',
                    description : 'from date'
                },
                to : {
                    type  : 'string',
                    description : 'to date'
                }
            }
        }
    },
    function : {
        name : 'Total_Expence',
        description : 'This use to total expence data from database.',
    }
}
]
export default Ai_tools;