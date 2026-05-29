async function GetExpence(expenceData, filterType, value) {

    console.log(`data`,expenceData,filterType,value);
    
    switch (filterType) {

        case "monthly":
            return expenceData.filter(item => {
                const date = new Date(item.expense_date);
                const month =
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

                return month === value;
            });

        case "yearly":
            return expenceData.filter(item => {
                const year = new Date(item.expense_date).getFullYear();
                return String(year) === value;
            });

        case "date_wise":
            return expenceData.filter(item => {
                const date =
                    new Date(item.expense_date).toISOString().split("T")[0];

                return date === value;
            });

        default:
            throw new Error("Invalid filterType");
    }
}

export default GetExpence;