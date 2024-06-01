const axios = require("axios").default;
const cheerio = require("cheerio");
const pdf = require('html-pdf');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {WebhookClient} = require('discord.js');

class checkExamResult {
    static statusChannel = new WebhookClient({ url: process.env.STATUS_WEBHOOK_URL});
    static failedChannel = new WebhookClient({ url: process.env.FAILED_WEBHOOK_URL});
    static declaredChannel = new WebhookClient({ url: process.env.DECLARED_WEBHOOK_URL});
    static completed = 0;
    static enrollmentNumbers = Array.from({ length: 140 }, (_, i) => {
        if (i < 9) return `22ce00${i + 1}`;
        if (i < 99) return `22ce0${i + 1}`;
        if (i <= 140) return `22ce${i + 1}`;
        return `d21ce${i + 1}`;
    });
    static cronJob;

    static start = async () => {
        setInterval(async () => {
            await this.checkExamResultDeclared();
        }, 60000);
    }

    /**
     * 
     * @param {string} message 
     */
    static sendStatusMessage = async (message) => {
        await this.statusChannel.send(message);
    }

    static sendDeclaredMessage = async () => {
        await this.declaredChannel.send(`@everyone Result declared`);
    }

    /**
     * 
     * @param {string} enrollmentNumber 
     */
    static sendFailedMessage = async (enrollmentNumber) => {
        await this.failedChannel.send(`Result not declared for enrollment number: ${enrollmentNumber}`);
    }

    /**
     * 
     * @param {string} enrollmentNumber 
     * @param {string} sem 
     * @param {string} examNo 
     * @returns 
     */
    static fetchResult = async (enrollmentNumber, sem, examNo) => {
        let retries = 0;
        let failed = false;
        do {

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
                    },
                    timeout: 60000
                };

                const response = await axios.request(options);

                const $ = cheerio.load(response.data);

                // Student Name
                const studentName = $('#uclGrd1_lblStudentName').text().trim();
                const sgpa = $('#uclGrd1_lblSGPA').text().trim();
                const cgpa = $('#uclGrd1_lblCGPA').text().trim();

                if (studentName === '' || sgpa === '' || cgpa === '') {
                    this.sendFailedMessage(enrollmentNumber);
                    console.log("Result not declared for enrollment number:", enrollmentNumber);
                    return;
                }

                await prisma.student.upsert({
                    where: { id: enrollmentNumber },
                    create: {
                        id: enrollmentNumber,
                        name: studentName,
                        sgpa: parseFloat(sgpa),
                        cgpa: parseFloat(cgpa)
                    },
                    update: {
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
                            id: `${enrollmentNumber}-${courseCode.replaceAll(' ', '')}`,
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

                pdf.create(response.data, { orientation: 'landscape', format: 'A3', childProcessOptions: {
                    env: {
                        OPENSSL_CONF: '/dev/null',
                    }
                } }).toFile(`./results/${enrollmentNumber}.pdf`, function (err, res) {
                    if (err) return console.log(err);
                });

                await prisma.$transaction(
                    courses.map(course => prisma.subjectResult.upsert({ where: { id: course.id }, create: course, update: course }))
                );

                this.completed++;

                await this.sendStatusMessage(`Fetching All Results: ${this.completed}/${this.enrollmentNumbers.length} completed - fetched for ${enrollmentNumber}`);
                failed = false;
                console.log("Result fetched successfully for enrollment number:", enrollmentNumber);
            } catch (error) {
                failed = true;
                retries++;
                await this.sendFailedMessage(enrollmentNumber);

                console.log(error.message)
                console.log("Error fetching result for enrollment number:", enrollmentNumber);
            }
        } while (failed && retries < 3)
    }

    /**
     * 
     * @param {string} sem 
     * @param {string} examNo 
     */
    static fetchAllResults = async (sem, examNo) => {
        const batchSize = 10;

        for (let i = 0; i < this.enrollmentNumbers.length; i += batchSize) {
            const batch = this.enrollmentNumbers.slice(i, i + batchSize);
            await Promise.all(batch.map(num => this.fetchResult(num, sem, examNo)));
        }

        await this.sendStatusMessage(`Fetching All Results: ${this.completed}/${this.enrollmentNumbers.length} completed`);
    }

    /**
     * 
     * @param {import('telegraf').Telegraf} bot 
     */
    static checkExamResultDeclared = async () => {
        await this.sendStatusMessage("Checking result");
        console.log("Checking result")
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
            },
            timeout: 60000
        };

        axios.request(options).then(async response => {
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
            if (exams[1].text.includes('2024')) {
                console.log("result declared")

                await this.sendDeclaredMessage("Result Declared")

                await prisma.isDeclared.upsert({
                    where: { id: 1 },
                    create: {
                        id: 1,
                        declared: true
                    },
                    update: {
                        declared: true
                    }
                });

                this.fetchAllResults(sem, exams[1].value)

                if (this.cronJob)
                    this.cronJob.stop();
            }
            else {
                console.log("Result not declared")
                await this.sendStatusMessage("Result not Declared")
            }

        }).catch(function (error) {
            console.error(error);
        });
    }
}
checkExamResult.start();