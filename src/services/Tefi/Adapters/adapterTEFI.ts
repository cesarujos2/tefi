
export type AdaptedData = {
    [key in keyof Namevaluelist]: Namevaluelist[key]['value'];
};

function adapterTEFI(data: Fitac): AdaptedData[] {
    const adaptedDataArray: AdaptedData[] = [];
    
    if (data.entry_list.length === 0) return adaptedDataArray;
    
    for (const entry of data.entry_list) {
        const valueList = entry.name_value_list;
        const dataAdapted: AdaptedData = {} as AdaptedData;

        for (const item of Object.keys(valueList) as (keyof typeof valueList)[]) {
            dataAdapted[item] = valueList[item].value.trim();
        }

        adaptedDataArray.push(dataAdapted);
    }

    return adaptedDataArray;
}

export default adapterTEFI;
