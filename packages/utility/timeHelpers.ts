
export function getNextFriday(date:Date) {
    // Create copy of date to mutate
    date = new Date(date);

    // Set to Friday this week
    date.setDate(date.getDate() + (5 - date.getDay()) % 7);

    // If date is past Friday, get next Friday
    if (date < new Date()) {
        date.setDate(date.getDate() + 7);
    }

    return date;
}

export function formatDate(date:Date) {

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;

}

export function formatTime(date:Date) {
  
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Add leading zero if needed
    if (hours < 10) hours = 0 + hours;
    if (minutes < 10) minutes = 0 + minutes;

    return `${hours}:${minutes}`;
}

export function setTime(start:string) {
    // set the time to match the argument
    // return a date object
    const [hour, minute] = start.split(':');
    const date = new Date();
    date.setHours(parseInt(hour));
    date.setMinutes(parseInt(minute));
    return date;
}


export function convertTo12Hour(time24:string) {
    const [hours, minutes] = time24.split(':');
    let hours12 = Number(hours);
    const ampm = hours12 >= 12 ? 'PM' : 'AM';

    hours12 = hours12 % 12 || 12;

    return `${hours12}:${minutes} ${ampm}`;
}

export function isTimeInRange(time:string, start:string, end:string) {

    // Convert times to 24-hour format
    const timeHours = time.includes('AM') 
        ? parseInt(time.split(':')[0]) 
        : parseInt(time.split(':')[0]) + 12;
  
    const startHours = start.includes('AM')
        ? parseInt(start.split(':')[0])
        : parseInt(start.split(':')[0]) + 12;

    const endHours = end.includes('AM') 
        ? parseInt(end.split(':')[0])
        : parseInt(end.split(':')[0]) + 12;

    // Check if time is between start and end
    return (timeHours >= startHours && timeHours <= endHours);
}




export function getResyData(url:string) {

    const parsedUrl = new URL(url);

    const pathParts = parsedUrl.pathname.split('/');

    const slug = pathParts[3];
    const city = pathParts[2];

    const urlParts = url.split('?');

    const name = slug.split('-').map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');

    return {
        slug,
        city, 
        url: urlParts[0],
        name
    };

}

export function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function splitDate(date:Date):{date:string, time:string} {

    // Create date object from input
    // Get date portion
    const datePart = date.toISOString().split('T')[0];

    // Get time portion  
    const timePart = date.toTimeString().split(' ')[0]; 

    return {
        date: datePart,
        time: timePart
    };

}
