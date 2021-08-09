var reporter = require('cucumber-html-reporter');

var options = {
        theme: 'bootstrap',
        jsonFile: 'tests/report/cucumber_report.json',
        output: 'tests/report/cucumber_report.html',
        scenarioTimestamp: true,
        reportSuiteAsScenarios: true,
        scenarioTimestamp: true,
        launchReport: true,
        metadata: {
            "Ocis Version":"1.9.0",
            "Web Version":"4.0.0",
            "Test Environment": "docker",
            "Browser": "Chrome  54.0.2840.98",
            "Platform": "MacOs Big Sure v11.4",
            "Parallel": "Scenarios",
            "Executed": "Remote"
        }
    };

    reporter.generate(options);
