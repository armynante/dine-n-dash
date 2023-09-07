import inquirer from 'inquirer';
import ora from 'ora';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import DatePrompt from 'inquirer-date-prompt';
import dotenv from 'dotenv';
import { AuthHelpers, TimeHelpers, Types } from 'diner-utilities';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
inquirer.registerPrompt('date', DatePrompt);

dotenv.config();

const HOST = process.env.HOST || 'https://nxy3qkvysgdtkjefwu3vjggn5i0qjgsp.lambda-url.us-east-1.on.aws';

const searchResy = async () => {
    const spinner = ora();
    try { 

        const token = await AuthHelpers.getToken() as string;

        if (!token) {
            console.log('Please login first');
            return;
        }
        
        const restaurantQuestions = await inquirer.prompt([
            {
                type: 'input',
                name: 'venueName',
                message: 'What is the restaurant name?',
            }
        ]);

        spinner.text = 'Searching Resy 🔍';
        spinner.start();
        const { data:resyData} = await axios
            .get(`${HOST}/resy/search?venueName=${restaurantQuestions.venueName}`,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
        spinner.stop();
        

        const { option } = await inquirer.prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Select the option to continue',
                choices: resyData.venues.map((place:Types.Venue, iDx:number) => {
                    return {
                        name: `${iDx + 1}. ${place?.name} in ${place.neighborhood} - ${place?.locality}`,
                        value: place
                    };
                })
            }
        ]);


        if (!option) {
            console.log('No restaurant found');
            return;
        }

        const seatings = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'seatings',
                message: 'Do you want to search for availability?',
                default: true,
            }
        ]);

        if (!seatings.seatings) {
            return;
        }


        const search = await inquirer.prompt([
            {
                type: 'date',
                name: 'date',
                message: 'What date are you looking for? (YYYY-MM-DD)',
                locale: 'en-US',
                format: { 
                    month: 'short',
                    hour: undefined,
                    minute: undefined,
                    weekday: 'short',
                },
                default: TimeHelpers.getNextFriday(new Date()),
            },
            {
                type: 'input',
                name: 'seats',
                message: 'How many seats?',
                default: 2,
            }
        ]);

        const start = new Date(search.date);
        const end = new Date(search.date);
        
        start.setHours(18, 0, 0, 0);
        end.setHours(22, 0, 0, 0);

        const timeOptions = await inquirer.prompt([
            {
                type: 'date',
                name: 'startTime',
                message: 'What is the start time?',
                locale: 'en-US',
                format: { 
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    month: undefined,
                    day: undefined,
                    year: undefined,
                },
                default: start,
            },
            {
                type: 'date',
                name: 'endTime',
                message: 'What is the end time?',
                locale: 'en-US',
                format: { 
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    month: undefined,
                    day: undefined,
                    year: undefined,
                },
                default: end,
            },
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Find tables?',
                default: true,
            }
        ]);

        if (!timeOptions.confirm) {
            console.log('No search performed');
            return;
        }

        spinner.text = 'Searching Resy 🔍';
        spinner.start();

        search.date.setHours(0, 0, 0, 0);

        const slug = {
            venue: {
                id: option.id,
                name: option.name,
                site: 'resy'
            },
            day: search.date,
            partySize: search.seats,
            startTime: timeOptions.startTime,
            endTime: timeOptions.endTime,
        };

        const { data:response} = await axios.get(`${HOST}/resy/seatings`, {
            data: slug,
            headers: {
                Authorization: token
            }
        });
        
        spinner.stop();

        // {
        //   bookingSiteId: 62836,
        //   venueName: 'Jōji',
        //   bookingSite: 'resy',
        //   availibleSlots: 1,
        //   slots: [
        //     {
        //       bookingData: [Object],
        //       endTime: '2023-08-04 23:15:00',
        //       partySize: 2,
        //       partySizeMax: 2,
        //       partySizeMin: 2,
        //       dateTime: '2023-08-04 20:45:00',
        //       startTime: '2023-08-04 20:45:00',
        //       tableType: 'Sushi bar',
        //       title: '8:45 pm',
        //       venue: [Object]
        //     }
        //   ]
        // }

        if (response.availibleSlots === 0) {
            console.log('No seatings found 😭');
            const { watch } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'watch',
                    message: 'Do you want to watch for availability?',
                    default: true,
                }
            ]);

            if (!watch) {
                return;
            }

            spinner.text = 'Creating Resy Watcher 🔍';
            spinner.start();

            await axios
                .post(`${HOST}/watch`, {...slug}, {
                    headers: {
                        Authorization: token
                    }
                });
            
            spinner.stop();
            console.log('Watcher created 🎉');
            return;
        }

        const { slot } = await inquirer.prompt([
            {
                type: 'list',
                name: 'slot',
                message: 'Select the slot to book',
                choices: response.slots.map((slot:Types.Seating, iDx:number) => {
                    return {
                        name: `${iDx + 1}. ${slot.title} - ${slot.tableType}`,
                        value: slot
                    };
                })
            }
        ]);

        const book = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'booking',
                message: 'Do you want to book the slot?',
                default: true,
            }
        ]);

        if (!book.booking) {
            return;
        }

        spinner.text = 'Booking table 🗓️\n';
        spinner.start();
        const { data:booking} = await axios
            .post(`${HOST}/resy/book`, {slot},
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
        spinner.stop();
        console.log('Booking successful 🎉');
        console.log(`Booking ID: ${booking.reservation_id}`);
        return;
    } catch (error) {
        console.log('Booking failed');
        spinner.stop();
        console.log(error);
    }
   
};

export default searchResy;