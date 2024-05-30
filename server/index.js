const axios = require("axios").default;
const pdf = require('html-pdf');
const cheerio = require("cheerio");
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

let completed = 0;
let msg;

const fetchResult = async (enrollmentNumber, bot, sem, examNo) => {
    try {
        var options = {
            method: 'POST',
            url: 'https://charusat.edu.in:912/Uniexamresult/frmUniversityResult.aspx',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                __EVENTTARGET: 'btnSearch',
                __VIEWSTATE: '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',
                ddlInst: '1',
                ddlDegree: '39',
                ddlSem: sem,
                ddlScheduleExam: examNo,
                txtEnrNo: enrollmentNumber
            }
        };
    
        const response = await axios.request(options);
    
        const $ = cheerio.load(response.data);

        // Student Name
        const studentName = $('#uclGrd1_lblStudentName').text().trim();
        const sgpa = $('#uclGrd1_lblSGPA').text().trim();
        const cgpa = $('#uclGrd1_lblCGPA').text().trim();
        console.log({ studentName, sgpa, cgpa })
        if(studentName === '' || sgpa === '' || cgpa === '') {
            const failedChannel = await bot.channels.fetch('1245662694531399690');
            failedChannel.send(`Result not declared for enrollment number: ${enrollmentNumber}`);
            console.log("Result not declared for enrollment number:", enrollmentNumber);
            return;
        }

        await prisma.student.create({
            data: {
                id: enrollmentNumber,
                name: studentName,
                sgpa: parseFloat(sgpa),
                cgpa: parseFloat(cgpa)
            }
        });

        const courses = [];
        $('#uclGrd1_grdResult tr').each((i, row) => {
            const $row = $(row);
            const $courseInfo = $row.find('td:first-child table');
            if ($courseInfo.length > 0) {
                const courseCode = $courseInfo.find('td:first-child span').text().trim();
                const courseName = $courseInfo.find('td:nth-child(2) span').text().trim();
                const pedagogyType = $courseInfo.find('td:last-child span').text().trim();
                const grade = $row.find('td:last-child span').text().trim().slice(-2);
                const credits = $row.find('td:nth-child(2) span').text().trim();

                const course = {
                    studentId: enrollmentNumber,
                    code: courseCode,
                    name: courseName,
                };

                if (pedagogyType.toLowerCase() === 'theory') {
                    course.theoryGrade = grade;
                } else if (pedagogyType.toLowerCase() === 'practical') {
                    course.practicalGrade = grade;
                }
                if ((courseCode.length === 0 || courseName.length === 0) && credits.length === 4) {
                    if (course.theoryGrade)
                        courses[courses.length - 1].theoryGrade = course.theoryGrade;

                    if (course.practicalGrade)
                        courses[courses.length - 1].practicalGrade = course.practicalGrade;
                }
                else if (courseCode && courseName) {
                    courses.push(course);
                }
            }
        });

        // pdf.create(response.data, { orientation: 'landscape', format: 'A3' }).toFile(`./results/${enrollmentNumber}.pdf`, function (err, res) {
        //     if (err) return console.log(err);
        // });

        await prisma.$transaction(
            courses.map(course => prisma.subjectResult.create({ data: course }))
        );

        completed++;

        msg.edit(`Fetching All Results: ${completed}/${enrollmentNumbers.length} completed\nFetching Result for Enrollment Number: ${enrollmentNumber}`)
        console.log("Result fetched successfully for enrollment number:", enrollmentNumber);
    } catch (error) {
        const failedChannel = await bot.channels.fetch('1245662694531399690');
        failedChannel.send(`Error fetching result for enrollment number: ${enrollmentNumber}`);
        console.log(error.message)
        console.log("Error fetching result for enrollment number:", enrollmentNumber);
    }
};

// Create an array of enrollment numbers
const enrollmentNumbers = Array.from({ length: 140 }, (_, i) => {
    if (i < 9) return `22ce00${i + 1}`;
    if (i < 99) return `22ce0${i + 1}`;
    if (i <= 140) return `22ce${i + 1}`;
    return `d21ce${i + 1}`;
});

// Fetch all results concurrently
/**
 * 
 * @param {import('discord.js').Client} bot 
 */
const fetchAllResults = async (bot, sem, examNo) => {
    const channel = await bot.channels.fetch('1245662669952782450')
    msg = await channel.send(`Fetching All Results: ${completed}/${enrollmentNumbers.length} completed`);
    await Promise.all(enrollmentNumbers.map(num => fetchResult(num, bot, sem, examNo)));
    msg.edit(`Fetching All Results: ${completed}/${enrollmentNumbers.length} completed`);
};

// fetchAllResults().then(() => {
//     console.log("All results fetched successfully");
// }).catch(err => {
//     console.error("Error fetching results:", err);
// });


module.exports = { fetchResult, fetchAllResults };