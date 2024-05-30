const axios = require("axios").default;
const cheerio = require("cheerio");
const cron = require('node-cron');
const {fetchAllResults} = require('../index');


let cronJob;
/**
 * 
 * @param {import("discord.js").Client} bot 
 */
const checkExamResult = async (bot) => {

    const sem = '4';

    var options = {
        method: 'POST',
        url: 'https://charusat.edu.in:912/Uniexamresult/frmUniversityResult.aspx',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
            __LASTFOCUS: '',
            __EVENTTARGET: 'ddlSem',
            __EVENTARGUMENT: '',
            __VIEWSTATE: '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',
            __VIEWSTATEGENERATOR: 'B051A224',
            ddlInst: '1',
            ddlDegree: '39',
            ddlSem: sem,
            ddlScheduleExam: '0',
            txtEnrNo: ''
        }
    };

    axios.request(options).then(async function (response) {
        const $ = cheerio.load(response.data);

        // Array to store exam options
        let exams = [];

        // Select the dropdown menu for exams and iterate over its options
        $('#ddlScheduleExam option').each((index, element) => {
            // Extract value and text of each option
            const value = $(element).attr('value');
            const text = $(element).text().trim();

            // Add the extracted data to the array
            exams.push({ value, text });
        });
        console.log(exams)
        if (exams[1].text.includes('2024')) {
            console.log("result declared")
            const channel = await bot.channels.fetch('1245662669952782450')
            channel.send('Result Declared')
            const yogi = await bot.users.fetch('772342884325916694')
            yogi.send('Result Declared')
            fetchAllResults(bot, sem, exams[1].value)
            cronJob.stop();
        }
        else
        {
            const channel = await bot.channels.fetch('1245662669952782450')
            channel.send('Result not Declared')
        }

    }).catch(function (error) {
        console.error(error);
    });
}


module.exports = (bot) => {
    cronJob = cron.schedule('*/1 * * * *', () => {
        checkExamResult(bot);
    });
}