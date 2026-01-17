const months: { [id: string]: string } = {
    '01': "January",
    '02': "February",
    '03': "March",
    '04': "April",
    '05': "May",
    '06': "June",
    '07': "July",
    '08': "August",
    '09': "September",
    '10': "October",
    '11': "November",
    '12': "December"
}

export function formatDateString(csharpDateTime: string, formatSetting: 'year-month-day' | 'full') {
    const year = csharpDateTime.slice(0, 4);
    const month = csharpDateTime.slice(5, 7);
    const day = csharpDateTime.slice(8, 10);

    const hour = csharpDateTime.slice(11, 13)
    const minute = csharpDateTime.slice(14, 16);
    const second = csharpDateTime.slice(17, 19);

    switch(formatSetting){
        case 'year-month-day':
        return `${year} ${months[month]} ${day}`;
        case 'full':
        return `${year} ${months[month]} ${day}, ${hour}:${minute}:${second}`;
    }
}